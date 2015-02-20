// Copyright 2002-2012, University of Colorado
/**
 * Creates a shape that is the difference of two shapes. It contains a point x iff: A contains x && B does not contain x
 * <p/>
 * CSG intro: https://secure.wikimedia.org/wikipedia/en/wiki/Constructive_solid_geometry
 * Rationale for intersection: http://groups.csail.mit.edu/graphics/classes/6.838/F01/lectures/SmoothSurfaces/0the_s040.html
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  //var Rectangle = require( 'KITE/Rectangle' );
  //var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param a
   * @param b
   * @constructor
   */
  function ShapeDifference( a, b ) {

    this.a = a;
    this.b = b;
  }

  return inherit( Object, ShapeDifference, {
    toShape: function() {
      /*return new Area( a.toShape() ).withAnonymousClassBody( {
       initializer: function() {
       subtract( new Area( b.toShape() ) );
       }
       } );*/
    },
    getTranslatedInstance: function( dx, dy ) {
      return new ShapeDifference( this.a.getTranslatedInstance( dx, dy ),
        this.b.getTranslatedInstance( dx, dy ) );
    },
    getIntersections: function( ray ) {
      // for CSG difference, intersection points need to be at the boundary of one surface, and either be INSIDE A, or OUTSIDE B
      var result = [];
      // find all intersections with A that are outside of B
      for ( var intersection in this.a.getIntersections( ray ) ) {
        if ( !this.b.containsPoint( intersection.getPoint() ) ) {
          result.add( intersection );
        }
      }
      // find all intersections with B that are in A
      for ( intersection in this.b.getIntersections( ray ) ) {
        if ( this.a.containsPoint( intersection.getPoint() ) ) {
          result.add( intersection );
        }
      }
      return result;
    },
    getBounds: function() {
      // as a simplification, we just need to return A's bounds
      return this.a.getBounds();
    },
    getRotatedInstance: function( angle, rotationPoint ) {
      // rotate the children around the same rotation point
      return new ShapeDifference( this.a.getRotatedInstance( angle, rotationPoint ),
        this.b.getRotatedInstance( angle, rotationPoint ) );
    },
    getRotationCenter: function() {
      // just grab A's centroid, since it is simplier. NOTE: this is NOT the true centroid!!!
      return this.a.getRotationCenter();
    },
    getReferencePoint: function() {
      // return the first viable centroid
      if ( this.a.getReferencePoint().isSome() ) {
        return this.a.getReferencePoint();
      }
      else {
        return this.b.getReferencePoint();
      }
    },
    containsPoint: function( point ) {
      return this.a.containsPoint( point ) && !this.b.containsPoint( point );
    }
  } );
} );

