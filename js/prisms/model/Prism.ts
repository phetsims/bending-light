// Copyright 2015-2021, University of Colorado Boulder

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

    // @public
    this.shapeProperty = new Property( shape );

    // @public - overall translation
    this.positionProperty = new Vector2Property( new Vector2( 0, 0 ) );

    // @public (read-only)
    this.typeName = typeName;
  }

  /**
   * Translate prism by the specified amount
   * @public
   * @param {number} deltaX - amount of space in x direction the prism to be translated
   * @param {number} deltaY - amount of space in y direction the prism to be translated
   */
  translate( deltaX: number, deltaY: number ) {
    this.positionProperty.value = this.positionProperty.value.plusXY( deltaX, deltaY );
  }

  // @private
  getTranslatedShape() {
    return this.shapeProperty.value.getTranslatedInstance( this.positionProperty.value.x, this.positionProperty.value.y );
  }

  /**
   * Compute the intersections of the specified ray with this polygon's edges
   * @public
   * @param {ColoredRay} incidentRay - model of the ray
   * @returns {Array}
   */
  getIntersections( incidentRay: ColoredRay ) {
    return this.getTranslatedShape().getIntersections( incidentRay );
  }

  /**
   * Determines whether shape contains given point or not
   * @public
   * @param {Vector2} point
   * @returns {boolean}
   */
  contains( point: Vector2 ) {
    return this.getTranslatedShape().containsPoint( point );
  }

  /**
   * Creates a copy of the prism
   * @public
   * @returns {Prism}
   */
  copy() {
    return new Prism( this.shapeProperty.get(), this.typeName );
  }

  /**
   * Rotate prism by the specified angle
   * @public
   * @param {number} deltaAngle - angle to be rotated
   */
  rotate( deltaAngle: number ) {
    this.shapeProperty.set( this.shapeProperty.get().getRotatedInstance( deltaAngle, this.shapeProperty.get().getRotationCenter() ) );
  }
}

bendingLight.register( 'Prism', Prism );

export default Prism;