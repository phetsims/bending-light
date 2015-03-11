//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A single (immutable) reading for the intensity meter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  // strings
  var miss = require( 'string!BENDING_LIGHT/miss' );

  // constants
  var VALUE_DECIMALS = 2;

  /**
   * @param {string} value - the text to be shown on the intensity meter
   * @constructor
   */
  function Reading( value ) {

    // Immutable
    this.value = value;
  }

  return inherit( Object, Reading, {
      getString: function() {
        if ( this.value !== '-' ) {
          return this.format( this.value );
        }
        else {
          return this.value;
        }
      },
      format: function( value ) {
        if ( value !== Reading.MISS ) {
          return value.toFixed( VALUE_DECIMALS ) + "%";
        }
      },
      isHit: function() {
        return true;
      },
      getValue: function() {
        return this.value;
      }
    },
    //statics
    {
      MISS: miss
    } );

} );