// Copyright 2015-2021, University of Colorado Boulder

/**
 * Immutable state for a medium, with the name and dispersion function, and flags for "mystery" and "custom".
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import bendingLightStrings from '../../bendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import DispersionFunction from './DispersionFunction.js';

const airString = bendingLightStrings.air;
const diamondString = bendingLightStrings.diamond;
const glassString = bendingLightStrings.glass;
const mysteryAString = bendingLightStrings.mysteryA;
const mysteryBString = bendingLightStrings.mysteryB;
const waterString = bendingLightStrings.water;

// constants
const DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = 2.419;

class Substance {
  readonly dispersionFunction: DispersionFunction;
  readonly mystery: boolean;
  readonly indexOfRefractionForRedLight: number;
  private readonly name: string;
  readonly indexForRed: number;
  private readonly custom: boolean;
  static AIR: Substance;
  static WATER: Substance;
  static GLASS: Substance;
  static DIAMOND: Substance;
  static MYSTERY_A: Substance;
  static MYSTERY_B: Substance;
  static DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT: number;

  /**
   * @param {string} name - name of the medium
   * @param {number} indexForRed - index of refraction of medium
   * @param {boolean} mystery - true if medium state is mystery else other state
   * @param {boolean} custom - true if medium state is custom else other state
   */
  constructor( name: string, indexForRed: number, mystery: boolean, custom: boolean ) {
    this.name = name; // @public (read-only)
    this.dispersionFunction = new DispersionFunction( indexForRed, BendingLightConstants.WAVELENGTH_RED ); // @public (read-only)
    this.mystery = mystery; // @public (read-only)
    this.custom = custom; // @public (read-only)
    this.indexOfRefractionForRedLight = this.dispersionFunction.getIndexOfRefraction( BendingLightConstants.WAVELENGTH_RED );
    this.indexForRed = indexForRed; // @public (read-only)
  }
}

bendingLight.register( 'Substance', Substance );

// static instances
Substance.AIR = new Substance( airString, 1.000293, false, false );
Substance.WATER = new Substance( waterString, 1.333, false, false );
Substance.GLASS = new Substance( glassString, 1.5, false, false );
Substance.DIAMOND = new Substance( diamondString, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, false, false );
Substance.MYSTERY_A = new Substance( mysteryAString, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, true, false );
Substance.MYSTERY_B = new Substance( mysteryBString, 1.4, true, false );

Substance.DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT;

export default Substance;