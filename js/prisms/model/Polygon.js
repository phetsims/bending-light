// Copyright 2002-2015, University of Colorado Boulder

/**
 * Shape that comprises a prism. Immutable here but composed with a Property<Polygon> in Prism for mutability.
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
    // Index for the point used as the "reference" point, which is used as the drag handle corner for rotation
    this.referencePointIndex = referencePointIndex;

    // Centroid of the shape
    this.centroid = this.getCentroid( this.points );
  }

  return inherit( Object, Polygon, {

    /**
     * @public
     * @returns {Shape}
     */
    toShape: function() {
      var shape = new Shape();
      shape.moveToPoint( this.points[ 0 ] );
      for ( var i = 1; i < this.points.length; i++ ) {
        shape.lineToPoint( this.points[ i ] );
      }
      return shape.close();
    },

    /**
     * Get the specified corner point
     *
     * @public
     * @param {number} i
     * @returns {Vector2}
     */
    getPoint: function( i ) {
      return this.points[ i ];
    },

    /**
     * @public
     * @param {Vector2} delta
     * @returns {Polygon}
     */
    getTranslatedInstance: function( delta ) {

      var newPoints = [];
      for ( var j = 0; j < this.points.length; j++ ) {
        newPoints.push( this.points[ j ].add( delta ) );
      }
      return new Polygon( this.referencePointIndex, newPoints );
    },

    /**
     * Gets a rotated copy of this polygon
     * @public
     * @param {number} angle
     * @param {Vector2} rotationPoint
     * @returns {Polygon}
     */
    getRotatedInstance: function( angle, rotationPoint ) {
      var newPoints = [];
      for ( var k = 0; k < this.points.length; k++ ) {
        var vectorAboutCentroid = this.points[ k ].subtract( rotationPoint );
        var rotated = vectorAboutCentroid.rotate( angle );
        newPoints.push( rotated.add( rotationPoint ) );
      }
      return new Polygon( this.referencePointIndex, newPoints );
    },


    /**
     * @public
     * @param {Vector2} point
     * @returns {boolean}
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
      return this.centroid;
    },

    /**
     * @private
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
     * @private
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
     * @public
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
          var normal1 = lineSegment.getEnd().minus( lineSegment.getStart() ).rotate( +Math.PI / 2 ).normalize();
          var normal2 = lineSegment.getEnd().minus( lineSegment.getStart() ).rotate( -Math.PI / 2 ).normalize();
          var unitNormal = ray.directionUnitVector.dot( normal1 ) < 0 ? normal1 : normal2;

          //Add to the list of intersections
          intersections.push( new Intersection( unitNormal, intersection[ 0 ].point ) );
        }
      } );
      return intersections;
    },

    /**
     * List all bounding edges in the polygon
     * @private
     * @returns {Array}
     */
    getEdges: function() {
      var lineSegments = [];
      for ( var i = 0; i < this.points.length; i++ ) {
        var next = i === this.points.length - 1 ? 0 : i + 1;//make sure to loop from the last point to the first point
        lineSegments.push( new Line( this.points[ i ], this.points[ next ] ) );
      }
      return lineSegments;
    }
  } );
} );