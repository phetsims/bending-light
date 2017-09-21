// Copyright 2015-2016, University of Colorado Boulder

/**
 * Immutable data point class used in the wave sensor node charts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
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

  bendingLight.register( 'DataPoint', DataPoint );
  
  return inherit( Object, DataPoint );
} );
