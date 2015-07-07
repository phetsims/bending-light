// Copyright 2002-2015, University of Colorado Boulder

/**
 * Enum type pattern for the laser color, which may be white or a specific wavelength.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );

  /**
   *
   * @param {number} wavelength - wavelength (in meters) of the light
   * @constructor
   */
  function OneColor( wavelength ) {
    this.wavelength = wavelength;
  }

  return inherit( Object, OneColor, {

    /**
     * Determine the color of the light.
     * @public
     * @returns {Color}
     */
    getColor: function() {
      return VisibleColor.wavelengthToColor( this.wavelength * 1E9 ); // convert to nanometers
    }
  } );
} );