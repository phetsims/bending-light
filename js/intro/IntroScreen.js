// Copyright 2015, University of Colorado Boulder

/**
 * The 'Intro' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var Substance = require( 'BENDING_LIGHT/common/model/Substance' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Image = require( 'SCENERY/nodes/Image' );
  var LaserTypeAquaRadioButtonGroup = require( 'BENDING_LIGHT/intro/view/LaserTypeAquaRadioButtonGroup' );

  // strings
  var introString = require( 'string!BENDING_LIGHT/intro' );

  // images
  var icon = require( 'mipmap!BENDING_LIGHT/Intro_Screen.png' );

  /**
   * @constructor
   */
  function IntroScreen( tandem ) {
    Screen.call( this, introString, new Image( icon ),
      function() { return new IntroModel( Substance.WATER, true ); },
      function( model ) {
        return new IntroView( model,
          false, // hasMoreTools
          2, // indexOfRefractionDecimals

          // createLaserControlPanel
          function( introModel ) {
            return new LaserTypeAquaRadioButtonGroup( introModel.laserViewProperty );
          }, [] );
      }, {
        backgroundColor: 'white',
        tandem: tandem
      }
    );
  }

  bendingLight.register( 'IntroScreen', IntroScreen );
  
  return inherit( Screen, IntroScreen );
} );