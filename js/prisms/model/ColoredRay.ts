// Copyright 2015-2022, University of Colorado Boulder

/**
 * A single immutable ray, used in the ray propagation algorithm.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Ray2 from '../../../../dot/js/Ray2.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';

class ColoredRay {
  readonly ray: Ray2;
  readonly power: number;
  readonly wavelength: number;
  readonly mediumIndexOfRefraction: number;
  readonly frequency: number;

  /**
   * @param {Ray2} ray - tail and direction
   * @param {number} power - power of the ray
   * @param {number} wavelength - wavelength of ray
   * @param {number} mediumIndexOfRefraction - index of refraction of medium
   * @param {number} frequency - frequency of ray
   */
  constructor( ray: Ray2, power: number, wavelength: number, mediumIndexOfRefraction: number, frequency: number ) {

    assert && assert( !isNaN( ray.direction.magnitude ), 'direction unit vector should have a numeric magnitude' );

    // @private, read only.
    this.ray = ray;

    // Power of the ray (1 is full power of the laser), will be reduced if partial reflection/refraction
    this.power = power; // (read-only)

    // Wavelength inside the medium (depends on index of refraction)
    this.wavelength = wavelength; // (read-only)
    this.mediumIndexOfRefraction = mediumIndexOfRefraction; // (read-only)
    this.frequency = frequency; // (read-only)
  }

  get tail() {
    return this.ray.position;
  }

  get directionUnitVector() {
    return this.ray.direction;
  }

  /**
   * Gets the wavelength for this ray if it wasn't inside a medium
   * @returns {number}
   */
  getBaseWavelength(): number {
    return BendingLightConstants.SPEED_OF_LIGHT / this.frequency;
  }
}

bendingLight.register( 'ColoredRay', ColoredRay );

export default ColoredRay;