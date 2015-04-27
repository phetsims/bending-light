// Copyright 2002-2015, University of Colorado Boulder
/**
 * Enum type pattern for the laser color, which may be white or a specific wavelength.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );

  var WAVELENGTH_RED = 650E-9;

  var WHITE_LIGHT = function () {
  };

  inherit( Object, WHITE_LIGHT, {
    getWavelength: function() {
      return WAVELENGTH_RED;
    },
    getColor: function() {
      return new Color( 128, 128, 128 );
    }
  } );
  var OneColor = function ( wavelength ) {
    this.wavelength = wavelength;
  };

  inherit( Object, OneColor, {
    getColor: function() {
      return VisibleColor.wavelengthToColor( this.wavelength * 1E9 );
    },
    getWavelength: function() {
      return this.wavelength;
    }
  } );

  function LaserColor() {}

  return inherit( Object, LaserColor, {
      //Determine the wavelength (in nm) of the light
      getWavelength: function() {},
      //Determine the color of the light.
      getColor: function() {}
    },
    {
      OneColor: OneColor,
      WHITE_LIGHT: WHITE_LIGHT
    } );
} );