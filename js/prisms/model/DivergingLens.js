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
  var Vector2 = require( 'DOT/Vector2' );
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
  function DivergingLens( referencePointIndex, points, radius ) {

    this.points = points;
    // index for the point used as the "reference" point,
    // which is used as the drag handle corner for rotation
    this.referencePointIndex = referencePointIndex;
    this.radius = radius;
  }

  return inherit( Object, DivergingLens, {

    /**
     * @public
     * @returns {*}
     */
    toShape: function() {
      var center = this.points[ 0 ].plus( this.points[ 3 ] ).times( 0.5 );
      var startAngle = center.minus( this.points[ 3 ] ).angle();
      return new Shape()
        .ellipticalArc( center.x, center.y, this.radius, this.radius, 0, startAngle, startAngle + Math.PI, true )
        .lineTo( this.points[ 2 ].x, this.points[ 2 ].y )
        .lineTo( this.points[ 1 ].x, this.points[ 1 ].y )
        .lineTo( this.points[ 0 ].x, this.points[ 0 ].y );
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
     *@public
     * @param {Vector2} delta
     * @returns {DivergingLens}
     */
    getTranslatedInstance: function( delta ) {

      var newPoints = [];
      for ( var j = 0; j < this.points.length; j++ ) {
        newPoints.push( this.points[ j ].plus( delta ) );
      }
      return new DivergingLens( this.referencePointIndex, newPoints, this.radius );
    },

    /**
     * Gets a rotated copy of this DivergingLens
     *
     * @param {number} angle
     * @param {Vector2} rotationPoint
     * @returns {DivergingLens}
     */
    getRotatedInstance: function( angle, rotationPoint ) {
      var newPoints = [];
      for ( var k = 0; k < this.points.length; k++ ) {
        var vectorAboutCentroid = this.points[ k ].minus( rotationPoint );
        var rotated = vectorAboutCentroid.rotate( angle );
        newPoints.push( rotated.plus( rotationPoint ) );
      }
      return new DivergingLens( this.referencePointIndex, newPoints, this.radius );
    },

    /**
     *
     * @param {Vector2} point
     * @returns {*}
     */
    containsPoint: function( point ) {
      var intersection = this.toShape().intersection( new Ray2( point, Vector2.X_UNIT ) );
      return intersection.length % 2 === 1;
    },

    /**
     * Just use the 0th point for the reference point for rotation drag handles
     *
     * @returns {Vector2}
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
      return this.getCentroid( this.points );
    },

    /**
     *
     * @param {Vector2[]} p
     * @returns {Vector2}
     */
    getCentroid: function( p ) {
      var cx = 0;
      var cy = 0;
      for ( var i = 0; i < p.length; i++ ) {
        var j = ( i + 1 ) % p.length;
        var n = ( ( p[ i ].x * p[ j ].y ) - ( p[ j ].x * p[ i ].y ) );
        cx += ( p[ i ].x + p[ j ].x ) * n;
        cy += ( p[ i ].y + p[ j ].y ) * n;
      }
      var a = this.getArea( p );
      var f = 1 / ( a * 6);
      cx *= f;
      cy *= f;
      return new Vector2( cx, cy );
    },

    /**
     *
     * @param {Vector2[]} p
     * @returns {number}
     */
    getArea: function( p ) {
      var a = 0;
      for ( var i = 0; i < p.length; i++ ) {
        var j = ( i + 1 ) % p.length;
        a += ( p[ i ].x * p[ j ].y );
        a -= ( p[ j ].x * p[ i ].y );
      }
      a *= 0.5;
      return a;
    },

    /**
     * Compute the intersections of the specified ray with this polygon's edges
     *
     * @param {Ray} ray
     * @returns {Array}
     */
    getIntersections: function( ray ) {
      var intersections = [];
      this.getEdges().forEach( function( lineSegment ) {
        //Get the intersection if there is one
        var intersection = lineSegment.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
        if ( intersection.length !== 0 ) {
          //Choose the normal vector that points the opposite direction of the incoming ray
          var normal1 = lineSegment.getEnd().minus( lineSegment.getStart() ).rotated( +Math.PI / 2 ).normalized();
          var normal2 = lineSegment.getEnd().minus( lineSegment.getStart() ).rotated( -Math.PI / 2 ).normalized();
          var unitNormal = ray.directionUnitVector.dot( normal1 ) < 0 ? normal1 : normal2;

          //Add to the list of intersections
          intersections.push( new Intersection( unitNormal, intersection[ 0 ].point ) );
        }
      } );
      var center = this.points[ 0 ].plus( this.points[ 3 ] ).times( 0.5 );
      var startAngle = center.minus( this.points[ 3 ] ).angle();
      var arc = new Arc( center, this.radius, startAngle, startAngle + Math.PI, true );
      var intersection = arc.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
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
    },

    /**
     * List all bounding edges in the polygon
     *
     * @returns {Array}
     */
    getEdges: function() {
      var lineSegments = [];
      for ( var i = 0; i < this.points.length - 1; i++ ) {
        lineSegments.push( new Line( this.points[ i ], this.points[ i + 1 ] ) );
      }
      return lineSegments;
    },
    /**
     *
     * @returns {Bounds2}
     */
    getBounds: function() {
      return this.toShape().bounds;
    }
  } );
} );
