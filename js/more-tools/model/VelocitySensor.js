// Copyright 2002-2015, University of Colorado Boulder

/**
 * VelocitySensor that has a position and measures velocity
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @constructor
   */
  function VelocitySensor() {

    PropertySet.call( this, {

      // @public position of the sensor. Sampled by running the sim with a console.log statement
      position: new Vector2( -0.00002051402284781722, -0.0000025716197470420186 ),
      value: new Vector2( 0, 0 ), // @public, velocity as measured by the sensor
      enabled: false // @public, True if it is in the play area
    } );

    // shows the visibility of arrows
    this.addDerivedProperty( 'isArrowVisible', [ 'value' ], function( value ) {
      return value.magnitude() > 0;
    } );
  }

  return inherit( PropertySet, VelocitySensor, {

    // Make a copy for use in the toolbox icon
    copy: function() {
      var velocitySensor = new VelocitySensor();
      velocitySensor.position = this.position.copy();
      velocitySensor.value = this.value.copy();
      velocitySensor.enabled = this.enabled;
      return velocitySensor;
    },

    /**
     * Translate the velocity sensor in model
     * @public
     * @param {Vector2} delta - amount of space to be translated
     */
    translate: function( delta ) {
      this.positionProperty.set( this.position.plus( delta ) );
    }
  } );
} );