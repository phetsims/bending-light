// Copyright 2015-2020, University of Colorado Boulder

/**
 * The 'Prisms' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Screen from '../../../joist/js/Screen.js';
import Image from '../../../scenery/js/nodes/Image.js';
import navbarIconImage from '../../mipmaps/Prisms_Screen_White_NavBar_png.js';
import iconImage from '../../mipmaps/Prisms_Screen_White_png.js';
import bendingLightStrings from '../bending-light-strings.js';
import bendingLight from '../bendingLight.js';
import PrismsModel from './model/PrismsModel.js';
import PrismsScreenView from './view/PrismsScreenView.js';

const prismsString = bendingLightStrings.prisms;

class PrismsScreen extends Screen {
  constructor( tandem ) {

    const options = {
      name: prismsString,
      homeScreenIcon: new Image( iconImage ),
      navigationBarIcon: new Image( navbarIconImage ),
      tandem: tandem
    };

    super(
      () => new PrismsModel(),
      model => new PrismsScreenView( model ),
      options );
  }
}

bendingLight.register( 'PrismsScreen', PrismsScreen );

export default PrismsScreen;