// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for the "more tools" screen, which adds a wave sensor and a velocity sensor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import bendingLight from '../../bendingLight.js';
import Substance from '../../common/model/Substance.js';
import IntroModel from '../../intro/model/IntroModel.js';
import VelocitySensor from './VelocitySensor.js';
import WaveSensor from './WaveSensor.js';

class MoreToolsModel extends IntroModel {
  public readonly velocitySensor: VelocitySensor;
  public readonly waveSensor: WaveSensor;

  public constructor( tandem: Tandem ) {

    // On this tab we should start with air and glass as the 2 mediums, since that has a bigger wavelength dependent
    // bend
    super( Substance.GLASS, false, tandem );

    this.velocitySensor = new VelocitySensor(); // (read-only)
    const waveValueGetter = ( position: Vector2 ) => this.getWaveValue( position );

    // (read-only)
    this.waveSensor = new WaveSensor( waveValueGetter, waveValueGetter );

    // Update the velocity sensor value when anything relevant in the model changes
    Multilink.multilink( [
      this.laserViewProperty,
      this.laser.onProperty,
      this.velocitySensor.positionProperty,
      this.intensityMeter.sensorPositionProperty,
      this.topMediumProperty,
      this.bottomMediumProperty,
      this.laser.emissionPointProperty,
      this.laser.wavelengthProperty
    ], () => {
      this.velocitySensor.valueProperty.set(
        this.getVelocity( this.velocitySensor.positionProperty.get() ) );
    } );
  }

  /**
   */
  public override reset(): void {
    super.reset();
    this.velocitySensor.reset();
    this.waveSensor.reset();
  }
}

bendingLight.register( 'MoreToolsModel', MoreToolsModel );

export default MoreToolsModel;