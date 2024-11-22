// Copyright 2015-2024, University of Colorado Boulder

/**
 * Immutable data point export default class used in the wave sensor node charts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import bendingLight from '../../bendingLight.js';

export default class DataPoint {

  /**
   * @param time - time of simulation
   * @param value - amplitude at particular time
   */
  public constructor( public readonly time: number, public readonly value: number ) {
  }
}

bendingLight.register( 'DataPoint', DataPoint );