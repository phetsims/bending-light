// Copyright 2002-2015, University of Colorado Boulder

/**
 * Wrapper around a shape with convenience methods for computing intersections, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Polygon/Circle/SemiCircle} shape
   * @param {string} typeName for keeping track of how many of each kind there are, to remove from toolbox
   * @constructor
   */
  function Prism( shape, typeName ) {

    // @public
    PropertySet.call( this, {
      shape: shape
    } );

    // @public (read-only)
    this.typeName = typeName;
  }

  return inherit( PropertySet, Prism, {

    /**
     * Translate prism by the specified amount
     * @public
     * @param {number} deltaX - amount of space in x direction the prism to be translated
     * @param {number} deltaY - amount of space in y direction the prism to be translated
     */
    translate: function( deltaX, deltaY ) {
      this.shapeProperty.set( this.shape.getTranslatedInstance( deltaX, deltaY ) );
    },

    /**
     * Compute the intersections of the specified ray with this polygon's edges
     * @public
     * @param {ColoredRay} incidentRay - model of the ray
     * @returns {Array}
     */
    getIntersections: function( incidentRay ) {
      return this.shape.getIntersections( incidentRay );
    },

    /**
     * Determines whether shape contains given point or not
     * @public
     * @param {Vector2} point
     * @returns {boolean}
     */
    contains: function( point ) {
      return this.shape.containsPoint( point );
    },

    /**
     * Creates a copy of the prism
     * @public
     * @returns {Prism}
     */
    copy: function() {
      return new Prism( this.shape, this.typeName );
    },

    /**
     * Rotate prism by the specified angle
     * @public
     * @param {number} deltaAngle - angle to be rotated
     */
    rotate: function( deltaAngle ) {
      this.shapeProperty.set( this.shape.getRotatedInstance( deltaAngle, this.shape.getRotationCenter() ) );
    }
  } );
} );