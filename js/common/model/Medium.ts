// Copyright 2015-2024, University of Colorado Boulder

/**
 * A Medium is a substance through which LightRay instances propagate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Color } from '../../../../scenery/js/imports.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import bendingLight from '../../bendingLight.js';
import Substance from './Substance.js';

class Medium {
  public shape: Shape;
  public substance: Substance;
  public color: Color;
  //TODO https://github.com/phetsims/bending-light/issues/389 Just instrument the "substance" instead
  public static readonly MediumIO = new IOType( 'MediumIO', {
    valueType: Medium,

    //TODO https://github.com/phetsims/bending-light/issues/389 This needs to be implemented
    toStateObject( medium: Medium ) {
      return {};
    },
    stateSchema: {

    }
  } );

  /**
   * @param shape - shape of the medium
   * @param substance - state of the medium
   * @param color - color of the medium
   */
  public constructor( shape: Shape, substance: Substance, color: Color ) {

    // immutable shape
    this.shape = shape; // (read-only)
    this.substance = substance; // (read-only)
    this.color = color; // (read-only), color is based on the index of refraction at red wavelength
  }

  /**
   * Determines the index of refraction of medium
   * @param wavelength - wavelength of the medium
   */
  public getIndexOfRefraction( wavelength: number ): number {
    return this.substance.dispersionFunction.getIndexOfRefraction( wavelength );
  }

  /**
   * Determines whether the medium is mystery or not
   */
  public isMystery(): boolean {
    return this.substance.mystery;
  }
}

bendingLight.register( 'Medium', Medium );
export default Medium;