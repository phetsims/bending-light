// Copyright 2015-2017, University of Colorado Boulder

/**
 * A single (immutable) reading for the intensity meter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Util = require( 'DOT/Util' );

  // strings
  var missString = require( 'string!BENDING_LIGHT/miss' );
  var pattern0ValuePercentString = require( 'string!BENDING_LIGHT/pattern_0value_percent' );

  // constants
  var VALUE_DECIMALS = 2;

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
  
  return inherit( Object, Reading, {

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
        return StringUtils.format( pattern0ValuePercentString, Util.toFixed( value, VALUE_DECIMALS ) );
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
} );