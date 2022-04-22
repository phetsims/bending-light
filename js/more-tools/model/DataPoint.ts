// Copyright 2015-2022, University of Colorado Boulder

/**
 * Immutable data point class used in the wave sensor node charts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import bendingLight from '../../bendingLight.js';

class DataPoint {
  readonly time: number;
  readonly value: number;

  /**
   * @param {number} time - time of simulation
   * @param {number} value - amplitude at particular time
   */
  constructor( time: number, value: number ) {

    // (read-only)
    this.time = time;

    // (read-only)
    this.value = value;
  }
}

bendingLight.register( 'DataPoint', DataPoint );

export default DataPoint;