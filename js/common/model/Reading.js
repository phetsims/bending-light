// Copyright 2002-2015, University of Colorado Boulder

/**
 * A single (immutable) reading for the intensity meter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Util = require( 'DOT/Util' );

  // strings
  var miss = require( 'string!BENDING_LIGHT/miss' );

  // constants
  var VALUE_DECIMALS = 2;

  /**
   *
   * @constructor
   */
  function MISS() {

  }

  inherit( Object, MISS, {

    /**
     * @public
     * @return {string}
     */
    getString: function() {
      return miss;
    },

    /**
     *
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
       * @public
       * @return {string}
       */
      getString: function() {
        return this.format( this.value * 100 );
      },

      /**
       * @public
       * @param {number} value
       * @returns {string}
       */
      format: function( value ) {
        return Util.toFixed( value, VALUE_DECIMALS ) + "%";
      },

      /**
       * @public
       * @return {boolean}
       */
      isHit: function() {
        return true;
      },

      /**
       * @public
       * @return {number}
       */
      getValue: function() {
        return this.value;
      }
    },
    // statics
    {
      MISS: new MISS()
    } );

} );