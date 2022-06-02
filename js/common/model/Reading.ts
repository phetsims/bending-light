// Copyright 2015-2022, University of Colorado Boulder

/**
 * A single (immutable) reading for the intensity meter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import bendingLightStrings from '../../bendingLightStrings.js';
import bendingLight from '../../bendingLight.js';

// strings
const missString = MathSymbols.NO_VALUE;
const pattern0ValuePercentString = bendingLightStrings.pattern_0value_percent;

// constants
const VALUE_DECIMALS = 2;

class Reading {
  readonly value: number;
  static MISS: Reading;

  /**
   * A single reading for the intensity meter
   *
   * @param {string} value - the text to be shown on the intensity meter
   */
  constructor( value: number ) {

    // (read-only)
    this.value = value;
  }

  /**
   * Get string to display on intensity sensor
   */
  getString(): string {
    return this.format( this.value * 100 );
  }

  /**
   * @param {number} value - value to be displayed on intensity meter
   */
  format( value: number ): string {
    return StringUtils.format( pattern0ValuePercentString, Utils.toFixed( value, VALUE_DECIMALS ) );
  }

  /**
   * Determines whether ray hit the intensity sensor or not
   */
  isHit(): boolean {
    return true;
  }
}

Reading.MISS = {
  value: 0,
  format( value: number ) {return '';},

  /**
   * Get string to display on intensity sensor
   */
  getString: () => missString,

  /**
   * Determines whether ray hit the intensity sensor or not
   */
  isHit: () => false
};

bendingLight.register( 'Reading', Reading );

export default Reading;