// Copyright 2015-2021, University of Colorado Boulder

/**
 * VelocitySensor that has a position and measures velocity
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import bendingLight from '../../bendingLight.js';

class VelocitySensor {
  readonly positionProperty: Vector2Property;
  readonly valueProperty: Vector2Property;
  readonly enabledProperty: Property<boolean>;
  readonly isArrowVisibleProperty: DerivedProperty<boolean>;

  constructor() {

    // @public position of the sensor. Sampled by running the sim with a console.log statement
    this.positionProperty = new Vector2Property( new Vector2( -0.00002051402284781722, -0.0000025716197470420186 ) );

    // @public, velocity as measured by the sensor
    this.valueProperty = new Vector2Property( new Vector2( 0, 0 ) );

    // @public, True if it is in the play area
    this.enabledProperty = new Property( false );

    // shows the visibility of arrows
    this.isArrowVisibleProperty = new DerivedProperty( [ this.valueProperty ], ( value: Vector2 ) => value.magnitude > 0 );
  }

  /**
   * Restore the initial values.
   * @public
   */
  reset() {
    this.positionProperty.reset();
    this.valueProperty.reset();
    this.enabledProperty.reset();
  }

  // @public Make a copy for use in the toolbox icon
  copy() {
    const velocitySensor = new VelocitySensor();
    velocitySensor.positionProperty.value = this.positionProperty.value.copy();
    velocitySensor.valueProperty.value = this.valueProperty.value.copy();
    velocitySensor.enabledProperty.value = this.enabledProperty.value;
    return velocitySensor;
  }

  /**
   * Translate the velocity sensor in model
   * @public
   * @param {Vector2} delta - amount of space to be translated
   */
  translate( delta: Vector2 ) {
    this.positionProperty.set( this.positionProperty.value.plus( delta ) );
  }
}

bendingLight.register( 'VelocitySensor', VelocitySensor );

export default VelocitySensor;