// Copyright 2015-2019, University of Colorado Boulder

/**
 * The 'more tools' screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import Image from '../../../scenery/js/nodes/Image.js';
import iconImage from '../../mipmaps/More_Tools_Screen_png.js';
import bendingLightStrings from '../bending-light-strings.js';
import bendingLight from '../bendingLight.js';
import MoreToolsModel from './model/MoreToolsModel.js';
import MoreToolsView from './view/MoreToolsView.js';

const moreToolsString = bendingLightStrings.moreTools;


/**
 * @constructor
 */
function MoreToolsScreen( tandem ) {

  const options = {
    name: moreToolsString,
    homeScreenIcon: new Image( iconImage ),
    backgroundColorProperty: new Property( 'white' ),
    tandem: tandem
  };

  Screen.call( this,
    function() { return new MoreToolsModel(); },
    function( model ) { return new MoreToolsView( model ); },
    options );
}

bendingLight.register( 'MoreToolsScreen', MoreToolsScreen );

inherit( Screen, MoreToolsScreen );
export default MoreToolsScreen;