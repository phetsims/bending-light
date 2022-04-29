// Copyright 2015-2022, University of Colorado Boulder

/**
 * A Medium is a substance through which LightRay instances propagate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Color } from '../../../../scenery/js/imports.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import bendingLight from '../../bendingLight.js';
import Substance from './Substance.js';

class Medium {
  shape: Shape;
  substance: Substance;
  color: Color;
  static MediumIO: IOType;

  /**
   * @param {Shape} shape - shape of the medium
   * @param {Substance} substance - state of the medium
   * @param {Color} color - color of the medium
   */
  constructor( shape: Shape, substance: Substance, color: Color ) {

    // immutable shape
    this.shape = shape; // (read-only)
    this.substance = substance; // (read-only)
    this.color = color; // (read-only), color is based on the index of refraction at red wavelength
  }

  /**
   * Determines the index of refraction of medium
   * @param {number} wavelength - wavelength of the medium
   * @returns {number}
   */
  getIndexOfRefraction( wavelength: number ): number {
    return this.substance.dispersionFunction.getIndexOfRefraction( wavelength );
  }

  /**
   * Determines whether the medium is mystery or not
   * @returns {boolean}
   */
  isMystery(): boolean {
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
      implementation: ( text: string ) => {
        // @ts-ignore
        this.name = text;
      },
      documentation: 'Set the name of the solute',
      invocableForReadOnlyElements: false
    },

    setFormula: {
      returnType: VoidIO,
      parameterTypes: [ StringIO ],
      implementation: ( text: string ) => {
        // @ts-ignore
        this.formula = text;
      },
      documentation: 'Set the formula of the solute',
      invocableForReadOnlyElements: false
    }
  },

  // TODO: This needs to be implemented
  toStateObject( medium: Medium ) {
    return {};
  }
} );

bendingLight.register( 'Medium', Medium );
export default Medium;