// Copyright 2021, University of Colorado Boulder

import Property from '../../../../axon/js/Property.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
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

export default Probe;