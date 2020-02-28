// Copyright 2015-2020, University of Colorado Boulder

/**
 * A single immutable ray, used in the ray propagation algorithm.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';

/**
 * @param {Ray2} ray - tail and direction
 * @param {number} power - power of the ray
 * @param {number} wavelength - wavelength of ray
 * @param {number} mediumIndexOfRefraction - index of refraction of medium
 * @param {number} frequency - frequency of ray
 * @constructor
 */
function ColoredRay( ray, power, wavelength, mediumIndexOfRefraction, frequency ) {

  assert && assert( !isNaN( ray.direction.magnitude ), 'direction unit vector should have a numeric magnitude' );

  // @private, read only.
  this.ray = ray;

  // Power of the ray (1 is full power of the laser), will be reduced if partial reflection/refraction
  this.power = power; // @public (read-only)

  // Wavelength inside the medium (depends on index of refraction)
  this.wavelength = wavelength; // @public (read-only)
  this.mediumIndexOfRefraction = mediumIndexOfRefraction; // @public (read-only)
  this.frequency = frequency; // @public (read-only)
}

bendingLight.register( 'ColoredRay', ColoredRay );

export default inherit( Object, ColoredRay, {

  // @public
  get tail() {
    return this.ray.position;
  },

  // @public
  get directionUnitVector() {
    return this.ray.direction;
  },

  /**
   * Gets the wavelength for this ray if it wasn't inside a medium
   * @public
   * @returns {number}
   */
  getBaseWavelength: function() {
    return BendingLightConstants.SPEED_OF_LIGHT / this.frequency;
  }
} );