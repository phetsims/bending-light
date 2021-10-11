// Copyright 2015-2021, University of Colorado Boulder

/**
 * The 'more tools' screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import iconImage from '../../mipmaps/More_Tools_Screen_png.js';
import bendingLightStrings from '../bendingLightStrings.js';
import bendingLight from '../bendingLight.js';
import MoreToolsModel from './model/MoreToolsModel.js';
import MoreToolsScreenView from './view/MoreToolsScreenView.js';
import Tandem from '../../../tandem/js/Tandem.js';

const moreToolsString = bendingLightStrings.moreTools;

class MoreToolsScreen extends Screen {
  constructor( tandem: Tandem ) {

    const options = {
      name: moreToolsString,

      // @ts-ignore
      homeScreenIcon: new ScreenIcon( new Image( iconImage ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    super(
      () => new MoreToolsModel( tandem.createTandem( 'model' ) ),
      ( model: MoreToolsModel ) => new MoreToolsScreenView( model, {
        tandem: options.tandem.createTandem( 'view' )
      } ),
      options
    );
  }
}

bendingLight.register( 'MoreToolsScreen', MoreToolsScreen );

export default MoreToolsScreen;