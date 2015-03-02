// Copyright 2002-2011, University of Colorado
/**
 * Immutable data point class used in the intensity meter charts.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @param time
   * @param value
   * @constructor
   */
  function DataPoint( time, value ) {

    this.time = time;
    this.value = value;
  }

  return inherit( Object, DataPoint );
} );

