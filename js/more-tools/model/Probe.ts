// Copyright 2021-2022, University of Colorado Boulder

import Property from '../../../../axon/js/Property.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import DataPoint from './DataPoint.js';
import bendingLight from '../../bendingLight.js';

class Probe {
  public readonly seriesProperty: Property<Array<DataPoint>>;
  public readonly positionProperty: Property<Vector2>;

  /**
   * Model for a probe, including its position and recorded data series
   *
   * @param x - x position of probe
   * @param y - y position of probe
   */
  public constructor( x: number, y: number ) {

    // array of data points
    this.seriesProperty = new Property<Array<DataPoint>>( [] );

    // position of a probe
    this.positionProperty = new Vector2Property( new Vector2( x, y ) );
  }

  /**
   * Resets the model.
   */
  public reset(): void {
    this.seriesProperty.reset();
    this.positionProperty.reset();
  }

  public addSample( sample: DataPoint ): void {
    this.seriesProperty.get().push( sample );
    this.seriesProperty.notifyListenersStatic();
  }
}

bendingLight.register( 'Probe', Probe );
export default Probe;