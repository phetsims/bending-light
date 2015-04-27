// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model for the protractor angle and position
 *
 * @author Chandrashekar Bemagoni(Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var PropertySet = require( 'AXON/PropertySet' );


  /**
   *
   * @param {Number } x - protractor x position in model co ordinates
   * @param {Number} y - protractor y position in model co ordinates
   * @constructor
   */
  function ProtractorModel( x, y ) {

    PropertySet.call( this, {
        angle: 0.0,
        position: new Vector2( x, y ) // position of the center
      }
    );
  }

  return inherit( PropertySet, ProtractorModel, {


    /**
     *@public
     * @param {Vector2} delta
     */
    translate: function( delta ) {
      this.positionProperty.set( this.positionProperty.value.plus( delta ) );
      this.positionProperty._notifyObservers();
    },

    /**
     * @public
     */
    reset: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );
} );
