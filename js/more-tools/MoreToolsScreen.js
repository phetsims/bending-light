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
import bendingLightStrings from '../bending-light-strings.js';
import bendingLight from '../bendingLight.js';
import MoreToolsModel from './model/MoreToolsModel.js';
import MoreToolsView from './view/MoreToolsView.js';

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
      () => new MoreToolsModel(),
      model => new MoreToolsView( model ),
      options
    );
  }
}

bendingLight.register( 'MoreToolsScreen', MoreToolsScreen );

export default MoreToolsScreen;