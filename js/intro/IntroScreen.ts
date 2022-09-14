// Copyright 2015-2022, University of Colorado Boulder

/**
 * The 'Intro' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import introScreen_png from '../../mipmaps/introScreen_png.js';
import BendingLightStrings from '../BendingLightStrings.js';
import bendingLight from '../bendingLight.js';
import Substance from '../common/model/Substance.js';
import IntroModel from './model/IntroModel.js';
import IntroScreenView from './view/IntroScreenView.js';
import LaserTypeAquaRadioButtonGroup from './view/LaserTypeAquaRadioButtonGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BendingLightModel from '../common/model/BendingLightModel.js';

class IntroScreen extends Screen<IntroModel, IntroScreenView> {

  private constructor( tandem: Tandem ) {

    const options = {
      name: BendingLightStrings.introStringProperty,
      homeScreenIcon: new ScreenIcon( new Image( introScreen_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    super(
      () => new IntroModel( Substance.WATER, true, tandem.createTandem( 'model' ) ),
      model => new IntroScreenView( model,
        false, // hasMoreTools
        2, // indexOfRefractionDecimals

        // createLaserControlPanel
        ( introModel: BendingLightModel ) => new LaserTypeAquaRadioButtonGroup( introModel.laserViewProperty ), {
          tandem: tandem.createTandem( 'view' )
        } ),
      options );
  }
}

bendingLight.register( 'IntroScreen', IntroScreen );

export default IntroScreen;