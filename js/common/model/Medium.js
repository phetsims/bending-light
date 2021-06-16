// Copyright 2015-2021, University of Colorado Boulder

/**
 * A Medium is a substance through which LightRay instances propagate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
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

// TODO: Just instrument the "substance" instead
Medium.MediumIO = new IOType( 'MediumIO', {
  valueType: Medium,
  methods: {

    setName: {
      returnType: VoidIO,
      parameterTypes: [ StringIO ],
      implementation: text => {
        this.name = text;
      },
      documentation: 'Set the name of the solute',
      invocableForReadOnlyElements: false
    },

    setFormula: {
      returnType: VoidIO,
      parameterTypes: [ StringIO ],
      implementation: text => {
        this.formula = text;
      },
      documentation: 'Set the formula of the solute',
      invocableForReadOnlyElements: false
    }
  },

  // TODO: This needs to be implemented
  toStateObject( medium ) {
    return {};
  }
} );

bendingLight.register( 'Medium', Medium );
export default Medium;