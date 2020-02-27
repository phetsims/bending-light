// Copyright 2015-2019, University of Colorado Boulder

/**
 * Models dispersion functions for each material. Uses the actual dispersion equation for air (A) and the actual
 * dispersion equation for glass (G) then interpolates between the functions n(lambda) = beta * A(lambda) + (1-beta) *
 * G(lambda) where 0<=beta<=infinity is a characteristic of the material. The material is characterized by a reference
 * wavelength, so that when light is the specified wavelength, the index of refraction takes the reference value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Utils from '../../../../dot/js/Utils.js';
import inherit from '../../../../phet-core/js/inherit.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';

/**
 * @param {number} referenceIndexOfRefraction - IndexOfRefraction of medium
 * @param {number} wavelength - wavelength in meters
 * @constructor
 */
function DispersionFunction( referenceIndexOfRefraction, wavelength ) {
  this.referenceIndexOfRefraction = referenceIndexOfRefraction; // @public (read-only)
  this.referenceWavelength = wavelength; // @public (read-only)
}

bendingLight.register( 'DispersionFunction', DispersionFunction );

export default inherit( Object, DispersionFunction, {

  /**
   * See http://en.wikipedia.org/wiki/Sellmeier_equation
   * @public
   * @param {number} wavelength - wavelength in meters
   * @returns {number}
   */
  getSellmeierValue: function( wavelength ) {
    const L2 = wavelength * wavelength;
    const B1 = 1.03961212;
    const B2 = 0.231792344;
    const B3 = 1.01046945;

    // convert to metric
    const C1 = 6.00069867E-3 * 1E-12;
    const C2 = 2.00179144E-2 * 1E-12;
    const C3 = 1.03560653E2 * 1E-12;
    return Math.sqrt( 1 + B1 * L2 / ( L2 - C1 ) + B2 * L2 / ( L2 - C2 ) + B3 * L2 / ( L2 - C3 ) );
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
    const nAirReference = this.getAirIndex( this.referenceWavelength );
    const nGlassReference = this.getSellmeierValue( this.referenceWavelength );

    // determine the mapping and make sure it is in a good range
    const delta = nGlassReference - nAirReference;

    // 0 to 1 (air to glass)
    let x = ( this.referenceIndexOfRefraction - nAirReference ) / delta;
    x = Utils.clamp( x, 0, Number.POSITIVE_INFINITY );

    // take a linear combination of glass and air equations
    return x * this.getSellmeierValue( wavelength ) + ( 1 - x ) * this.getAirIndex( wavelength );
  },

  /**
   * See http://refractiveindex.info/?group=GASES&material=Air
   * @param {number} wavelength - wavelength in meters
   * @returns {number}
   * @private
   */
  getAirIndex: function( wavelength ) {
    return 1 +
           5792105E-8 / ( 238.0185 - Math.pow( wavelength * 1E6, -2 ) ) +
           167917E-8 / ( 57.362 - Math.pow( wavelength * 1E6, -2 ) );
  }
} );