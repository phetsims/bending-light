// Copyright 2015-2024, University of Colorado Boulder

/**
 * Enum type pattern for the laser color, which may be white or a specific wavelength.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Color from '../../../../scenery/js/util/Color.js';
import bendingLight from '../../bendingLight.js';

export default class LaserColor {
  public readonly wavelength: number;

  /**
   * @param wavelength - wavelength (in meters) of the light
   */
  public constructor( wavelength: number ) {
    this.wavelength = wavelength;
  }

  /**
   * Determine the color of the light.
   */
  public getColor(): Color {
    return VisibleColor.wavelengthToColor( this.wavelength * 1E9 ); // convert to nanometers
  }
}

bendingLight.register( 'LaserColor', LaserColor );