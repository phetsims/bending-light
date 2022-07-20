// Copyright 2015-2022, University of Colorado Boulder

/**
 * Shape that comprises a prism.
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

class SemiCircle {
  private readonly points: Vector2[];
  private readonly referencePointIndex: number;
  private readonly radius: number;
  private center: Vector2;
  public centroid: Vector2;
  public shape: Shape;

  /**
   * @param referencePointIndex - is used as the drag handle corner for rotation
   * @param points - corner points
   * @param radius - radius of semicircle
   */
  public constructor( referencePointIndex: number, points: Vector2[], radius: number ) {

    this.points = points;

    // Index for the point used as the "reference" point, which is used as the drag handle corner for rotation
    this.referencePointIndex = referencePointIndex;
    this.radius = radius;
    this.center = this.points[ 0 ].plus( this.points[ 1 ] ).multiplyScalar( 0.5 ); // (read-only)
    this.centroid = this.center;

    // Creates a shape
    const startAngle = Math.atan2( this.center.y - this.points[ 1 ].y, this.center.x - this.points[ 1 ].x );

    // (read-only) - the shape of the semi-circle
    this.shape = new Shape()
      .ellipticalArcPoint( this.center, this.radius, this.radius, 0, startAngle, startAngle + Math.PI, false )
      .close();
  }

  /**
   * Get the specified corner point
   * @param i - index of point
   */
  private getPoint( i: number ): Vector2 {
    return this.points[ i ];
  }

  /**
   * Create a new SemiCircle translated by the specified amount
   * @param deltaX - distance in x direction to be translated
   * @param deltaY - distance in y direction to be translated
   */
  public getTranslatedInstance( deltaX: number, deltaY: number ): SemiCircle {

    const newPoints = [];
    for ( let j = 0; j < this.points.length; j++ ) {

      // get new points after rotating
      newPoints.push( this.points[ j ].plusXY( deltaX, deltaY ) );
    }

    // create a new SemiCircle with rotated points
    return new SemiCircle( this.referencePointIndex, newPoints, this.radius );
  }

  /**
   * Gets a rotated copy of this SemiCircle
   * @param angle - angle to be rotated
   * @param rotationPoint - point around which semicircle to be rotated
   */
  public getRotatedInstance( angle: number, rotationPoint: Vector2 ): SemiCircle {
    const newPoints = [];
    for ( let k = 0; k < this.points.length; k++ ) {
      const vectorAboutCentroid = this.points[ k ].subtract( rotationPoint );
      const rotated = vectorAboutCentroid.rotate( angle );

      // get new points after rotating
      newPoints.push( rotated.add( rotationPoint ) );
    }

    // create a new SemiCircle with rotated points
    return new SemiCircle( this.referencePointIndex, newPoints, this.radius );
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
    return this.center;
  }

  /**
   * Compute the intersections of the specified ray with this polygon's edges
   * @param ray - model of the ray
   */
  public getIntersections( ray: ColoredRay ): Intersection[] {
    const segment = new Line( this.points[ 0 ], this.points[ 1 ] );
    const startAngle = Math.atan2( this.points[ 1 ].y - this.center.y, this.points[ 1 ].x - this.center.x );
    const arc = new Arc( this.center, this.radius, startAngle, startAngle + Math.PI, true );
    return PrismIntersection.getIntersections( [ segment ], arc, this.center, ray );
  }
}

bendingLight.register( 'SemiCircle', SemiCircle );

export default SemiCircle;