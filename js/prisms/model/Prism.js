// Copyright 2002-2012, University of Colorado
/**
 * Wrapper around a shape with convenience methods for computing intersections, etc.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  //var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  // var Polygon = require( 'BENDING_LIGHT/prisms/model/Polygon' );


  /*  function Prism( referencePointIndex, points ) {
   this.shape;
   this( new Polygon( points, referencePointIndex ) );
   }*/
  /**
   *
   * @param shape
   * @constructor
   */
  function Prism( shape ) {

    this.shape = new Property( shape );
  }

  return inherit( Object, Prism, {
    translate: function( dx, dy ) {
      this.shape.set( this.shape.get().getTranslatedInstance( dx, dy ) );
    },
    //Compute the intersections of the specified ray with this polygon's edges
    getIntersections: function( incidentRay ) {
      return this.shape.get().getIntersections( incidentRay );
    },
    contains: function( point ) {
      return this.shape.get().containsPoint( point );
    },
    copy: function() {
      return new Prism( this.shape.get() );
    },
    getBounds: function() {
      return this.shape.get().getBounds();
    },
    translate1: function( delta ) {
      this.translate( delta.getWidth(), delta.getHeight() );
    },
    rotate: function( deltaAngle ) {
      this.shape.set( this.shape.get().getRotatedInstance( deltaAngle,
        this.shape.get().getRotationCenter() ) );
    }
  } );
} );

