// Copyright 2015-2019, University of Colorado Boulder

/**
 * VelocitySensor that has a position and measures velocity
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  /**
   * @constructor
   */
  function VelocitySensor() {

    // @public position of the sensor. Sampled by running the sim with a console.log statement
    this.positionProperty = new Vector2Property( new Vector2( -0.00002051402284781722, -0.0000025716197470420186 ) );

    // @public, velocity as measured by the sensor
    this.valueProperty = new Vector2Property( new Vector2( 0, 0 ) );

    // @public, True if it is in the play area
    this.enabledProperty = new Property( false );

    // shows the visibility of arrows
    this.isArrowVisibleProperty = new DerivedProperty( [ this.valueProperty ], function( value ) {
      return value.magnitude > 0;
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
      const velocitySensor = new VelocitySensor();
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