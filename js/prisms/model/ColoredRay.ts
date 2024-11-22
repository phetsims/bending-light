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

export default class ColoredRay {

  /**
   * @param ray - tail and direction
   * @param power - Power of the ray (1 is full power of the laser), will be reduced if partial reflection/refraction
   * @param wavelength - Wavelength inside the medium (depends on index of refraction)
   * @param mediumIndexOfRefraction - index of refraction of medium
   * @param frequency - frequency of ray
   */
  public constructor(
    public readonly ray: Ray2,
    public readonly power: number,
    public readonly wavelength: number,
    public readonly mediumIndexOfRefraction: number,
    public readonly frequency: number
  ) {
    assert && assert( !isNaN( ray.direction.magnitude ), 'direction unit vector should have a numeric magnitude' );
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