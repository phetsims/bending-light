// Copyright 2015-2022, University of Colorado Boulder

/**
 * Shape that comprises a prism. Immutable here but composed with a Property.<Polygon> in Prism for mutability.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Arc, Line, Shape } from '../../../../kite/js/imports.js';
import bendingLight from '../../bendingLight.js';
import PrismIntersection from './PrismIntersection.js';
import ColoredRay from './ColoredRay.js';
import Intersection from './Intersection.js';

class Polygon {
  private readonly points: Vector2[];
  private readonly referencePointIndex: number;
  private readonly radius: number;
  public readonly centroid: Vector2;
  public readonly shape: Shape;
  private readonly center: Vector2 | null;

  /**
   * @param referencePointIndex - index of reference point
   * @param points - array of corner points
   * @param radius - radius is 0 for polygon or radius for diverging lens
   */
  public constructor( referencePointIndex: number, points: Vector2[], radius: number ) {

    this.points = points;

    // Index for the point used as the "reference" point, which is used as the drag handle corner for rotation
    this.referencePointIndex = referencePointIndex;
    this.radius = radius;

    // (read-only), Centroid of the shape
    this.centroid = this.getCentroid( this.points );

    // Creates a shape
    this.shape = new Shape(); // (read-only)
    this.center = null; // (read-only)

    // radius is 0 for polygon
    if ( this.radius === 0 ) {
      this.shape.moveToPoint( this.points[ 0 ] );
      for ( let i = 1; i < this.points.length; i++ ) {
        this.shape.lineToPoint( this.points[ i ] );
      }
      this.shape.close();
    }
    else {

      // radius is nonzero for diverging lens
      this.center = this.points[ 0 ].plus( this.points[ 3 ] ).multiplyScalar( 0.5 );
      const startAngle = Math.atan2( this.center.y - this.points[ 3 ].y, this.center.x - this.points[ 3 ].x );
      this.shape.ellipticalArcPoint( this.center, this.radius, this.radius, 0, startAngle, startAngle + Math.PI, true )
        .lineToPoint( this.points[ 2 ] )
        .lineToPoint( this.points[ 1 ] )
        .lineToPoint( this.points[ 0 ] );
    }
  }

  /**
   * Get the specified corner point
   * @param i - index of point
   */
  private getPoint( i: number ): Vector2 {
    return this.points[ i ];
  }

  /**
   * Create a new Polygon translated by the specified amount
   * @param deltaX - distance in x direction to be translated
   * @param deltaY - distance in y direction to be translated
   */
  public getTranslatedInstance( deltaX: number, deltaY: number ): Polygon {

    const newPoints = [];
    for ( let j = 0; j < this.points.length; j++ ) {

      // get the new points after translating
      newPoints.push( this.points[ j ].plusXY( deltaX, deltaY ) );
    }

    // create a new polygon with translated points
    return new Polygon( this.referencePointIndex, newPoints, this.radius );
  }

  /**
   * Gets a rotated copy of this polygon
   * @param angle - angle to be rotated
   * @param rotationPoint - point around which polygon to be rotated
   */
  public getRotatedInstance( angle: number, rotationPoint: Vector2 ): Polygon {
    const newPoints = [];
    for ( let k = 0; k < this.points.length; k++ ) {
      const vectorAboutCentroid = this.points[ k ].subtract( rotationPoint );
      const rotated = vectorAboutCentroid.rotate( angle );

      // get the new points after rotating
      newPoints.push( rotated.add( rotationPoint ) );
    }

    // create a new polygon with rotated points
    return new Polygon( this.referencePointIndex, newPoints, this.radius );
  }

  /**
   * Determines whether shape contains given point or not
   */
  public containsPoint( point: Vector2 ): boolean {
    return this.shape.containsPoint( point );
  }

  /**
   * Just use the 0th point for the reference point for rotation drag handles
   */
  public getReferencePoint(): Vector2 {
    return this.getPoint( this.referencePointIndex );
  }

  /**
   * Computes the centroid of the corner points (e.g. the center of "mass" assuming the corner points have equal
   * "mass")
   */
  public getRotationCenter(): Vector2 {
    return this.centroid;
  }

  /**
   * Centroid of the polygon
   * @param p - array of corner points
   */
  private getCentroid( p: Vector2[] ): Vector2 {
    let cx = 0;
    let cy = 0;
    for ( let i = 0; i < p.length; i++ ) {
      const j = ( i + 1 ) % p.length;
      const n = ( ( p[ i ].x * p[ j ].y ) - ( p[ j ].x * p[ i ].y ) );
      cx += ( p[ i ].x + p[ j ].x ) * n;
      cy += ( p[ i ].y + p[ j ].y ) * n;
    }
    const a = this.getArea( p );
    const f = 1 / ( a * 6 );
    cx *= f;
    cy *= f;
    return new Vector2( cx, cy );
  }

  /**
   * Computes the area of a polygon using the algorithm described at http://www.mathopenref.com/coordpolygonarea2.html
   * Used to compute the centroid for a lens so it can be rotated about its center.
   * @param p - array of corner points
   */
  private getArea( p: Vector2[] ): number {
    let a = 0;
    for ( let i = 0; i < p.length; i++ ) {
      const j = ( i + 1 ) % p.length;
      a += ( p[ i ].x * p[ j ].y );
      a -= ( p[ j ].x * p[ i ].y );
    }
    a *= 0.5;
    return a;
  }

  /**
   * Compute the intersections of the specified ray with this polygon's edges
   * @param ray - model of the ray
   */
  public getIntersections( ray: ColoredRay ): Intersection[] {
    let arc = null;
    if ( this.radius !== 0 && this.center ) {
      const startAngle = Math.atan2( this.center.y - this.points[ 3 ].y, this.center.x - this.points[ 3 ].x );
      arc = new Arc( this.center, this.radius, startAngle, startAngle + Math.PI, true );
    }
    return PrismIntersection.getIntersections( this.getEdges(), arc, this.center!, ray );
  }

  /**
   * List all bounding edges in the polygon
   */
  private getEdges(): Line[] {
    const lineSegments = [];
    for ( let i = 0; i < this.points.length - 1; i++ ) {
      lineSegments.push( new Line( this.points[ i ], this.points[ i + 1 ] ) );
    }
    if ( this.radius === 0 ) {
      lineSegments.push( new Line( this.points[ this.points.length - 1 ], this.points[ 0 ] ) );
    }
    return lineSegments;
  }
}

bendingLight.register( 'Polygon', Polygon );

export default Polygon;