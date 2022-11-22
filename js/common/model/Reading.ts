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
import BendingLightStrings from '../../BendingLightStrings.js';
import bendingLight from '../../bendingLight.js';

// strings
const pattern0ValuePercentStringProperty = BendingLightStrings.pattern_0value_percentStringProperty;

// constants
const VALUE_DECIMALS = 2;

class Reading {
  public readonly value: number;
  public static readonly MISS = {
    value: 0,
    format( value: number ): string {return '';},

    /**
     * Get string to display on intensity sensor
     */
    getString: (): string => MathSymbols.NO_VALUE,

    /**
     * Determines whether ray hit the intensity sensor or not
     */
    isHit: (): boolean => false
  };

  /**
   * A single reading for the intensity meter
   *
   * @param value - the text to be shown on the intensity meter
   */
  public constructor( value: number ) {

    // (read-only)
    this.value = value;
  }

  /**
   * Get string to display on intensity sensor
   */
  public getString(): string {
    return this.format( this.value * 100 );
  }

  /**
   * @param value - value to be displayed on intensity meter
   */
  public format( value: number ): string {
    return StringUtils.format( pattern0ValuePercentStringProperty.value, Utils.toFixed( value, VALUE_DECIMALS ) );
  }

  /**
   * Determines whether ray hit the intensity sensor or not
   */
  public isHit(): boolean {
    return true;
  }
}

bendingLight.register( 'Reading', Reading );

export default Reading;