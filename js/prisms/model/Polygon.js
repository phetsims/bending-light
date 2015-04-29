// Copyright 2002-2015, University of Colorado Boulder
/**
 * Shape that comprises a prism.
 * Immutable here but composed with a Property<Polygon> in Prism for mutability.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni {Actual Concepts}
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var Line = require( 'KITE/segments/Line' );
  var Ray2 = require( 'DOT/Ray2' );
  var Intersection = require( 'BENDING_LIGHT/prisms/model/Intersection' );

  /**
   *
   * @param {number} referencePointIndex
   * @param {Vector2[]} points
   * @constructor
   */
  function Polygon( referencePointIndex, points ) {

    this.points = points;
    // index for the point used as the "reference" point,
    // which is used as the drag handle corner for rotation
    this.referencePointIndex = referencePointIndex;

    // centroid of the shape
    this.centroid = new Vector2( 0, 0 );
    this.vectorAboutCentroid = new Vector2( 0, 0 );
  }

  return inherit( Object, Polygon, {
    /**
     * @public
     * @returns {Shape}
     */
    toShape: function() {
      var shape = new Shape();
      shape.moveTo( this.points[ 0 ].x || 0, this.points[ 0 ].y || 0 );
      for ( var i = 1; i < this.points.length; i++ ) {
        shape.lineTo( this.points[ i ].x, this.points[ i ].y );
      }
      shape.close();
      return shape;
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
     * @returns {Polygon}
     */
    getTranslatedInstance: function( delta ) {

      var newPoints = [];
      for ( var j = 0; j < this.points.length; j++ ) {
        newPoints.push( this.points[ j ].plus( delta ) );
      }
      return new Polygon( this.referencePointIndex, newPoints );
    },

    /**
     * Gets a rotated copy of this polygon
     *@public
     * @param {number} angle
     * @param {Vector2} rotationPoint
     * @returns {Polygon}
     */
    getRotatedInstance: function( angle, rotationPoint ) {
      var newPoints = [];
      for ( var k = 0; k < this.points.length; k++ ) {
        this.vectorAboutCentroid.x = this.points[ k ].x - rotationPoint.x;
        this.vectorAboutCentroid.y = this.points[ k ].y - rotationPoint.y;
        var rotated = this.vectorAboutCentroid.rotate( angle );
        newPoints.push( rotated.plus( rotationPoint ) );
      }
      return new Polygon( this.referencePointIndex, newPoints );
    },

    /**
     * Lists the corner points
     *
     * @returns {Array}
     */
    toPointArray: function() {
      var array = [];
      for ( var i = 0; i < this.points.length; i++ ) {
        array[ i ] = this.points[ i ];
      }
      return array;
    },

    /**
     *
     * @param {Vector2} point
     * @returns {boolean}
     */
    containsPoint: function( point ) {
      var intersection = this.toShape().intersection( new Ray2( point, Vector2.X_UNIT ) );
      return intersection.length % 2 === 1;
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
     * @returns {*|Vector2}
     */
    getRotationCenter: function() {
      return this.getCentroid( this.points );
    },

    /**
     *
     * @param {Vector2[]}p
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
      this.centroid.x = cx;
      this.centroid.y = cy;
      return this.centroid;
    },

    /**
     *
     * @param {Vector2[]}p
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
      return intersections;
    },

    /**
     * List all bounding edges in the polygon
     *
     * @returns {Array}
     */
    getEdges: function() {
      var lineSegments = [];
      for ( var i = 0; i < this.points.length; i++ ) {
        var next = i === this.points.length - 1 ? 0 : i + 1;//make sure to loop from the last point to the first point
        lineSegments.push( new Line( this.points[ i ], this.points[ next ] ) );
      }
      return lineSegments;
    },

    getBounds: function() {
      return this.toShape().bounds;
    }
  } );
} );
