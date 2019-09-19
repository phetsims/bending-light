// Copyright 2015-2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const IntroScreen = require( 'BENDING_LIGHT/intro/IntroScreen' );
  const MoreToolsScreen = require( 'BENDING_LIGHT/more-tools/MoreToolsScreen' );
  const PrismsScreen = require( 'BENDING_LIGHT/prisms/PrismsScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const bendingLightTitleString = require( 'string!BENDING_LIGHT/bending-light.title' );

  // constants
  const tandem = Tandem.rootTandem;

  const simOptions = {
    credits: {
      leadDesign: 'Amy Rouinfar (HTML5),  Noah Podolefsky (Java)',
      softwareDevelopment: 'Sam Reid',
      team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Ethan Johnson, Elise Morgan, Oliver Orejola, ' +
                        'Arnab Purkayastha, Ben Roberts, Bryan Yoelin',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team to convert this simulation to HTML5.'
    },
    webgl: true
  };

  SimLauncher.launch( function() {
    const sim = new Sim( bendingLightTitleString, [
      new IntroScreen( tandem.createTandem( 'introScreen' ) ),
      new PrismsScreen( tandem.createTandem( 'prismsScreen' ) ),
      new MoreToolsScreen( tandem.createTandem( 'moreToolsScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );