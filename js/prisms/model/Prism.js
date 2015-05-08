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
     *
     * @param {Vector2} delta
     */
    translate: function( delta ) {
      this.shapeProperty.set( this.shapeProperty.get().getTranslatedInstance( delta ) );
    },

    /**
     * Compute the intersections of the specified ray with this polygon's edges
     *
     * @param incidentRay
     * @returns {Array}
     */
    getIntersections: function( incidentRay ) {
      return this.shapeProperty.get().getIntersections( incidentRay );
    },

    /**
     *
     * @param point
     * @returns {boolean}
     */
    contains: function( point ) {
      return this.shapeProperty.get().containsPoint( point );
    },

    /**
     *
     * @returns {Prism}
     */
    copy: function() {
      return new Prism( this.shapeProperty.get() );
    },

    /**
     *
     * @param {number}deltaAngle
     */
    rotate: function( deltaAngle ) {
      this.shapeProperty.set( this.shapeProperty.get().getRotatedInstance( deltaAngle,
        this.shapeProperty.get().getRotationCenter() ) );
    }
  } );
} );
