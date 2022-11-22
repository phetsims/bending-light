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
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

const airStringProperty = BendingLightStrings.airStringProperty;
const diamondStringProperty = BendingLightStrings.diamondStringProperty;
const glassStringProperty = BendingLightStrings.glassStringProperty;
const mysteryAStringProperty = BendingLightStrings.mysteryAStringProperty;
const mysteryBStringProperty = BendingLightStrings.mysteryBStringProperty;
const waterStringProperty = BendingLightStrings.waterStringProperty;

// constants
const DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = 2.419;

class Substance {
  public readonly dispersionFunction: DispersionFunction;
  public readonly mystery: boolean;
  public readonly indexOfRefractionForRedLight: number;
  public readonly nameProperty: TReadOnlyProperty<string>;
  public readonly indexForRed: number;
  public readonly custom: boolean;
  public static readonly AIR = new Substance( airStringProperty, 1.000293, false, false );
  public static readonly WATER = new Substance( waterStringProperty, 1.333, false, false );
  public static readonly GLASS = new Substance( glassStringProperty, 1.5, false, false );
  public static readonly DIAMOND = new Substance( diamondStringProperty, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, false, false );
  public static readonly MYSTERY_A = new Substance( mysteryAStringProperty, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, true, false );
  public static readonly MYSTERY_B = new Substance( mysteryBStringProperty, 1.4, true, false );
  public static readonly DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT;

  /**
   * @param nameProperty - name of the medium
   * @param indexForRed - index of refraction of medium
   * @param mystery - true if medium state is mystery else other state
   * @param custom - true if medium state is custom else other state
   */
  public constructor( nameProperty: TReadOnlyProperty<string>, indexForRed: number, mystery: boolean, custom: boolean ) {
    this.nameProperty = nameProperty; // (read-only)
    this.dispersionFunction = new DispersionFunction( indexForRed, BendingLightConstants.WAVELENGTH_RED ); // (read-only)
    this.mystery = mystery; // (read-only)
    this.custom = custom; // (read-only)
    this.indexOfRefractionForRedLight = this.dispersionFunction.getIndexOfRefraction( BendingLightConstants.WAVELENGTH_RED );
    this.indexForRed = indexForRed; // (read-only)
  }
}

bendingLight.register( 'Substance', Substance );
export default Substance;