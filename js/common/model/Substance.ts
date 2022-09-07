// Copyright 2015-2022, University of Colorado Boulder

/**
 * Immutable state for a medium, with the name and dispersion function, and flags for "mystery" and "custom".
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import BendingLightStrings from '../../BendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import DispersionFunction from './DispersionFunction.js';

const airString = BendingLightStrings.air;
const diamondString = BendingLightStrings.diamond;
const glassString = BendingLightStrings.glass;
const mysteryAString = BendingLightStrings.mysteryA;
const mysteryBString = BendingLightStrings.mysteryB;
const waterString = BendingLightStrings.water;

// constants
const DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = 2.419;

class Substance {
  public readonly dispersionFunction: DispersionFunction;
  public readonly mystery: boolean;
  public readonly indexOfRefractionForRedLight: number;
  public readonly name: string;
  public readonly indexForRed: number;
  public readonly custom: boolean;
  public static AIR: Substance;
  public static WATER: Substance;
  public static GLASS: Substance;
  public static DIAMOND: Substance;
  public static MYSTERY_A: Substance;
  public static MYSTERY_B: Substance;
  public static DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT: number;

  /**
   * @param name - name of the medium
   * @param indexForRed - index of refraction of medium
   * @param mystery - true if medium state is mystery else other state
   * @param custom - true if medium state is custom else other state
   */
  public constructor( name: string, indexForRed: number, mystery: boolean, custom: boolean ) {
    this.name = name; // (read-only)
    this.dispersionFunction = new DispersionFunction( indexForRed, BendingLightConstants.WAVELENGTH_RED ); // (read-only)
    this.mystery = mystery; // (read-only)
    this.custom = custom; // (read-only)
    this.indexOfRefractionForRedLight = this.dispersionFunction.getIndexOfRefraction( BendingLightConstants.WAVELENGTH_RED );
    this.indexForRed = indexForRed; // (read-only)
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