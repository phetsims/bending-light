// Copyright 2015-2022, University of Colorado Boulder

/**
 * VelocitySensor that has a position and measures velocity
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import bendingLight from '../../bendingLight.js';

class VelocitySensor {
  public readonly positionProperty: Property<Vector2>;
  public readonly valueProperty: Property<Vector2>;
  public readonly enabledProperty: Property<boolean>;
  public readonly isArrowVisibleProperty: TReadOnlyProperty<boolean>;

  public constructor() {

    // position of the sensor. Sampled by running the sim with a console.log statement
    this.positionProperty = new Vector2Property( new Vector2( -0.00002051402284781722, -0.0000025716197470420186 ) );

    // velocity as measured by the sensor
    this.valueProperty = new Vector2Property( new Vector2( 0, 0 ) );

    // True if it is in the play area
    this.enabledProperty = new BooleanProperty( false );

    // shows the visibility of arrows
    this.isArrowVisibleProperty = new DerivedProperty( [ this.valueProperty ], value => value.magnitude > 0 );
  }

  /**
   * Restore the initial values.
   */
  public reset(): void {
    this.positionProperty.reset();
    this.valueProperty.reset();
    this.enabledProperty.reset();
  }

  // Make a copy for use in the toolbox icon
  public copy(): VelocitySensor {
    const velocitySensor = new VelocitySensor();
    velocitySensor.positionProperty.value = this.positionProperty.value.copy();
    velocitySensor.valueProperty.value = this.valueProperty.value.copy();
    velocitySensor.enabledProperty.value = this.enabledProperty.value;
    return velocitySensor;
  }

  /**
   * Translate the velocity sensor in model
   * @param delta - amount of space to be translated
   */
  private translate( delta: Vector2 ): void {
    this.positionProperty.set( this.positionProperty.value.plus( delta ) );
  }
}

bendingLight.register( 'VelocitySensor', VelocitySensor );

export default VelocitySensor;