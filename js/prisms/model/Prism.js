// Copyright 2002-2015, University of Colorado Boulder

/**
 * Wrapper around a shape with convenience methods for computing intersections, etc.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni {Actual Concepts}
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  /**
   *
   * @param shape
   * @constructor
   */
  function Prism( shape ) {

    this.shapeProperty = new Property( shape );
  }

  return inherit( Object, Prism, {

    /**
     * @public
     * @param {number} deltaX
     * @param {number} deltaY
     */
    translate: function( deltaX, deltaY ) {
      this.shapeProperty.set( this.shapeProperty.get().getTranslatedInstance( deltaX, deltaY ) );
    },

    /**
     * Compute the intersections of the specified ray with this polygon's edges
     * @public
     * @param incidentRay
     * @returns {Array}
     */
    getIntersections: function( incidentRay ) {
      return this.shapeProperty.get().getIntersections( incidentRay );
    },

    /**
     * @public
     * @param point
     * @returns {boolean}
     */
    contains: function( point ) {
      return this.shapeProperty.get().containsPoint( point );
    },

    /**
     * @public
     * @returns {Prism}
     */
    copy: function() {
      return new Prism( this.shapeProperty.get() );
    },

    /**
     * @public
     * @param {number}deltaAngle
     */
    rotate: function( deltaAngle ) {
      this.shapeProperty.set( this.shapeProperty.get().getRotatedInstance( deltaAngle,
        this.shapeProperty.get().getRotationCenter() ) );
    }
  } );
} );