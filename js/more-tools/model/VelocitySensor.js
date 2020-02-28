// Copyright 2015-2020, University of Colorado Boulder

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
import inherit from '../../../../phet-core/js/inherit.js';
import bendingLight from '../../bendingLight.js';

/**
 * @constructor
 */
function VelocitySensor() {

  // @public position of the sensor. Sampled by running the sim with a console.log statement
  this.positionProperty = new Vector2Property( new Vector2( -0.00002051402284781722, -0.0000025716197470420186 ) );

  // @public, velocity as measured by the sensor
  this.valueProperty = new Vector2Property( new Vector2( 0, 0 ) );

  // @public, True if it is in the play area
  this.enabledProperty = new Property( false );

  // shows the visibility of arrows
  this.isArrowVisibleProperty = new DerivedProperty( [ this.valueProperty ], function( value ) {
    return value.magnitude > 0;
  } );
}

bendingLight.register( 'VelocitySensor', VelocitySensor );

export default inherit( Object, VelocitySensor, {

  /**
   * Restore the initial values.
   */
  reset: function() {
    this.positionProperty.reset();
    this.valueProperty.reset();
    this.enabledProperty.reset();
  },

  // Make a copy for use in the toolbox icon
  copy: function() {
    const velocitySensor = new VelocitySensor();
    velocitySensor.positionProperty.value = this.positionProperty.value.copy();
    velocitySensor.valueProperty.value = this.valueProperty.value.copy();
    velocitySensor.enabledProperty.value = this.enabledProperty.value;
    return velocitySensor;
  },

  /**
   * Translate the velocity sensor in model
   * @public
   * @param {Vector2} delta - amount of space to be translated
   */
  translate: function( delta ) {
    this.positionProperty.set( this.positionProperty.value.plus( delta ) );
  }
} );