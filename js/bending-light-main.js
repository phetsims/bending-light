// Copyright 2015-2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import bendingLightStrings from './bending-light-strings.js';
import IntroScreen from './intro/IntroScreen.js';
import MoreToolsScreen from './more-tools/MoreToolsScreen.js';
import PrismsScreen from './prisms/PrismsScreen.js';

const bendingLightTitleString = bendingLightStrings[ 'bending-light' ].title;

// constants
const tandem = Tandem.ROOT;

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

SimLauncher.launch( () => {
  const sim = new Sim( bendingLightTitleString, [
    new IntroScreen( tandem.createTandem( 'introScreen' ) ),
    new PrismsScreen( tandem.createTandem( 'prismsScreen' ) ),
    new MoreToolsScreen( tandem.createTandem( 'moreToolsScreen' ) )
  ], simOptions );
  sim.start();
} );