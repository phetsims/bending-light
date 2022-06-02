// Copyright 2015-2022, University of Colorado Boulder

/**
 * Enum type pattern for the laser color, which may be white or a specific wavelength.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import { Color } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';

class LaserColor {
  readonly wavelength: number;

  /**
   * @param {number} wavelength - wavelength (in meters) of the light
   */
  constructor( wavelength: number ) {
    this.wavelength = wavelength;
  }

  /**
   * Determine the color of the light.
   */
  getColor(): Color {
    return VisibleColor.wavelengthToColor( this.wavelength * 1E9 ); // convert to nanometers
  }
}

bendingLight.register( 'LaserColor', LaserColor );

export default LaserColor;