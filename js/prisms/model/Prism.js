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

    this.shapeProperty = new Property( shape );
  }

  return inherit( Object, Prism, {
    translate: function( dx, dy ) {
      this.shapeProperty.set( this.shapeProperty.get().getTranslatedInstance( dx, dy ) );
    },
    //Compute the intersections of the specified ray with this polygon's edges
    getIntersections: function( incidentRay ) {
      return this.shapeProperty.get().getIntersections( incidentRay );
    },
    contains: function( point ) {
      return this.shapeProperty.get().containsPoint( point );
    },
    copy: function() {
      return new Prism( this.shapeProperty.get() );
    },
    getBounds: function() {
      return this.shapeProperty.get().getBounds();
    },
    translate1: function( delta ) {
      this.translate( delta.x, delta.y );
    },
    rotate: function( deltaAngle ) {
      this.shapeProperty.set( this.shapeProperty.get().getRotatedInstance( deltaAngle,
        this.shapeProperty.get().getRotationCenter() ) );
    }
  } );
} );

