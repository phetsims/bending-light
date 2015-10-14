// Copyright 2002-2015, University of Colorado Boulder

/**
 * Models dispersion functions for each material. Uses the actual dispersion equation for air (A) and the actual
 * dispersion equation for glass (G) then interpolates between the functions n(lambda) = beta * A(lambda) + (1-beta) *
 * G(lambda) where 0<=beta<=infinity is a characteristic of the material. The material is characterized by a reference
 * wavelength, so that when light is the specified wavelength, the index of refraction takes the reference value.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Util = require( 'DOT/Util' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );

  /**
   * @param {number} referenceIndexOfRefraction - IndexOfRefraction of medium
   * @param {number} wavelength - wavelength in meters
   * @constructor
   */
  function DispersionFunction( referenceIndexOfRefraction, wavelength ) {
    this.referenceIndexOfRefraction = referenceIndexOfRefraction; // @public
    this.referenceWavelength = wavelength; // @public
  }

  return inherit( Object, DispersionFunction, {

    /**
     * See http://en.wikipedia.org/wiki/Sellmeier_equation
     * @public
     * @param {number} wavelength - wavelength in meters
     * @returns {number}
     */
    getSellmeierValue: function( wavelength ) {
      var L2 = wavelength * wavelength;
      var B1 = 1.03961212;
      var B2 = 0.231792344;
      var B3 = 1.01046945;

      // convert to metric
      var C1 = 6.00069867E-3 * 1E-12;
      var C2 = 2.00179144E-2 * 1E-12;
      var C3 = 1.03560653E2 * 1E-12;
      return Math.sqrt( 1 + B1 * L2 / (L2 - C1) + B2 * L2 / (L2 - C2) + B3 * L2 / (L2 - C3) );
    },

    /**
     * Determines the index of refraction for the WAVELENGTH_RED
     * @returns {number}
     * @public
     */
    getIndexOfRefractionForRed: function() {
      return this.getIndexOfRefraction( BendingLightConstants.WAVELENGTH_RED );
    },

    /**
     * See class-level documentation for an explanation of this algorithm
     * @param {number} wavelength - wavelength in meters
     * @returns {number}
     * @public
     */
    getIndexOfRefraction: function( wavelength ) {

      // get the reference values
      var nAirReference = this.getAirIndex( this.referenceWavelength );
      var nGlassReference = this.getSellmeierValue( this.referenceWavelength );

      // determine the mapping and make sure it is in a good range
      var delta = nGlassReference - nAirReference;

      // 0 to 1 (air to glass)
      var x = (this.referenceIndexOfRefraction - nAirReference) / delta;
      x = Util.clamp( x, 0, Number.POSITIVE_INFINITY );

      // take a linear combination of glass and air equations
      return x * this.getSellmeierValue( wavelength ) + (1 - x) * this.getAirIndex( wavelength );
    },

    /**
     * See http://refractiveindex.info/?group=GASES&material=Air
     * @param {number} wavelength - wavelength in meters
     * @returns {number}
     * @private
     */
    getAirIndex: function( wavelength ) {
      return 1 +
             5792105E-8 / (238.0185 - Math.pow( wavelength * 1E6, -2 )) +
             167917E-8 / (57.362 - Math.pow( wavelength * 1E6, -2 ));
    }
  } );
} );