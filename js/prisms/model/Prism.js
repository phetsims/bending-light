// Copyright 2015-2020, University of Colorado Boulder

/**
 * Wrapper around a shape with convenience methods for computing intersections, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import bendingLight from '../../bendingLight.js';

class Prism {

  /**
   * @param {Polygon|Circle|SemiCircle} shape
   * @param {string} typeName for keeping track of how many of each kind there are, to remove from toolbox
   */
  constructor( shape, typeName ) {

    // @public
    this.shapeProperty = new Property( shape );

    // @public (read-only)
    this.typeName = typeName;
  }

  /**
   * Translate prism by the specified amount
   * @public
   * @param {number} deltaX - amount of space in x direction the prism to be translated
   * @param {number} deltaY - amount of space in y direction the prism to be translated
   */
  translate( deltaX, deltaY ) {
    this.shapeProperty.set( this.shapeProperty.get().getTranslatedInstance( deltaX, deltaY ) );
  }

  /**
   * Compute the intersections of the specified ray with this polygon's edges
   * @public
   * @param {ColoredRay} incidentRay - model of the ray
   * @returns {Array}
   */
  getIntersections( incidentRay ) {
    return this.shapeProperty.get().getIntersections( incidentRay );
  }

  /**
   * Determines whether shape contains given point or not
   * @public
   * @param {Vector2} point
   * @returns {boolean}
   */
  contains( point ) {
    return this.shapeProperty.get().containsPoint( point );
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
  rotate( deltaAngle ) {
    this.shapeProperty.set( this.shapeProperty.get().getRotatedInstance( deltaAngle, this.shapeProperty.get().getRotationCenter() ) );
  }
}

bendingLight.register( 'Prism', Prism );

export default Prism;