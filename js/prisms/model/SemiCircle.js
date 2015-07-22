// Copyright 2002-2015, University of Colorado Boulder

/**
 * Shape that comprises a prism.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Line = require( 'KITE/segments/Line' );
  var Arc = require( 'KITE/segments/Arc' );
  var Ray2 = require( 'DOT/Ray2' );
  var Intersection = require( 'BENDING_LIGHT/prisms/model/Intersection' );

  /**
   *
   * @param {number} referencePointIndex - is used as the drag handle corner for rotation
   * @param {array.<Vector2>} points - corner points
   * @param {number} radius - radius of semicircle
   * @constructor
   */
  function SemiCircle( referencePointIndex, points, radius ) {

    this.points = points;

    // Index for the point used as the "reference" point, which is used as the drag handle corner for rotation
    this.referencePointIndex = referencePointIndex;
    this.radius = radius;
    this.center = this.points[ 0 ].plus( this.points[ 1 ] ).multiplyScalar( 0.5 );
  }

  return inherit( Object, SemiCircle, {

    /**
     * Creates a shape
     * @public
     * @return {Shape}
     */
    toShape: function() {
      var startAngle = Math.atan2( this.center.y - this.points[ 1 ].y, this.center.x - this.points[ 1 ].x );
      return new Shape()
        .ellipticalArcPoint( this.center, this.radius, this.radius, 0, startAngle, startAngle + Math.PI, false )
        .close();
    },

    /**
     * Get the specified corner point
     * @public
     * @param {number} i - index of point
     * @returns {Vector2}
     */
    getPoint: function( i ) {
      return this.points[ i ];
    },

    /**
     * Create a new SemiCircle translated by the specified amount
     * @public
     * @param {number} deltaX - distance in x direction to be translated
     * @param {number} deltaY - distance in y direction to be translated
     * @returns {SemiCircle}
     */
    getTranslatedInstance: function( deltaX, deltaY ) {

      var newPoints = [];
      for ( var j = 0; j < this.points.length; j++ ) {
        newPoints.push( this.points[ j ].plusXY( deltaX, deltaY ) );
      }
      return new SemiCircle( this.referencePointIndex, newPoints, this.radius );
    },

    /**
     * Gets a rotated copy of this SemiCircle
     * @public
     * @param {number} angle - angle to be rotated
     * @param {Vector2} rotationPoint - point around which semicircle to be rotated
     * @returns {SemiCircle}
     */
    getRotatedInstance: function( angle, rotationPoint ) {
      var newPoints = [];
      for ( var k = 0; k < this.points.length; k++ ) {
        var vectorAboutCentroid = this.points[ k ].subtract( rotationPoint );
        var rotated = vectorAboutCentroid.rotate( angle );
        newPoints.push( rotated.add( rotationPoint ) );
      }
      return new SemiCircle( this.referencePointIndex, newPoints, this.radius );
    },

    /**
     * Determines whether shape contains given point or not
     * @public
     * @param {Vector2} point
     * @returns {Vector2}
     */
    containsPoint: function( point ) {
      return this.toShape().containsPoint( point );
    },

    /**
     * Just use the 0th point for the reference point for rotation drag handles
     * @public
     * @returns {Vector2}
     */
    getReferencePoint: function() {
      return this.getPoint( this.referencePointIndex );
    },

    /**
     * Computes the centroid of the corner points (e.g. the center of "mass" assuming the corner points have equal
     * "mass")
     * @public
     * @returns {Vector2}
     */
    getRotationCenter: function() {
      return this.center;
    },

    /**
     * Compute the intersections of the specified ray with this polygon's edges
     * @public
     * @param {Ray} ray - model of the ray
     * @returns {array.<Intersection>}
     */
    getIntersections: function( ray ) {
      var intersections = [];
      var segment = new Line( this.points[ 0 ], this.points[ 1 ] );
      // Get the intersection if there is one
      var intersection = segment.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
      if ( intersection.length !== 0 ) {
        // Choose the normal vector that points the opposite direction of the incoming ray
        var normal = segment.getEnd().minus( segment.getStart() ).rotate( +Math.PI / 2 ).normalize();
        var unitNormal = ray.directionUnitVector.dot( normal ) < 0 ? normal : normal.rotate( Math.PI );
        // Add to the list of intersections
        intersections.push( new Intersection( unitNormal, intersection[ 0 ].point ) );
      }
      var startAngle = Math.atan2( this.points[ 1 ].y - this.center.y, this.points[ 1 ].x - this.center.x );
      var arc = new Arc( this.center, this.radius, startAngle, startAngle + Math.PI, true );
      intersection = arc.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
      if ( intersection.length !== 0 ) {
        // Only consider intersections that are in front of the ray
        if ( ((intersection[ 0 ].point.x - ray.tail.x) * ray.directionUnitVector.x +
              (intersection[ 0 ].point.y - ray.tail.y) * ray.directionUnitVector.y) > 0 ) {
          var normalVector = intersection[ 0 ].point.minus( this.center ).normalize();
          if ( normalVector.dot( ray.directionUnitVector ) > 0 ) {
            normalVector.negate();
          }
          intersections.push( new Intersection( normalVector, intersection[ 0 ].point ) );
        }
      }
      return intersections;
    }
  } );
} );