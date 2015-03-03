// Copyright 2002-2015, University of Colorado
/**
 * Shape that comprises a prism.
 * Immutable here but composed with a Property<Polygon> in Prism for mutability.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  // var Property = require( 'AXON/Property' );
  //var Intersection = require( 'BENDING_LIGHT/prisms/model/Intersection' );

  /**
   *
   * @param referencePointIndex
   * @param points
   * @constructor
   */
  function Polygon( referencePointIndex, points ) {

    this.points = points;
    //Index for the point used as the "reference" point,
    // which is used as the drag handle corner for rotation
    this.referencePointIndex = referencePointIndex;
  }

  return inherit( Object, Polygon, {

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
     * @param i
     * @returns {*}
     */
    getPoint: function( i ) {
      return this.points[ i ];
    },

    getTranslatedInstance: function( dx, dy ) {

      var newPoints = [];
      for ( var j = 0; j < this.points.length; j++ ) {
        newPoints.push( this.points[ j ].plus( new Vector2( dx, dy ) ) );
      }
      return new Polygon( this.referencePointIndex, newPoints );
    },
    //Gets a rotated copy of this polygon
    getRotatedInstance: function( angle, rotationPoint ) {
      var newPoints = [];
      for ( var k = 0; k < this.points.length; k++ ) {
        var vectorAboutCentroid = this.points[ k ].minus( rotationPoint );
        var rotated = vectorAboutCentroid.rotate( angle );
        newPoints.push( rotated.plus( rotationPoint ) );
      }
      return new Polygon( this.referencePointIndex, newPoints );
    },
    //Lists the corner points
    toPointArray: function() {
      var array = [];
      for ( var i = 0; i < this.points.length; i++ ) {
        array[ i ] = this.points[ i ];
      }
      return array;
    },
    containsPoint: function( point ) {
      return this.toShape().containsPoint( point );
    },
    //Just use the 0th point for the reference point for rotation drag handles
    getReferencePoint: function() {
      return this.getPoint( this.referencePointIndex );
    },
    //Computes the centroid of the corner points (e.g. the center of "mass" assuming the corner points have equal "mass")
    getRotationCenter: function() {
      return this.getCentroid( this.points );
    },
    /**
     *
     * @param p
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
     * @param p
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
    }
  } );
} );

