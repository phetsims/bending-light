// Copyright 2015-2020, University of Colorado Boulder

/**
 * The 'Intro' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Image from '../../../scenery/js/nodes/Image.js';
import icon from '../../mipmaps/Intro_Screen_png.js';
import bendingLightStrings from '../bendingLightStrings.js';
import bendingLight from '../bendingLight.js';
import Substance from '../common/model/Substance.js';
import IntroModel from './model/IntroModel.js';
import IntroScreenView from './view/IntroScreenView.js';
import LaserTypeAquaRadioButtonGroup from './view/LaserTypeAquaRadioButtonGroup.js';

const introString = bendingLightStrings.intro;

class IntroScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: introString,
      homeScreenIcon: new Image( icon ),
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    super(
      () => new IntroModel( Substance.WATER, true, tandem.createTandem( 'model' ) ),
      model => new IntroScreenView( model,
        false, // hasMoreTools
        2, // indexOfRefractionDecimals

        // createLaserControlPanel
        function( introModel ) {
          return new LaserTypeAquaRadioButtonGroup( introModel.laserViewProperty );
        } ),
      options );
  }
}

bendingLight.register( 'IntroScreen', IntroScreen );

export default IntroScreen;