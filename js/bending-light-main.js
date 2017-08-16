// Copyright 2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var IntroScreen = require( 'BENDING_LIGHT/intro/IntroScreen' );
  var PrismsScreen = require( 'BENDING_LIGHT/prisms/PrismsScreen' );
  var MoreToolsScreen = require( 'BENDING_LIGHT/more-tools/MoreToolsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // strings
  var bendingLightTitleString = require( 'string!BENDING_LIGHT/bending-light.title' );

  // constants
  var tandem = Tandem.createRootTandem();

  var simOptions = {
    credits: {
      leadDesign: 'Amy Rouinfar (HTML5),  Noah Podolefsky (Java)',
      softwareDevelopment: 'Sam Reid',
      team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Ethan Johnson, Elise Morgan, Oliver Orejola, ' +
                        'Arnab Purkayastha, Ben Roberts, Bryan Yoelin',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team to convert this simulation to HTML5.'
    }
  };

  SimLauncher.launch( function() {
    var sim = new Sim( bendingLightTitleString, [
      new IntroScreen( tandem.createTandem( 'introScreen' ) ),
      new PrismsScreen( tandem.createTandem( 'prismsScreen' ) ),
      new MoreToolsScreen( tandem.createTandem( 'moreToolsScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );