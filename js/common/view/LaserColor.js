// Copyright 2015-2020, University of Colorado Boulder

/**
 * Enum type pattern for the laser color, which may be white or a specific wavelength.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import bendingLight from '../../bendingLight.js';

/**
 * @param {number} wavelength - wavelength (in meters) of the light
 * @constructor
 */
function LaserColor( wavelength ) {
  this.wavelength = wavelength; // @public
}

bendingLight.register( 'LaserColor', LaserColor );

export default inherit( Object, LaserColor, {

  /**
   * Determine the color of the light.
   * @public
   * @returns {Color}
   */
  getColor: function() {
    return VisibleColor.wavelengthToColor( this.wavelength * 1E9 ); // convert to nanometers
  }
} );