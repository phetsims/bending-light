// Copyright 2002-2015, University of Colorado Boulder

/**
 * Series of data points to be shown in the wave sensor chart.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Property.<[]>} seriesProperty - contains data points of series
   * @param {Color} color - color of series
   * @constructor
   */
  function Series( seriesProperty, color ) {

    // @public
    this.seriesProperty = seriesProperty;

    // @public read-only
    this.color = color;
  }

  return inherit( Object, Series, {

    /**
     * Discard early samples that have gone out of range
     * @public
     * @param {number} minTime - minimum time to be displayed on chart node
     */
    keepLastSamples: function( minTime ) {
      var startIndex = 0;
      if ( this.seriesProperty.get().length ) {
        // update the start time
        while ( this.seriesProperty.get()[ startIndex ] && this.seriesProperty.get()[ startIndex ].time < minTime ) {
          startIndex = startIndex + 1;
        }
        this.seriesProperty.set( this.seriesProperty.get().slice( startIndex, this.seriesProperty.get().length ) );
      }
    }
  } );
} );