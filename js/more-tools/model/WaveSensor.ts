// Copyright 2015-2021, University of Colorado Boulder

/**
 * Sensor for wave values, reads the wave amplitude as a function of time and position. Two probes can be used to
 * compare values.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import bendingLight from '../../bendingLight.js';
import DataPoint from './DataPoint.js';

class Probe {
  readonly seriesProperty: Property;
  readonly positionProperty: Vector2Property;

  /**
   * Model for a probe, including its position and recorded data series
   *
   * @param {number} x - x position of probe
   * @param {number} y - y position of probe
   */
  constructor( x: number, y: number ) {

    // @public, array of data points
    this.seriesProperty = new Property( [] );

    // @public, position of a probe
    this.positionProperty = new Vector2Property( new Vector2( x, y ) );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.seriesProperty.reset();
    this.positionProperty.reset();
  }

  /**
   * @public
   * @param {DataPoint} sample
   */
  addSample( sample: DataPoint ) {
    this.seriesProperty.get().push( sample );
    this.seriesProperty.notifyListenersStatic();
  }
}

class WaveSensor {
  probe1: Probe;
  probe2: Probe;
  bodyPositionProperty: Vector2Property;
  enabledProperty: Property;
  probe1Value: any;
  probe2Value: any;

  /**
   * @param {function} probe1Value - function for getting data from a probe at the specified point
   * @param {function} probe2Value - function for getting data from a probe at the specified point
   */
  constructor( probe1Value: any, probe2Value: any ) {

    // Set the relative position of the probes and body in model coordinates (SI). These values for initial probe and
    // body positions were obtained by printing out actual values at runtime, then dragging the objects to a good
    // looking position. This amount of precision is unnecessary, but these values were just sampled directly.
    this.probe1 = new Probe( -0.00001932, -0.0000052 );
    this.probe2 = new Probe( -0.0000198, -0.0000062 );

    // @public
    this.bodyPositionProperty = new Vector2Property( new Vector2( -0.0000172, -0.00000605 ) );

    // @public
    // in the play area
    this.enabledProperty = new Property( false );

    // Function for getting data from a probe at the specified point
    this.probe1Value = probe1Value;
    this.probe2Value = probe2Value;
  }

  // @public - create a copy for use in toolbox icons, etc.
  copy() {
    const waveSensor = new WaveSensor( 0, 0 );
    waveSensor.bodyPositionProperty.value = this.bodyPositionProperty.value;
    waveSensor.probe1.positionProperty.value = this.probe1.positionProperty.value;
    waveSensor.probe2.positionProperty.value = this.probe2.positionProperty.value;
    return waveSensor;
  }

  // @public
  step() {
    this.simulationTimeChanged();
  }

  // @private - Read samples from the probes when the simulation time changes
  simulationTimeChanged() {
    this.updateProbeSample( this.probe1, this.probe1Value );
    this.updateProbeSample( this.probe2, this.probe2Value );
  }

  /**
   * Read the value from the probe function. May be None if not intersecting a light ray
   * @private
   * @param {Probe} probe
   * @param {function} probeValue - function for getting data from a probe at the specified point
   */
  updateProbeSample( probe: Probe, probeValue: any ) {

    // Read the value from the probe function. May be None if not intersecting a light ray
    const value = probeValue( probe.positionProperty.get() );
    if ( value ) {
      probe.addSample( new DataPoint( value.time, value.magnitude ) );
    }
  }

  /**
   * @public
   */
  reset() {
    this.bodyPositionProperty.reset();
    this.enabledProperty.reset();
    this.probe1.reset();
    this.probe2.reset();
  }
}

bendingLight.register( 'WaveSensor', WaveSensor );

export default WaveSensor;