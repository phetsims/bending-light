// Copyright 2015-2020, University of Colorado Boulder

/**
 * Immutable data point class used in the wave sensor node charts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import bendingLight from '../../bendingLight.js';

/**
 * @param {number} time - time of simulation
 * @param {number} value - amplitude at particular time
 * @constructor
 */
function DataPoint( time, value ) {

  // @public (read-only)
  this.time = time;

  // @public (read-only)
  this.value = value;
}

bendingLight.register( 'DataPoint', DataPoint );

inherit( Object, DataPoint );
export default DataPoint;