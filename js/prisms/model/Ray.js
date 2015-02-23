// Copyright 2002-2012, University of Colorado
/**
 * A single immutable ray, used in the ray propagation algorithm.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  //var Vector2 = require( 'DOT/Vector2' );
  var SPEED_OF_LIGHT;

  /**
   *
   * @param tail
   * @param directionUnitVector
   * @param power
   * @param wavelength
   * @param mediumIndexOfRefraction
   * @param frequency
   * @constructor
   */
  function Ray( tail, directionUnitVector, power, wavelength, mediumIndexOfRefraction, frequency ) {

    this.tail = tail;
    //power of the ray (1 is full power of the laser),
    // will be reduced if partial reflection/refraction
    this.power = power;
    //Wavelength inside the medium (depends on index of refraction)
    this.wavelength = wavelength;
    this.mediumIndexOfRefraction = mediumIndexOfRefraction;
    this.frequency = frequency;
    this.directionUnitVector = directionUnitVector/*.normalized()*/;
  }

  return inherit( Object, Ray, {
    //Gets the wavelength for this ray if it wasn't inside a medium
    getBaseWavelength: function() {
      return SPEED_OF_LIGHT / this.frequency;
    }
  } );
} );

