// Copyright 2015, University of Colorado Boulder

/**
 * Model for the "more tools" screen, which adds a wave sensor and a velocity sensor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var Substance = require( 'BENDING_LIGHT/common/model/Substance' );
  var WaveSensor = require( 'BENDING_LIGHT/more-tools/model/WaveSensor' );
  var VelocitySensor = require( 'BENDING_LIGHT/more-tools/model/VelocitySensor' );
  var Property = require( 'AXON/Property' );

  /**
   * @constructor
   */
  function MoreToolsModel() {

    var self = this;

    // On this tab we should start with air and glass as the 2 mediums, since that has a bigger wavelength dependent
    // bend
    IntroModel.call( this, Substance.GLASS, false );

    this.velocitySensor = new VelocitySensor(); // @public (read-only)
    var waveValueGetter = function( position ) {
      return self.getWaveValue( position );
    };

    // @public (read-only)
    this.waveSensor = new WaveSensor( waveValueGetter, waveValueGetter );

    // Update the velocity sensor value when anything relevant in the model changes
    Property.multilink( [
      this.laserViewProperty,
      this.laser.onProperty,
      this.velocitySensor.positionProperty,
      this.intensityMeter.sensorPositionProperty,
      this.topMediumProperty,
      this.bottomMediumProperty,
      this.laser.emissionPointProperty,
      this.laser.wavelengthProperty
    ], function() {
      self.velocitySensor.valueProperty.set(
        self.getVelocity( self.velocitySensor.position ) );
    } );
  }

  bendingLight.register( 'MoreToolsModel', MoreToolsModel );

  return inherit( IntroModel, MoreToolsModel, {
    reset: function() {
      IntroModel.prototype.reset.call( this );
      this.velocitySensor.reset();
      this.waveSensor.reset();
    }
  } );
} );
