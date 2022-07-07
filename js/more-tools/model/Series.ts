// Copyright 2015-2022, University of Colorado Boulder

/**
 * Series of data points to be shown in the wave sensor chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import { Color } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import DataPoint from './DataPoint.js';

class Series {
  public readonly seriesProperty: Property<DataPoint[]>;
  public readonly color: Color;

  /**
   * @param seriesProperty - contains data points of series
   * @param color - color of series
   */
  public constructor( seriesProperty: Property<DataPoint[]>, color: Color ) {

    // (read-only)
    this.seriesProperty = seriesProperty;

    // (read-only)
    this.color = color;
  }

  /**
   * Discard early samples that have gone out of range
   * @param minTime - minimum time to be displayed on chart node
   */
  public keepLastSamples( minTime: number ): void {
    let startIndex = 0;
    if ( this.seriesProperty.get().length ) {

      // update the start time
      while ( this.seriesProperty.get()[ startIndex ] && this.seriesProperty.get()[ startIndex ].time < minTime ) {
        startIndex = startIndex + 1;
      }
      this.seriesProperty.set( this.seriesProperty.get().slice( startIndex, this.seriesProperty.get().length ) );
    }
  }
}

bendingLight.register( 'Series', Series );

export default Series;