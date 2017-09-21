// Copyright 2015-2017, University of Colorado Boulder

/**
 * A single immutable ray, used in the ray propagation algorithm.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Ray2} ray - tail and direction
   * @param {number} power - power of the ray
   * @param {number} wavelength - wavelength of ray
   * @param {number} mediumIndexOfRefraction - index of refraction of medium
   * @param {number} frequency - frequency of ray
   * @constructor
   */
  function ColoredRay( ray, power, wavelength, mediumIndexOfRefraction, frequency ) {

    assert && assert( !isNaN( ray.direction.magnitude() ), 'direction unit vector should have a numeric magnitude' );

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
  
  return inherit( Object, ColoredRay, {

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
} );