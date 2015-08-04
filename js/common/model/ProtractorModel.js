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
   * @param {number} x - protractor x position in model co-ordinates
   * @param {number} y - protractor y position in model co-ordinates
   * @constructor
   */
  function ProtractorModel( x, y ) {

    PropertySet.call( this, {
        angle: 0.0, // @public
        position: new Vector2( x, y ), // @public, position of the center
        enabled: false // @public
      }
    );

    // reusable vectors to avoid too many vector allocations
    // vector to store new Protractor position
    this.newPosition = new Vector2( 0, 0 ); // @private, for internal use only.
  }

  return inherit( PropertySet, ProtractorModel, {

    /**
     * Translate the protractor in model
     * @public
     * @param {number} deltaX - amount of space in x direction Protractor to be translated
     * @param {number} deltaY - amount of space in y direction Protractor to be translated
     */
    translateXY: function( deltaX, deltaY ) {
      this.newPosition.setXY( this.position.x + deltaX, this.position.y + deltaY );
      this.positionProperty.set( this.newPosition );
      this.positionProperty._notifyObservers();
    }
  } );
} );