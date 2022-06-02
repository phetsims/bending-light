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
  readonly center: Vector2;
  readonly centroid: Vector2;
  readonly radius: number;
  readonly shape: Shape;

  /**
   * @param {Vector2} center - center of the circle
   * @param {number} radius - radius of the circle
   */
  constructor( center: Vector2, radius: number ) {

    this.center = center; // (read-only)
    this.centroid = center; // (read-only)
    this.radius = radius; // (read-only)
    this.shape = Shape.circle( this.center.x, this.center.y, this.radius ); // (read-only)
  }

  /**
   * Create a new Circle translated by the specified amount
   * @param {number} deltaX - amount of space to be translate in x direction
   * @param {number} deltaY - amount of space to be translate in y direction
   */
  getTranslatedInstance( deltaX: number, deltaY: number ): BendingLightCircle {
    return new BendingLightCircle( this.center.plusXY( deltaX, deltaY ), this.radius );
  }

  getRotatedInstance( angle: number, rotationCenter: Vector2 ): this {
    return this;
  }

  /**
   * Finds the intersections between the edges of the circle and the specified ray
   * @param {ColoredRay} ray - model of the ray
   */
  getIntersections( ray: ColoredRay ): Intersection[] {
    return PrismIntersection.getIntersections( [], this.shape, this.center, ray );
  }

  /**
   * Computes the centroid of the corner points
   */
  getRotationCenter(): Vector2 {
    return this.center;
  }

  /**
   * Signify that the circle can't be rotated
   */
  getReferencePoint(): null {
    return null;
  }

  /**
   * Determines whether shape contains given point or not
   * @param {Vector2} point
   */
  containsPoint( point: Vector2 ): boolean {
    return point.distance( this.center ) <= this.radius;
  }
}

bendingLight.register( 'BendingLightCircle', BendingLightCircle );

export default BendingLightCircle;