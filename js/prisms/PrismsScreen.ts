// Copyright 2015-2021, University of Colorado Boulder

/**
 * The 'Prisms' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import prismsScreenWhiteNavBar_png from '../../mipmaps/prismsScreenWhiteNavBar_png.js';
import prismsScreenWhite_png from '../../mipmaps/prismsScreenWhite_png.js';
import bendingLightStrings from '../bendingLightStrings.js';
import bendingLight from '../bendingLight.js';
import PrismsModel from './model/PrismsModel.js';
import PrismsScreenView from './view/PrismsScreenView.js';
import Tandem from '../../../tandem/js/Tandem.js';

const prismsString = bendingLightStrings.prisms;

class PrismsScreen extends Screen<PrismsModel, PrismsScreenView> {
  constructor( tandem: Tandem ) {

    const options = {
      name: prismsString,
      homeScreenIcon: new ScreenIcon( new Image( prismsScreenWhite_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( prismsScreenWhiteNavBar_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new PrismsModel( {
        tandem: options.tandem.createTandem( 'model' )
      } ),
      model => new PrismsScreenView( model, {
        tandem: options.tandem.createTandem( 'view' )
      } ),
      options );
  }
}

bendingLight.register( 'PrismsScreen', PrismsScreen );

export default PrismsScreen;