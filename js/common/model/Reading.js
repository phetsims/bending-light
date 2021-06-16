// Copyright 2015-2021, University of Colorado Boulder

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

  /**
   * A single reading for the intensity meter
   *
   * @param {string} value - the text to be shown on the intensity meter
   */
  constructor( value ) {

    // @public (read-only)
    this.value = value;
  }

  /**
   * Get string to display on intensity sensor
   * @public
   * @returns {string}
   */
  getString() {
    return this.format( this.value * 100 );
  }

  /**
   * @public
   * @param {number} value - value to be displayed on intensity meter
   * @returns {string}
   */
  format( value ) {
    return StringUtils.format( pattern0ValuePercentString, Utils.toFixed( value, VALUE_DECIMALS ) );
  }

  /**
   * Determines whether ray hit the intensity sensor or not
   * @public
   * @returns {boolean}
   */
  isHit() {
    return true;
  }
}

Reading.MISS = {

  /**
   * Get string to display on intensity sensor
   * @public
   * @returns {string}
   */
  getString: () => missString,

  /**
   * Determines whether ray hit the intensity sensor or not
   * @returns {boolean}
   */
  isHit: () => false
};

bendingLight.register( 'Reading', Reading );

export default Reading;