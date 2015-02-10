// Copyright 2002-2015, University of Colorado
/**
 * Model for the protractor angle and position
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var PropertySet = require( 'AXON/PropertySet' );


  /**
   *
   * @param x
   * @param y
   * @constructor
   */
  function ProtractorModel( x, y ) {

    PropertySet.call( this, {
        angle: 0.0,
        position: new Vector2( x, y )
      }
    );
  }

  return inherit( PropertySet, ProtractorModel, {
    /**
     *
     * @param{Number} x
     * @param {Number} y
     */
    translate1: function( x, y ) {
      this.positionProperty.set( new Vector2( this.position.x + x, this.position.y + y ) );
    },
    /**
     *
     * @param {Vector2} delta
     */
    translate: function( delta ) {
      this.translate1( delta.x, delta.y );
    },
    reset: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );
} );
