// Copyright 2002-2015, University of Colorado Boulder

/**
 * Shape that comprises a prism.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni  {Actual Concepts}
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
   * @param {number} referencePointIndex
   * @param {Vector2[]} points
   * @param {number} radius
   * @constructor
   */
  function SemiCircle( referencePointIndex, points, radius ) {

    this.points = points;

    // index for the point used as the "reference" point,
    // which is used as the drag handle corner for rotation
    this.referencePointIndex = referencePointIndex;
    this.radius = radius;
  }

  return inherit( Object, SemiCircle, {

    /**
     * @public
     */
    toShape: function() {
      var center = this.points[ 0 ].plus( this.points[ 1 ] ).times( 0.5 );
      var startAngle = center.minus( this.points[ 1 ] ).angle();
      return new Shape()
        .ellipticalArc( center.x, center.y, this.radius, this.radius, 0, startAngle, startAngle + Math.PI, false )
        .close();
    },

    /**
     * Get the specified corner point
     *
     * @param {number} i
     * @returns {*}
     */
    getPoint: function( i ) {
      return this.points[ i ];
    },

    /**
     * @public
     * @param {Vector2} delta
     * @returns {SemiCircle}
     */
    getTranslatedInstance: function( delta ) {

      var newPoints = [];
      for ( var j = 0; j < this.points.length; j++ ) {
        newPoints.push( this.points[ j ].plus( delta ) );
      }
      return new SemiCircle( this.referencePointIndex, newPoints, this.radius );
    },

    /**
     * Gets a rotated copy of this SemiCircle
     * @public
     * @param {number} angle
     * @param {Vector2} rotationPoint
     * @returns {SemiCircle}
     */
    getRotatedInstance: function( angle, rotationPoint ) {
      var newPoints = [];
      for ( var k = 0; k < this.points.length; k++ ) {
        var vectorAboutCentroid = this.points[ k ].minus( rotationPoint );
        var rotated = vectorAboutCentroid.rotate( angle );
        newPoints.push( rotated.plus( rotationPoint ) );
      }
      return new SemiCircle( this.referencePointIndex, newPoints, this.radius );
    },

    /**
     *
     * @param {Vector2} point
     * @returns {*}
     */
    containsPoint: function( point ) {
      return this.toShape().containsPoint( point );
    },

    /**
     * Just use the 0th point for the reference point for rotation drag handles
     *
     * @returns {*}
     */
    getReferencePoint: function() {
      return this.getPoint( this.referencePointIndex );
    },

    /**
     * Computes the centroid of the corner points (e.g. the center of "mass" assuming the corner points have equal
     * "mass")
     *
     * @returns {Vector2}
     */
    getRotationCenter: function() {
      return this.points[ 0 ].plus( this.points[ 1 ] ).times( 0.5 );
    },

    /**
     * Compute the intersections of the specified ray with this polygon's edges
     * @public
     * @param {Ray} ray
     * @returns {Array}
     */
    getIntersections: function( ray ) {
      var intersections = [];
      var segment = new Line( this.points[ 0 ], this.points[ 1 ] );
      //Get the intersection if there is one
      var intersection = segment.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
      if ( intersection.length !== 0 ) {
        //Choose the normal vector that points the opposite direction of the incoming ray
        var normal1 = segment.getEnd().minus( segment.getStart() ).rotated( +Math.PI / 2 ).normalized();
        var normal2 = segment.getEnd().minus( segment.getStart() ).rotated( -Math.PI / 2 ).normalized();
        var unitNormal = ray.directionUnitVector.dot( normal1 ) < 0 ? normal1 : normal2;
        //Add to the list of intersections
        intersections.push( new Intersection( unitNormal, intersection[ 0 ].point ) );
      }
      var center = this.points[ 0 ].plus( this.points[ 1 ] ).times( 0.5 );
      var startAngle = this.points[ 1 ].minus( center ).angle();
      var arc = new Arc( center, this.radius, startAngle, startAngle + Math.PI, true );
      intersection = arc.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
      if ( intersection.length !== 0 ) {
        var vector = intersection[ 0 ].point.minus( ray.tail );
        //Only consider intersections that are in front of the ray
        if ( vector.dot( ray.directionUnitVector ) > 0 ) {
          var normalVector = intersection[ 0 ].point.minus( center ).normalized();
          if ( normalVector.dot( ray.directionUnitVector ) > 0 ) {
            normalVector = normalVector.negated();
          }
          intersections.push( new Intersection( normalVector, intersection[ 0 ].point ) );
        }
      }
      return intersections;
    }
  } );
} );