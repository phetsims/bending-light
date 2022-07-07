// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for the intensity meter, including the position of the sensor, body, the reading values, etc.
 * When multiple rays hit the sensor, they are summed up.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Shape } from '../../../../kite/js/imports.js';
import bendingLight from '../../bendingLight.js';
import Reading from './Reading.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

class IntensityMeter {
  public readonly readingProperty: Property<Reading>;
  public readonly sensorPositionProperty: Property<Vector2>;
  public readonly bodyPositionProperty: Property<Vector2>;
  private rayReadings: Reading[] = []; // accumulation of readings
  public readonly enabledProperty: BooleanProperty;

  /**
   * @param sensorX - sensor x position in model coordinates
   * @param sensorY - sensor y position in model coordinates
   * @param bodyX - body x position in model coordinates
   * @param bodyY - body y position in model coordinates
   */
  public constructor( sensorX: number, sensorY: number, bodyX: number, bodyY: number ) {

    this.readingProperty = new Property( Reading.MISS ); // value to show on the body
    this.sensorPositionProperty = new Vector2Property( new Vector2( sensorX, sensorY ) );
    this.bodyPositionProperty = new Vector2Property( new Vector2( bodyX, bodyY ) );
    this.enabledProperty = new BooleanProperty( false ); // True if it is in the play area
  }

  // Restore the initial values.
  public reset(): void {
    this.readingProperty.reset();
    this.sensorPositionProperty.reset();
    this.bodyPositionProperty.reset();
    this.enabledProperty.reset();
    this.rayReadings.length = 0;
  }

  // Copy the model for reuse in the toolbox node.
  public copy(): IntensityMeter {
    return new IntensityMeter(
      this.sensorPositionProperty.get().x,
      this.sensorPositionProperty.get().y,
      this.bodyPositionProperty.get().x,
      this.bodyPositionProperty.get().y
    );
  }

  public getSensorShape(): Shape {

    // fine tuned to match the given image
    const radius = 1E-6;
    return new Shape().arcPoint( this.sensorPositionProperty.get(), radius, 0, Math.PI * 2, false );
  }

  // Should be called before a model update so that values from last computation don't leak over into the next sum.
  public clearRayReadings(): void {
    this.rayReadings = [];
    this.readingProperty.set( Reading.MISS );
  }

  /**
   * Add a new reading to the accumulator and update the readout
   * @param reading - intensity of the wave or MISS
   */
  public addRayReading( reading: Reading ): void {
    this.rayReadings.push( reading );
    this.updateReading();
  }

  // Update the body text based on the accumulated Reading values
  private updateReading(): void {

    // enumerate the hits
    const hits: Reading[] = [];
    this.rayReadings.forEach( rayReading => {
      if ( rayReading.isHit() ) {
        hits.push( rayReading );
      }
    } );

    // if no hits, say "MISS"
    if ( hits.length === 0 ) {
      this.readingProperty.set( Reading.MISS );
    }
    else {

      // otherwise, sum the intensities
      let total = 0.0;
      hits.forEach( ( hit: Reading ) => {
        total += hit.value;
      } );
      this.readingProperty.set( new Reading( total ) );
    }
  }
}

bendingLight.register( 'IntensityMeter', IntensityMeter );

export default IntensityMeter;