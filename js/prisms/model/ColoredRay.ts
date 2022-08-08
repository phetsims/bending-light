// Copyright 2015-2022, University of Colorado Boulder

/**
 * A single immutable ray, used in the ray propagation algorithm.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Ray2 from '../../../../dot/js/Ray2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';

class ColoredRay {
  public readonly ray: Ray2;
  public readonly power: number;
  public readonly wavelength: number;
  public readonly mediumIndexOfRefraction: number;
  public readonly frequency: number;

  /**
   * @param ray - tail and direction
   * @param power - power of the ray
   * @param wavelength - wavelength of ray
   * @param mediumIndexOfRefraction - index of refraction of medium
   * @param frequency - frequency of ray
   */
  public constructor( ray: Ray2, power: number, wavelength: number, mediumIndexOfRefraction: number, frequency: number ) {

    assert && assert( !isNaN( ray.direction.magnitude ), 'direction unit vector should have a numeric magnitude' );

    this.ray = ray;

    // Power of the ray (1 is full power of the laser), will be reduced if partial reflection/refraction
    this.power = power; // (read-only)

    // Wavelength inside the medium (depends on index of refraction)
    this.wavelength = wavelength; // (read-only)
    this.mediumIndexOfRefraction = mediumIndexOfRefraction; // (read-only)
    this.frequency = frequency; // (read-only)
  }

  public get tail(): Vector2 {
    return this.ray.position;
  }

  public get directionUnitVector(): Vector2 {
    return this.ray.direction;
  }

  /**
   * Gets the wavelength for this ray if it wasn't inside a medium
   */
  public getBaseWavelength(): number {
    return BendingLightConstants.SPEED_OF_LIGHT / this.frequency;
  }
}

bendingLight.register( 'ColoredRay', ColoredRay );

export default ColoredRay;