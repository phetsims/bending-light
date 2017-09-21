// Copyright 2015-2017, University of Colorado Boulder

/**
 * VelocitySensor that has a position and measures velocity
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @constructor
   */
  function VelocitySensor() {

    // @public position of the sensor. Sampled by running the sim with a console.log statement
    this.positionProperty = new Property( new Vector2( -0.00002051402284781722, -0.0000025716197470420186 ) );

    // @public, velocity as measured by the sensor
    this.valueProperty = new Property( new Vector2( 0, 0 ) );

    // @public, True if it is in the play area
    this.enabledProperty = new Property( false );

    // shows the visibility of arrows
    this.isArrowVisibleProperty = new DerivedProperty( [ this.valueProperty ], function( value ) {
      return value.magnitude() > 0;
    } );
  }

  bendingLight.register( 'VelocitySensor', VelocitySensor );

  return inherit( Object, VelocitySensor, {

    /**
     * Restore the initial values.
     */
    reset: function() {
      this.positionProperty.reset();
      this.valueProperty.reset();
      this.enabledProperty.reset();
    },

    // Make a copy for use in the toolbox icon
    copy: function() {
      var velocitySensor = new VelocitySensor();
      velocitySensor.positionProperty.value = this.positionProperty.value.copy();
      velocitySensor.valueProperty.value = this.valueProperty.value.copy();
      velocitySensor.enabledProperty.value = this.enabledProperty.value;
      return velocitySensor;
    },

    /**
     * Translate the velocity sensor in model
     * @public
     * @param {Vector2} delta - amount of space to be translated
     */
    translate: function( delta ) {
      this.positionProperty.set( this.positionProperty.value.plus( delta ) );
    }
  } );
} );