// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model for the protractor angle and position
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   *
   * @param {number } x - protractor x position in model co-ordinates
   * @param {number} y - protractor y position in model co-ordinates
   * @constructor
   */
  function ProtractorModel( x, y ) {

    PropertySet.call( this, {
        angle: 0.0,
        position: new Vector2( x, y ), // position of the center
        enabled: false
      }
    );

    // reusable vectors to avoid too many vector allocations
    // vector to store new Protractor position
    this.newPosition = new Vector2( 0, 0 );
  }

  return inherit( PropertySet, ProtractorModel, {

    /**
     * @public
     * @param {number} deltaX - amount of space in x direction Protractor to be translated
     * @param {number} deltaY - amount of space in y direction Protractor to be translated
     */
    translateXY: function( deltaX, deltaY ) {
      this.newPosition.setXY( this.positionProperty.get().x + deltaX, this.positionProperty.get().y + deltaY );
      this.positionProperty.set( this.newPosition );
      this.positionProperty._notifyObservers();
    }
  } );
} );