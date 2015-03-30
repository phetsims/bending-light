// Copyright 2002-2015, University of Colorado
/**
 * Wrapper around a shape with convenience methods for computing intersections, etc.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni {Actual Concepts}
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
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
    /**
     *
     * @param {Vector2} delta
     */
    translate: function( delta ) {
      this.shapeProperty.set( this.shapeProperty.get().getTranslatedInstance( delta ) );
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
    rotate: function( deltaAngle ) {
      this.shapeProperty.set( this.shapeProperty.get().getRotatedInstance( deltaAngle,
        this.shapeProperty.get().getRotationCenter() ) );
    }
  } );
} );

