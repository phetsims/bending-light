// Copyright 2002-2015, University of Colorado Boulder

/**
 * Circle implementation for use in prisms
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni {Actual Concepts}
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Intersection = require( 'BENDING_LIGHT/prisms/model/Intersection' );
  var Ray2 = require( 'DOT/Ray2' );

  /**
   *
   * @param {Vector2} center
   * @param {number} radius
   * @constructor
   */
  function Circle( center, radius ) {

    this.center = center;
    this.radius = radius;
  }

  return inherit( Object, Circle, {

    /**
     * @public
     * @returns {Shape}
     */
    toShape: function() {
      return Shape.ellipse( this.center.x, this.center.y, this.radius, this.radius );
    },

    /**
     *
     * @param {Vector2} delta
     * @returns {Circle}
     */
    getTranslatedInstance: function( delta ) {
      return new Circle( this.center.plus( delta ), this.radius );
    },

    /**
     * Finds the intersections between the edges of the circle and the specified ray
     *
     * @param {Ray} ray
     * @returns {Array}
     */
    getIntersections: function( ray ) {
      var intersectionArray = this.toShape().intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
      var intersectionList = [];
      var self = this;
      intersectionArray.forEach( function( intersectionPoint ) {

        // Filter out getLineCircleIntersection nulls, which are returned if there is no intersection
        if ( intersectionPoint !== null ) {
          var vector = intersectionPoint.point.minus( ray.tail );
          // only consider intersections that are in front of the ray
          if ( vector.dot( ray.directionUnitVector ) > 0 ) {
            var normalVector = intersectionPoint.point.minus( self.center ).normalized();
            if ( normalVector.dot( ray.directionUnitVector ) > 0 ) {
              normalVector = normalVector.negated();
            }
            intersectionList.push( new Intersection( normalVector, intersectionPoint.point ) );
          }
        }
      } );
      return intersectionList;
    },

    /**
     * @public
     * @param {number} angle
     * @param {Vector2} rotationPoint
     * @returns {Circle}
     */
    getRotatedInstance: function( angle, rotationPoint ) {
      // we create a new circle with a rotated center point
      var vectorAboutCentroid = this.getRotationCenter().minus( rotationPoint );
      var rotated = vectorAboutCentroid.getRotatedInstance( angle );
      return new Circle( rotated.add( rotationPoint ), this.radius );
    },

    /**
     * @public
     * @returns {Vector2}
     */
    getRotationCenter: function() {
      return this.center;
    },

    /**
     * Signify that the circle can't be rotated
     *
     * @returns {null}
     */
    getReferencePoint: function() {
      return null;
    },

    /**
     *
     * @param {Vector2} point
     * @returns {boolean}
     */
    containsPoint: function( point ) {
      return point.distance( this.center ) <= this.radius;
    }
  } );
} );