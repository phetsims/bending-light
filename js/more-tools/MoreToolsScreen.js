// Copyright 2015-2020, University of Colorado Boulder

/**
 * The 'more tools' screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Image from '../../../scenery/js/nodes/Image.js';
import iconImage from '../../mipmaps/More_Tools_Screen_png.js';
import bendingLightStrings from '../bendingLightStrings.js';
import bendingLight from '../bendingLight.js';
import MoreToolsModel from './model/MoreToolsModel.js';
import MoreToolsScreenView from './view/MoreToolsScreenView.js';

const moreToolsString = bendingLightStrings.moreTools;

class MoreToolsScreen extends Screen {
  constructor( tandem ) {

    const options = {
      name: moreToolsString,
      homeScreenIcon: new Image( iconImage ),
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    super(
      () => new MoreToolsModel( tandem.createTandem( 'model' ) ),
      model => new MoreToolsScreenView( model ),
      options
    );
  }
}

bendingLight.register( 'MoreToolsScreen', MoreToolsScreen );

export default MoreToolsScreen;