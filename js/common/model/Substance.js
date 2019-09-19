// Copyright 2015-2017, University of Colorado Boulder

/**
 * Immutable state for a medium, with the name and dispersion function, and flags for "mystery" and "custom".
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  const DispersionFunction = require( 'BENDING_LIGHT/common/model/DispersionFunction' );
  const inherit = require( 'PHET_CORE/inherit' );

  // strings
  const airString = require( 'string!BENDING_LIGHT/air' );
  const diamondString = require( 'string!BENDING_LIGHT/diamond' );
  const glassString = require( 'string!BENDING_LIGHT/glass' );
  const mysteryAString = require( 'string!BENDING_LIGHT/mysteryA' );
  const mysteryBString = require( 'string!BENDING_LIGHT/mysteryB' );
  const waterString = require( 'string!BENDING_LIGHT/water' );

  // constants
  var DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = 2.419;

  /**
   * @param {string} name - name of the medium
   * @param {number} indexForRed - index of refraction of medium
   * @param {boolean} mystery - true if medium state is mystery else other state
   * @param {boolean} custom - true if medium state is custom else other state
   * @constructor
   */
  function Substance( name, indexForRed, mystery, custom ) {
    this.name = name; // @public (read-only)
    this.dispersionFunction = new DispersionFunction( indexForRed, BendingLightConstants.WAVELENGTH_RED ); // @public (read-only)
    this.mystery = mystery; // @public (read-only)
    this.custom = custom; // @public (read-only)
    this.indexOfRefractionForRedLight = this.dispersionFunction.getIndexOfRefraction( BendingLightConstants.WAVELENGTH_RED );
    this.indexForRed = indexForRed; // @public (read-only)
  }

  bendingLight.register( 'Substance', Substance );

  inherit( Object, Substance, {}, {
    DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT: DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT
  } );

  // static instances
  Substance.AIR = new Substance( airString, 1.000293, false, false );
  Substance.WATER = new Substance( waterString, 1.333, false, false );
  Substance.GLASS = new Substance( glassString, 1.5, false, false );
  Substance.DIAMOND = new Substance( diamondString, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, false, false );
  Substance.MYSTERY_A = new Substance( mysteryAString, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, true, false );
  Substance.MYSTERY_B = new Substance( mysteryBString, 1.4, true, false );

  return Substance;
} );