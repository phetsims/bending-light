// Copyright 2015-2019, University of Colorado Boulder

/**
 * Model for the "more tools" screen, which adds a wave sensor and a velocity sensor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import inherit from '../../../../phet-core/js/inherit.js';
import bendingLight from '../../bendingLight.js';
import Substance from '../../common/model/Substance.js';
import IntroModel from '../../intro/model/IntroModel.js';
import VelocitySensor from './VelocitySensor.js';
import WaveSensor from './WaveSensor.js';

/**
 * @constructor
 */
function MoreToolsModel() {

  const self = this;

  // On this tab we should start with air and glass as the 2 mediums, since that has a bigger wavelength dependent
  // bend
  IntroModel.call( this, Substance.GLASS, false );

  this.velocitySensor = new VelocitySensor(); // @public (read-only)
  const waveValueGetter = function( position ) {
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
      self.getVelocity( self.velocitySensor.positionProperty.get() ) );
  } );
}

bendingLight.register( 'MoreToolsModel', MoreToolsModel );

export default inherit( IntroModel, MoreToolsModel, {
  reset: function() {
    IntroModel.prototype.reset.call( this );
    this.velocitySensor.reset();
    this.waveSensor.reset();
  }
} );