// Copyright 2015-2019, University of Colorado Boulder

/**
 * Wrapper around a shape with convenience methods for computing intersections, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );

  /**
   * @param {Polygon|Circle|SemiCircle} shape
   * @param {string} typeName for keeping track of how many of each kind there are, to remove from toolbox
   * @constructor
   */
  function Prism( shape, typeName ) {

    // @public
    this.shapeProperty = new Property( shape );

    // @public (read-only)
    this.typeName = typeName;
  }

  bendingLight.register( 'Prism', Prism );

  return inherit( Object, Prism, {

    /**
     * Translate prism by the specified amount
     * @public
     * @param {number} deltaX - amount of space in x direction the prism to be translated
     * @param {number} deltaY - amount of space in y direction the prism to be translated
     */
    translate: function( deltaX, deltaY ) {
      this.shapeProperty.set( this.shapeProperty.get().getTranslatedInstance( deltaX, deltaY ) );
    },

    /**
     * Compute the intersections of the specified ray with this polygon's edges
     * @public
     * @param {ColoredRay} incidentRay - model of the ray
     * @returns {Array}
     */
    getIntersections: function( incidentRay ) {
      return this.shapeProperty.get().getIntersections( incidentRay );
    },

    /**
     * Determines whether shape contains given point or not
     * @public
     * @param {Vector2} point
     * @returns {boolean}
     */
    contains: function( point ) {
      return this.shapeProperty.get().containsPoint( point );
    },

    /**
     * Creates a copy of the prism
     * @public
     * @returns {Prism}
     */
    copy: function() {
      return new Prism( this.shapeProperty.get(), this.typeName );
    },

    /**
     * Rotate prism by the specified angle
     * @public
     * @param {number} deltaAngle - angle to be rotated
     */
    rotate: function( deltaAngle ) {
      this.shapeProperty.set( this.shapeProperty.get().getRotatedInstance( deltaAngle, this.shapeProperty.get().getRotationCenter() ) );
    }
  } );
} );