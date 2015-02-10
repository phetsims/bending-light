// Copyright (c) 2002 - 2015. University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  var inherit = require( 'PHET_CORE/inherit' );
 // var Image = require( 'SCENERY/nodes/Image' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // images

  // strings
  var introTitleString = require( 'string!BENDING_LIGHT/intro' );

  /**
   *
   * @constructor
   */
  function IntroScreen() {
    Screen.call( this, introTitleString, new Rectangle( 0, 0, 50, 50 ),
      function() { return new IntroModel(); },
      function( model ) { return new IntroView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, IntroScreen );
} );