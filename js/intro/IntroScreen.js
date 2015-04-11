// Copyright (c) 2002 - 2015. University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Screen = require( 'JOIST/Screen' );

  // images
  var introMockUpImage = require( 'image!BENDING_LIGHT/mockup-intro.png' );

  // strings
  var introTitleString = require( 'string!BENDING_LIGHT/intro' );

  /**
   *
   * @constructor
   */
  function IntroScreen() {
    Screen.call( this, introTitleString, new Image( introMockUpImage ),
      function() { return new IntroModel( BendingLightModel.WATER ); },
      function( model ) { return new IntroView( model, false, false, 2 ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, IntroScreen );
} );