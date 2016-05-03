// Copyright 2015, University of Colorado Boulder

/**
 * Circle implementation for use in prisms
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var PrismIntersection = require( 'BENDING_LIGHT/prisms/model/PrismIntersection' );

  /**
   * @param {Vector2} center - center of the circle
   * @param {number} radius - radius of the circle
   * @constructor
   */
  function Circle( center, radius ) {

    this.center = center; // @public (read-only)
    this.centroid = center; // @public (read-only)
    this.radius = radius; // @public (read-only)
    this.shape = Shape.circle( this.center.x, this.center.y, this.radius ); // @public (read-only)
  }

  bendingLight.register( 'Circle', Circle );
  
  return inherit( Object, Circle, {

    /**
     * Create a new Circle translated by the specified amount
     * @public
     * @param {number} deltaX - amount of space to be translate in x direction
     * @param {number} deltaY - amount of space to be translate in y direction
     * @returns {Circle}
     */
    getTranslatedInstance: function( deltaX, deltaY ) {
      return new Circle( this.center.plusXY( deltaX, deltaY ), this.radius );
    },

    /**
     * Finds the intersections between the edges of the circle and the specified ray
     * @public
     * @param {ColoredRay} ray - model of the ray
     * @returns {Array}
     */
    getIntersections: function( ray ) {
      return PrismIntersection.getIntersections( [], this.shape, this.center, ray );
    },

    /**
     * Computes the centroid of the corner points
     * @public
     * @returns {Vector2}
     */
    getRotationCenter: function() {
      return this.center;
    },

    /**
     * Signify that the circle can't be rotated
     * @public
     * @returns {null}
     */
    getReferencePoint: function() {
      return null;
    },

    /**
     * Determines whether shape contains given point or not
     * @public
     * @param {Vector2} point
     * @returns {boolean}
     */
    containsPoint: function( point ) {
      return point.distance( this.center ) <= this.radius;
    }
  } );
} );