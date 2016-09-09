// Copyright 2015, University of Colorado Boulder

/**
 * The 'Prisms' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var PrismsModel = require( 'BENDING_LIGHT/prisms/model/PrismsModel' );
  var PrismsView = require( 'BENDING_LIGHT/prisms/view/PrismsView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Image = require( 'SCENERY/nodes/Image' );

  // strings
  var prismsString = require( 'string!BENDING_LIGHT/prisms' );

  // images
  var iconImage = require( 'mipmap!BENDING_LIGHT/Prisms_Screen_White.png' );
  var navbarIconImage = require( 'mipmap!BENDING_LIGHT/Prisms_Screen_White_NavBar.png' );

  /**
   * @constructor
   */
  function PrismsScreen( tandem ) {

    var options = {
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