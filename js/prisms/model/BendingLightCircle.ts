// Copyright 2015-2021, University of Colorado Boulder

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

    this.center = center; // @public (read-only)
    this.centroid = center; // @public (read-only)
    this.radius = radius; // @public (read-only)
    this.shape = Shape.circle( this.center.x, this.center.y, this.radius ); // @public (read-only)
  }

  /**
   * Create a new Circle translated by the specified amount
   * @public
   * @param {number} deltaX - amount of space to be translate in x direction
   * @param {number} deltaY - amount of space to be translate in y direction
   * @returns {BendingLightCircle}
   */
  getTranslatedInstance( deltaX: number, deltaY: number ) {
    return new BendingLightCircle( this.center.plusXY( deltaX, deltaY ), this.radius );
  }

  // @public
  getRotatedInstance( angle: number, rotationCenter: Vector2 ) {
    return this;
  }

  /**
   * Finds the intersections between the edges of the circle and the specified ray
   * @public
   * @param {ColoredRay} ray - model of the ray
   * @returns {Array}
   */
  getIntersections( ray: ColoredRay ) {
    return PrismIntersection.getIntersections( [], this.shape, this.center, ray );
  }

  /**
   * Computes the centroid of the corner points
   * @public
   * @returns {Vector2}
   */
  getRotationCenter() {
    return this.center;
  }

  /**
   * Signify that the circle can't be rotated
   * @public
   * @returns {null}
   */
  getReferencePoint() {
    return null;
  }

  /**
   * Determines whether shape contains given point or not
   * @public
   * @param {Vector2} point
   * @returns {boolean}
   */
  containsPoint( point: Vector2 ) {
    return point.distance( this.center ) <= this.radius;
  }
}

bendingLight.register( 'BendingLightCircle', BendingLightCircle );

export default BendingLightCircle;