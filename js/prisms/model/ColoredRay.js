// Copyright 2002-2015, University of Colorado Boulder

/**
 * A single immutable ray, used in the ray propagation algorithm.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );

  /**
   * @param {Vector2} tail - ray tail position
   * @param {Vector2} directionUnitVector - ray direction
   * @param {number} power - power of the ray
   * @param {number} wavelength - wavelength of ray
   * @param {number} mediumIndexOfRefraction - index of refraction of medium
   * @param {number} frequency - frequency of ray
   * @constructor
   */
  function ColoredRay( tail, directionUnitVector, power, wavelength, mediumIndexOfRefraction, frequency ) {

    this.tail = tail; // @public, read only.

    // Power of the ray (1 is full power of the laser), will be reduced if partial reflection/refraction
    this.power = power; // @public, read only.

    // Wavelength inside the medium (depends on index of refraction)
    this.wavelength = wavelength; // @public, read only.
    this.mediumIndexOfRefraction = mediumIndexOfRefraction; // @public, read only.
    this.frequency = frequency; // @public, read only.
    this.directionUnitVector = directionUnitVector; // @public, read only.
  }

  return inherit( Object, ColoredRay, {

    /**
     * Gets the wavelength for this ray if it wasn't inside a medium
     * @public
     * @` {number}
     */
    getBaseWavelength: function() {
      return BendingLightConstants.SPEED_OF_LIGHT / this.frequency;
    }
  } );
} );