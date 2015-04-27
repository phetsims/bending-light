// Copyright 2002-2012, University of Colorado Boulder
/**
 * A single immutable ray, used in the ray propagation algorithm.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );

  /**
   *
   * @param {Vector2}  tail -ray tail position
   * @param {Vector2} directionUnitVector -ray direction
   * @param {Number} power -power of the ray
   * @param {Number} wavelength - wavelength of ray
   * @param {Number} mediumIndexOfRefraction = index of refraction of medium
   * @param {Number} frequency
   * @constructor
   */
  function Ray( tail, directionUnitVector, power, wavelength, mediumIndexOfRefraction, frequency ) {

    this.tail = tail;

    // power of the ray (1 is full power of the laser),
    // will be reduced if partial reflection/refraction
    this.power = power;

    // wavelength inside the medium (depends on index of refraction)
    this.wavelength = wavelength;
    this.mediumIndexOfRefraction = mediumIndexOfRefraction;
    this.frequency = frequency;
    this.directionUnitVector = directionUnitVector.normalized();
  }

  return inherit( Object, Ray, {

    /**
     * Gets the wavelength for this ray if it wasn't inside a medium
     * @returns {number}
     */
    getBaseWavelength: function() {
      return BendingLightConstants.SPEED_OF_LIGHT / this.frequency;
    }
  } );
} );

