// Copyright 2002-2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var IntroScreen = require( 'BENDING_LIGHT/intro/IntroScreen' );
  var PrismsScreen = require( 'BENDING_LIGHT/prisms/PrismsScreen' );
  var MoreToolsScreen = require( 'BENDING_LIGHT/more-tools/MoreToolsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!BENDING_LIGHT/bending-light.title' );

  var simOptions = {
    credits: {
      leadDesign: 'Amy Rouinfar (HTML5),  Noah Podolefsky (Java)',
      softwareDevelopment: 'Sam Reid',
      team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Elise Morgan, Oliver Orejola, Arnab Purkayastha, Bryan Yoelin',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team\nto convert this simulation to HTML5.'
    }
  };

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [ new IntroScreen(), new PrismsScreen(), new MoreToolsScreen() ], simOptions );
    sim.start();
  } );
} );