// Copyright 2015-2022, University of Colorado Boulder

/**
 * Circle implementation for use in prisms
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import bendingLight from '../../bendingLight.js';
import ColoredRay from './ColoredRay.js';
import Intersection from './Intersection.js';
import PrismIntersection from './PrismIntersection.js';

class BendingLightCircle {
  private readonly center: Vector2;
  public readonly centroid: Vector2;
  private readonly radius: number;
  public readonly shape: Shape;

  /**
   * @param center - center of the circle
   * @param radius - radius of the circle
   */
  public constructor( center: Vector2, radius: number ) {

    this.center = center; // (read-only)
    this.centroid = center; // (read-only)
    this.radius = radius; // (read-only)
    this.shape = Shape.circle( this.center.x, this.center.y, this.radius ); // (read-only)
  }

  /**
   * Create a new Circle translated by the specified amount
   * @param deltaX - amount of space to be translate in x direction
   * @param deltaY - amount of space to be translate in y direction
   */
  public getTranslatedInstance( deltaX: number, deltaY: number ): BendingLightCircle {
    return new BendingLightCircle( this.center.plusXY( deltaX, deltaY ), this.radius );
  }

  public getRotatedInstance( angle: number, rotationCenter: Vector2 ): this {
    return this;
  }

  /**
   * Finds the intersections between the edges of the circle and the specified ray
   * @param ray - model of the ray
   */
  public getIntersections( ray: ColoredRay ): Intersection[] {
    return PrismIntersection.getIntersections( [], this.shape, this.center, ray );
  }

  /**
   * Computes the centroid of the corner points
   */
  public getRotationCenter(): Vector2 {
    return this.center;
  }

  /**
   * Signify that the circle can't be rotated
   */
  public getReferencePoint(): null {
    return null;
  }

  /**
   * Determines whether shape contains given point or not
   */
  public containsPoint( point: Vector2 ): boolean {
    return point.distance( this.center ) <= this.radius;
  }
}

bendingLight.register( 'BendingLightCircle', BendingLightCircle );

export default BendingLightCircle;