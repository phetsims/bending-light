// Copyright 2015-2022, University of Colorado Boulder

/**
 * Wrapper around a shape with convenience methods for computing intersections, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import bendingLight from '../../bendingLight.js';
import BendingLightCircle from './BendingLightCircle.js';
import ColoredRay from './ColoredRay.js';
import Intersection from './Intersection.js';
import Polygon from './Polygon.js';
import SemiCircle from './SemiCircle.js';

class Prism {
  shapeProperty: Property<Polygon | BendingLightCircle | SemiCircle>;
  positionProperty: Vector2Property;
  typeName: string;

  /**
   * @param {Polygon|BendingLightCircle|SemiCircle} shape
   * @param {string} typeName for keeping track of how many of each kind there are, to remove from toolbox
   */
  constructor( shape: Polygon | BendingLightCircle | SemiCircle, typeName: string ) {

    this.shapeProperty = new Property( shape );

    // overall translation
    this.positionProperty = new Vector2Property( new Vector2( 0, 0 ) );

    // (read-only)
    this.typeName = typeName;
  }

  /**
   * Translate prism by the specified amount
   * @param {number} deltaX - amount of space in x direction the prism to be translated
   * @param {number} deltaY - amount of space in y direction the prism to be translated
   */
  translate( deltaX: number, deltaY: number ): void {
    this.positionProperty.value = this.positionProperty.value.plusXY( deltaX, deltaY );
  }

  getTranslatedShape(): Polygon | BendingLightCircle | SemiCircle {
    return this.shapeProperty.value.getTranslatedInstance( this.positionProperty.value.x, this.positionProperty.value.y );
  }

  /**
   * Compute the intersections of the specified ray with this polygon's edges
   * @param {ColoredRay} incidentRay - model of the ray
   * @returns {Array}
   */
  getIntersections( incidentRay: ColoredRay ): Intersection[] {
    return this.getTranslatedShape().getIntersections( incidentRay );
  }

  /**
   * Determines whether shape contains given point or not
   * @param {Vector2} point
   * @returns {boolean}
   */
  contains( point: Vector2 ): boolean {
    return this.getTranslatedShape().containsPoint( point );
  }

  /**
   * Creates a copy of the prism
   * @returns {Prism}
   */
  copy(): Prism {
    return new Prism( this.shapeProperty.get(), this.typeName );
  }

  /**
   * Rotate prism by the specified angle
   * @param {number} deltaAngle - angle to be rotated
   */
  rotate( deltaAngle: number ): void {
    this.shapeProperty.set( this.shapeProperty.get().getRotatedInstance( deltaAngle, this.shapeProperty.get().getRotationCenter() ) );
  }
}

bendingLight.register( 'Prism', Prism );

export default Prism;