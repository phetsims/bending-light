// Copyright 2015-2021, University of Colorado Boulder

/**
 * The 'Intro' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Node from '../../../scenery/js/nodes/Node.js';
import icon from '../../mipmaps/Intro_Screen_png.js';
import bendingLightStrings from '../bendingLightStrings.js';
import bendingLight from '../bendingLight.js';
import Substance from '../common/model/Substance.js';
import IntroModel from './model/IntroModel.js';
import IntroScreenView from './view/IntroScreenView.js';
import LaserTypeAquaRadioButtonGroup from './view/LaserTypeAquaRadioButtonGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BendingLightModel from '../common/model/BendingLightModel.js';

const introString = bendingLightStrings.intro;

class IntroScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem: Tandem ) {

    const options = {
      name: introString,
      homeScreenIcon: new ScreenIcon( new Image( icon ) as unknown as Node, {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    super(
      () => new IntroModel( Substance.WATER, true, tandem.createTandem( 'model' ) ),
      ( model: IntroModel ) => new IntroScreenView( model,
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