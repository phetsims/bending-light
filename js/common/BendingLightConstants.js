// Copyright 2002-2015, University of Colorado Boulder

/**
 * This class is a collection of constants that configure global properties.
 * If you change something here, it will change *everywhere* in this simulation.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );

  // constants (these are vars because other constants refer to them)
  var SPEED_OF_LIGHT = 2.99792458E8;
  var WAVELENGTH_RED = 650E-9; //nanometers

  //only go to 700nm because after that the reds are too black
  var LASER_MAX_WAVELENGTH = 700; // nm

  // so the refracted wave mode doesn't get too big because at angle = PI it would become infinite.
  // this value was determined by printing out actual angle values at runtime and sampling a good value.
  var MAX_ANGLE_IN_WAVE_MODE = 3.0194;
  return {

    SCREEN_VIEW_OPTIONS: { layoutBounds: new Bounds2( 0, 0, 834, 504 ) },

    LASER_MAX_WAVELENGTH: LASER_MAX_WAVELENGTH,
    // Constants moved from BendingLightModel
    SPEED_OF_LIGHT: SPEED_OF_LIGHT,
    MAX_ANGLE_IN_WAVE_MODE: MAX_ANGLE_IN_WAVE_MODE,
    WAVELENGTH_RED: WAVELENGTH_RED
  };
} );