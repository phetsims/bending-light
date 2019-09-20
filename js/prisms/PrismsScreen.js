// Copyright 2015-2019, University of Colorado Boulder

/**
 * The 'Prisms' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const PrismsModel = require( 'BENDING_LIGHT/prisms/model/PrismsModel' );
  const PrismsView = require( 'BENDING_LIGHT/prisms/view/PrismsView' );
  const Screen = require( 'JOIST/Screen' );

  // strings
  const prismsString = require( 'string!BENDING_LIGHT/prisms' );

  // images
  const iconImage = require( 'mipmap!BENDING_LIGHT/Prisms_Screen_White.png' );
  const navbarIconImage = require( 'mipmap!BENDING_LIGHT/Prisms_Screen_White_NavBar.png' );

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

  return inherit( Screen, PrismsScreen );
} );