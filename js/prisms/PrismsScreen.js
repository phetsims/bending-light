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
    var prismModel = new PrismsModel();
    Screen.call( this, prismsString, new Image( iconImage ),
      function() {
        return prismModel;
      },
      function( model ) {
        return new PrismsView( model );
      }, {
        navigationBarIcon: new Image( navbarIconImage ),
        tandem: tandem
      }
    );
  }

  return inherit( Screen, PrismsScreen );
} );