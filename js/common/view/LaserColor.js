// Copyright 2015, University of Colorado Boulder

/**
 * Enum type pattern for the laser color, which may be white or a specific wavelength.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var inherit = require( 'PHET_CORE/inherit' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );

  /**
   * @param {number} wavelength - wavelength (in meters) of the light
   * @constructor
   */
  function LaserColor( wavelength ) {
    this.wavelength = wavelength; // @public
  }

  bendingLight.register( 'LaserColor', LaserColor );
  
  return inherit( Object, LaserColor, {

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