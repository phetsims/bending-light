// Copyright 2002-2015, University of Colorado
/**
 * Circle implementation for use in prisms
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );
  var Intersection = require( 'BENDING_LIGHT/prisms/model/Intersection' );
  var Ray2 = require( 'DOT/Ray2' );

  /**
   *
   * @param center
   * @param radius
   * @constructor
   */
  function Circle( center, radius ) {

    this.center = center;
    this.radius = radius;
  }

  return inherit( Object, Circle, {
    toShape: function() {
      return this.toEllipse();
    },

    toEllipse: function() {
      return new Shape.ellipse( this.center.x, this.center.y, this.radius, this.radius );
    },
    /**
     *
     * @param dx
     * @param dy
     * @returns {Circle}
     */
    getTranslatedInstance: function( dx, dy ) {
      return new Circle( this.center.plus( new Vector2( dx, dy ) ), this.radius );
    },
    /**
     * Finds the intersections between the edges of the circle and the specified ray
     * @param ray
     * @returns {Array}
     */
    getIntersections: function( ray ) {
      //Find the line segment corresponding to the specified ray
      //Find the intersections between the infinite line (not a segment) and the circle
      var intersectionArray = this.toEllipse().intersection( new Ray2( ray.tail, ray.tail.plus( ray.directionUnitVector ) ) );
      //Convert Point2D => Intersection instances
      var intersectionList = [];
      var self = this;
      intersectionArray.forEach( function( intersectionPoint ) {
        //Filter out getLineCircleIntersection nulls, which are returned if there is no intersection
        if ( intersectionPoint !== null ) {
          var vector = intersectionPoint.point.minus( ray.tail );
          //Only consider intersections that are in front of the ray
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
    getBounds: function() {
      return new Rectangle( this.center.x - this.radius, this.center.y - this.radius,
        this.radius * 2, this.radius * 2 );
    },
    /**
     *
     * @param angle
     * @param rotationPoint
     * @returns {Circle}
     */
    getRotatedInstance: function( angle, rotationPoint ) {
      // we create a new circle with a rotated center point
      var vectorAboutCentroid = this.getRotationCenter().minus( rotationPoint );
      var rotated = vectorAboutCentroid.getRotatedInstance( angle );
      return new Circle( rotated.plus( rotationPoint ), this.radius );
    },
    getRotationCenter: function() {
      return this.center;
    },
    //  Signify that the circle can't be rotated
    getReferencePoint: function() {
      // return new Option.None();
    },
    /**
     *
     * @param point
     * @returns {boolean}
     */
    containsPoint: function( point ) {
      return point.distance( this.center ) <= this.radius;
    }
  } );
} );

