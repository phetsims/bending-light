// Copyright 2015-2025, University of Colorado Boulder

/**
 * The 'Prisms' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import prismsScreenWhite_png from '../../mipmaps/prismsScreenWhite_png.js';
import prismsScreenWhiteNavBar_png from '../../mipmaps/prismsScreenWhiteNavBar_png.js';
import bendingLight from '../bendingLight.js';
import BendingLightStrings from '../BendingLightStrings.js';
import PrismsModel from './model/PrismsModel.js';
import PrismsScreenView from './view/PrismsScreenView.js';

export default class PrismsScreen extends Screen<PrismsModel, PrismsScreenView> {
  public constructor( tandem: Tandem ) {

    const options: ScreenOptions = {
      name: BendingLightStrings.prismsStringProperty,
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