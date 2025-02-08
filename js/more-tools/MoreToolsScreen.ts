// Copyright 2015-2025, University of Colorado Boulder

/**
 * The 'more tools' screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../axon/js/Property.js';
import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import moreToolsScreen_png from '../../mipmaps/moreToolsScreen_png.js';
import bendingLight from '../bendingLight.js';
import BendingLightStrings from '../BendingLightStrings.js';
import MoreToolsModel from './model/MoreToolsModel.js';
import MoreToolsScreenView from './view/MoreToolsScreenView.js';

export default class MoreToolsScreen extends Screen<MoreToolsModel, MoreToolsScreenView> {
  public constructor( tandem: Tandem ) {

    const options: ScreenOptions = {
      name: BendingLightStrings.moreToolsStringProperty,

      homeScreenIcon: new ScreenIcon( new Image( moreToolsScreen_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    super(
      () => new MoreToolsModel( tandem.createTandem( 'model' ) ),
      model => new MoreToolsScreenView( model, {
        tandem: options.tandem.createTandem( 'view' )
      } ),
      options
    );
  }
}

bendingLight.register( 'MoreToolsScreen', MoreToolsScreen );