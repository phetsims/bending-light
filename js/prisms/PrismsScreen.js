// Copyright 2015-2019, University of Colorado Boulder

/**
 * The 'Prisms' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import Image from '../../../scenery/js/nodes/Image.js';
import navbarIconImage from '../../mipmaps/Prisms_Screen_White_NavBar_png.js';
import iconImage from '../../mipmaps/Prisms_Screen_White_png.js';
import bendingLightStrings from '../bending-light-strings.js';
import bendingLight from '../bendingLight.js';
import PrismsModel from './model/PrismsModel.js';
import PrismsView from './view/PrismsView.js';

const prismsString = bendingLightStrings.prisms;


/**
 * @constructor
 */
function PrismsScreen( tandem ) {

  const options = {
    name: prismsString,
    homeScreenIcon: new Image( iconImage ),
    navigationBarIcon: new Image( navbarIconImage ),
    tandem: tandem
  };

  Screen.call( this,
    function() { return new PrismsModel(); },
    function( model ) { return new PrismsView( model ); },
    options );
}

bendingLight.register( 'PrismsScreen', PrismsScreen );

inherit( Screen, PrismsScreen );
export default PrismsScreen;