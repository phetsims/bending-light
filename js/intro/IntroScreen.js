// Copyright 2002-2015, University of Colorado Boulder

/**
 * The 'Intro' screen.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var LaserTypeRadioButtonGroup = require( 'BENDING_LIGHT/intro/view/LaserTypeRadioButtonGroup' );

  // strings
  var introTitleString = require( 'string!BENDING_LIGHT/intro' );

  /**
   * @constructor
   */
  function IntroScreen() {
    Screen.call( this, introTitleString, new Rectangle( 0, 0, 548, 373, { fill: 'red' } ),
      function() { return new IntroModel( BendingLightModel.WATER, true ); },
      function( model ) {
        return new IntroView( model, 102, false, 2, function( introModel ) {
          return new LaserTypeRadioButtonGroup( introModel.laserViewProperty );
        } );
      },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, IntroScreen );
} );