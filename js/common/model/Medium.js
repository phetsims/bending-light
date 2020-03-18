// Copyright 2015-2020, University of Colorado Boulder

/**
 * A Medium is a substance through which LightRay instances propagate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import bendingLight from '../../bendingLight.js';

class Medium {

  /**
   * @param {Shape} shape - shape of the medium
   * @param {Substance} substance - state of the medium
   * @param {Color} color - color of the medium
   */
  constructor( shape, substance, color ) {

    // immutable shape
    this.shape = shape; // @public (read-only)
    this.substance = substance; // @public (read-only)
    this.color = color; // @public (read-only), color is based on the index of refraction at red wavelength
  }

  /**
   * Determines the index of refraction of medium
   * @public
   * @param {number} wavelength - wavelength of the medium
   * @returns {number}
   */
  getIndexOfRefraction( wavelength ) {
    return this.substance.dispersionFunction.getIndexOfRefraction( wavelength );
  }

  /**
   * Determines whether the medium is mystery or not
   * @public
   * @returns {boolean}
   */
  isMystery() {
    return this.substance.mystery;
  }
}

bendingLight.register( 'Medium', Medium );

export default Medium;