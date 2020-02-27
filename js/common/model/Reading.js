// Copyright 2015-2019, University of Colorado Boulder

/**
 * A single (immutable) reading for the intensity meter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Utils from '../../../../dot/js/Utils.js';
import inherit from '../../../../phet-core/js/inherit.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import bendingLightStrings from '../../bending-light-strings.js';
import bendingLight from '../../bendingLight.js';

// strings
const missString = MathSymbols.NO_VALUE;
const pattern0ValuePercentString = bendingLightStrings.pattern_0value_percent;

// constants
const VALUE_DECIMALS = 2;

/**
 * A single reading for the intensity meter
 *
 * @param {string} value - the text to be shown on the intensity meter
 * @constructor
 */
function Reading( value ) {

  // @public (read-only)
  this.value = value;
}

bendingLight.register( 'Reading', Reading );

export default inherit( Object, Reading, {

    /**
     * Get string to display on intensity sensor
     * @public
     * @returns {string}
     */
    getString: function() {
      return this.format( this.value * 100 );
    },

    /**
     * @public
     * @param {number} value - value to be displayed on intensity meter
     * @returns {string}
     */
    format: function( value ) {
      return StringUtils.format( pattern0ValuePercentString, Utils.toFixed( value, VALUE_DECIMALS ) );
    },

    /**
     * Determines whether ray hit the intensity sensor or not
     * @public
     * @returns {boolean}
     */
    isHit: function() {
      return true;
    }
  },
  // statics
  {
    MISS: {

      /**
       * Get string to display on intensity sensor
       * @public
       * @returns {string}
       */
      getString: function() {
        return missString;
      },

      /**
       * Determines whether ray hit the intensity sensor or not
       * @returns {boolean}
       */
      isHit: function() {
        return false;
      }
    }
  } );