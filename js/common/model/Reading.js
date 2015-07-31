// Copyright 2002-2015, University of Colorado Boulder

/**
 * A single (immutable) reading for the intensity meter.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Util = require( 'DOT/Util' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var miss = require( 'string!BENDING_LIGHT/miss' );
  var valuePercentString = require( 'string!BENDING_LIGHT/pattern_0value_percent' );

  // constants
  var VALUE_DECIMALS = 2;

  /**
   * @constructor
   */
  function MISS() {
  }

  inherit( Object, MISS, {

    /**
     * Get string to display on intensity sensor
     * @public
     * @return {string}
     */
    getString: function() {
      return miss;
    },

    /**
     * Determines whether ray hit the intensity sensor or not
     * @return {boolean}
     */
    isHit: function() {
      return false;
    }
  } );

  /**
   * A single reading for the intensity meter
   *
   * @param {string} value - the text to be shown on the intensity meter
   * @constructor
   */
  function Reading( value ) {

    // @public read-only
    this.value = value;
  }

  return inherit( Object, Reading, {

      /**
       * Get string to display on intensity sensor
       * @public
       * @return {string}
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
        return StringUtils.format( valuePercentString, Util.toFixed( value, VALUE_DECIMALS ) );
      },

      /**
       * Determines whether ray hit the intensity sensor or not
       * @public
       * @return {boolean}
       */
      isHit: function() {
        return true;
      }
    },
    // statics
    {
      MISS: new MISS()
    } );

} );