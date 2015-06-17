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
      return new Shape().ellipticalArcPoint( this.center, this.radius, this.radius, 0, 0, Math.PI * 2, false );
    },

    /**
     * @public
     * @param {number} deltaX
     * @param {number} deltaY
     * @returns {Circle}
     */
    getTranslatedInstance: function( deltaX, deltaY ) {
      return new Circle( this.center.plusXY( deltaX, deltaY ), this.radius );
    },

    /**
     * Finds the intersections between the edges of the circle and the specified ray
     * @public
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
          // only consider intersections that are in front of the ray
          if ( ((intersectionPoint.point.x - ray.tail.x) * ray.directionUnitVector.x +
                (intersectionPoint.point.y - ray.tail.y) * ray.directionUnitVector.y) > 0 ) {
            var normalVector = intersectionPoint.point.minus( self.center ).normalize();
            if ( normalVector.dot( ray.directionUnitVector ) > 0 ) {
              normalVector = normalVector.negate();
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
      var vectorAboutCentroid = this.getRotationCenter().subtract( rotationPoint );
      var rotated = vectorAboutCentroid.rotate( angle );
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
     * @public
     * @returns {null}
     */
    getReferencePoint: function() {
      return null;
    },

    /**
     * @public
     * @param {Vector2} point
     * @returns {boolean}
     */
    containsPoint: function( point ) {
      return point.distance( this.center ) <= this.radius;
    }
  } );
} );