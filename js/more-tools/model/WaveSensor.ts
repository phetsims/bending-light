// Copyright 2015-2022, University of Colorado Boulder

/**
 * Sensor for wave values, reads the wave amplitude as a function of time and position. Two probes can be used to
 * compare values.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import bendingLight from '../../bendingLight.js';
import DataPoint from './DataPoint.js';
import Probe from './Probe.js';

class WaveSensor {
  public probe1: Probe;
  public probe2: Probe;
  public bodyPositionProperty: Property<Vector2>;
  public enabledProperty: Property<boolean>;
  private probe1Value: ( position: Vector2 ) => { time: number; magnitude: number } | null;
  private probe2Value: ( position: Vector2 ) => { time: number; magnitude: number } | null;

  /**
   * @param probe1Value - function for getting data from a probe at the specified point
   * @param probe2Value - function for getting data from a probe at the specified point
   */
  public constructor( probe1Value: ( position: Vector2 ) => { time: number; magnitude: number } | null, probe2Value: ( position: Vector2 ) => { time: number; magnitude: number } | null ) {

    // Set the relative position of the probes and body in model coordinates (SI). These values for initial probe and
    // body positions were obtained by printing out actual values at runtime, then dragging the objects to a good
    // looking position. This amount of precision is unnecessary, but these values were just sampled directly.
    this.probe1 = new Probe( -0.00001932, -0.0000052 );
    this.probe2 = new Probe( -0.0000198, -0.0000062 );

    this.bodyPositionProperty = new Vector2Property( new Vector2( -0.0000172, -0.00000605 ) );

    // in the play area
    this.enabledProperty = new BooleanProperty( false );

    // Function for getting data from a probe at the specified point
    this.probe1Value = probe1Value;
    this.probe2Value = probe2Value;
  }

  // create a copy for use in toolbox icons, etc.
  public copy(): WaveSensor {
    const waveSensor = new WaveSensor( v => {return { time: 0, magnitude: 0 };}, v => {
      return {
        time: 0,
        magnitude: 0
      };
    } );
    waveSensor.bodyPositionProperty.value = this.bodyPositionProperty.value;
    waveSensor.probe1.positionProperty.value = this.probe1.positionProperty.value;
    waveSensor.probe2.positionProperty.value = this.probe2.positionProperty.value;
    return waveSensor;
  }

  public step(): void {
    this.simulationTimeChanged();
  }

  // Read samples from the probes when the simulation time changes
  private simulationTimeChanged(): void {
    this.updateProbeSample( this.probe1, this.probe1Value );
    this.updateProbeSample( this.probe2, this.probe2Value );
  }

  /**
   * Read the value from the probe function. May be None if not intersecting a light ray
   * @param probe
   * @param probeValue - function for getting data from a probe at the specified point
   */
  private updateProbeSample( probe: Probe, probeValue: ( position: Vector2 ) => { time: number; magnitude: number } | null ): void {

    // Read the value from the probe function. May be None if not intersecting a light ray
    const result = probeValue( probe.positionProperty.get() );
    if ( result ) {
      probe.addSample( new DataPoint( result.time, result.magnitude ) );
    }
  }

  /**
   */
  public reset(): void {
    this.bodyPositionProperty.reset();
    this.enabledProperty.reset();
    this.probe1.reset();
    this.probe2.reset();
  }
}

bendingLight.register( 'WaveSensor', WaveSensor );

export default WaveSensor;