// Copyright 2015-2024, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BendingLightStrings from './BendingLightStrings.js';
import IntroScreen from './intro/IntroScreen.js';
import MoreToolsScreen from './more-tools/MoreToolsScreen.js';
import PrismsScreen from './prisms/PrismsScreen.js';

const bendingLightTitleStringProperty = BendingLightStrings[ 'bending-light' ].titleStringProperty;

// constants
const tandem = Tandem.ROOT;

simLauncher.launch( () => {
  const sim = new Sim( bendingLightTitleStringProperty, [
    new IntroScreen( tandem.createTandem( 'introScreen' ) ),
    new PrismsScreen( tandem.createTandem( 'prismsScreen' ) ),
    new MoreToolsScreen( tandem.createTandem( 'moreToolsScreen' ) )
  ], {
    credits: {
      leadDesign: 'Amy Rouinfar (HTML5),  Noah Podolefsky (Java)',
      softwareDevelopment: 'Sam Reid',
      team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Ethan Johnson, Matthew Moore, Elise Morgan, Ashton Morris, Oliver Orejola, ' +
                        'Arnab Purkayastha, Ben Roberts, Nancy Salpepi, Kathryn Woessner, Bryan Yoelin',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team to convert this simulation to HTML5.'
    },
    webgl: true
  } );
  sim.start();
} );