// Copyright 2002-2015, University of Colorado Boulder

/**
 * The 'Intro' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var Substance = require( 'BENDING_LIGHT/common/model/Substance' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Image = require( 'SCENERY/nodes/Image' );
  var LaserTypeAquaRadioButtonGroup = require( 'BENDING_LIGHT/intro/view/LaserTypeAquaRadioButtonGroup' );

  // strings
  var introTitleString = require( 'string!BENDING_LIGHT/intro' );

  // images
  var icon = require( 'mipmap!BENDING_LIGHT/Intro_Screen.png' );

  /**
   * @constructor
   */
  function IntroScreen() {
    Screen.call( this, introTitleString, new Image( icon ),
      function() { return new IntroModel( Substance.WATER, true ); },
      function( model ) {
        return new IntroView( model, 102, false, 2, function( introModel ) {
          return new LaserTypeAquaRadioButtonGroup( introModel.laserViewProperty );
        }, [] );
      },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, IntroScreen );
} );