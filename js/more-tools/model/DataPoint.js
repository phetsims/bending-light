// Copyright 2015, University of Colorado Boulder

/**
 * Immutable data point class used in the wave sensor node charts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

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

  return inherit( Object, DataPoint );
} );
