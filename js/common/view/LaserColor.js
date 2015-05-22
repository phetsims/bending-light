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
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );

  /**
   *
   * @param {number} wavelength
   * @constructor
   */
  var OneColor = function( wavelength ) {
    this.wavelength = wavelength;
  };

  inherit( Object, OneColor, {

    /**
     * Determine the color of the light.
     * @public
     * @returns {Color}
     */
    getColor: function() {
      return VisibleColor.wavelengthToColor( this.wavelength * 1E9 ); // convert to nanometers
    },

    /**
     * Determine the wavelength (in nm) of the light.
     * @public
     * @returns {number}
     */
    getWavelength: function() {
      return this.wavelength;
    }
  } );
  return {
    OneColor: OneColor
  };
} );