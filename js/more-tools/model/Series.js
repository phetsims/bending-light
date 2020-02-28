// Copyright 2015-2020, University of Colorado Boulder

/**
 * Series of data points to be shown in the wave sensor chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import bendingLight from '../../bendingLight.js';

/**
 * @param {Property.<[]>} seriesProperty - contains data points of series
 * @param {Color} color - color of series
 * @constructor
 */
function Series( seriesProperty, color ) {

  // @public (read-only)
  this.seriesProperty = seriesProperty;

  // @public (read-only)
  this.color = color;
}

bendingLight.register( 'Series', Series );

export default inherit( Object, Series, {

  /**
   * Discard early samples that have gone out of range
   * @public
   * @param {number} minTime - minimum time to be displayed on chart node
   */
  keepLastSamples: function( minTime ) {
    let startIndex = 0;
    if ( this.seriesProperty.get().length ) {

      // update the start time
      while ( this.seriesProperty.get()[ startIndex ] && this.seriesProperty.get()[ startIndex ].time < minTime ) {
        startIndex = startIndex + 1;
      }
      this.seriesProperty.set( this.seriesProperty.get().slice( startIndex, this.seriesProperty.get().length ) );
    }
  }
} );