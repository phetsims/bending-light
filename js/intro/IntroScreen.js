// Copyright 2015-2017, University of Colorado Boulder

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
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  var LaserTypeAquaRadioButtonGroup = require( 'BENDING_LIGHT/intro/view/LaserTypeAquaRadioButtonGroup' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );
  var Substance = require( 'BENDING_LIGHT/common/model/Substance' );

  // strings
  var introString = require( 'string!BENDING_LIGHT/intro' );

  // images
  var icon = require( 'mipmap!BENDING_LIGHT/Intro_Screen.png' );

  /**
   * @constructor
   */
  function IntroScreen( tandem ) {

    var options = {
      name: introString,
      homeScreenIcon: new Image( icon ),
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    Screen.call( this,
      function() { return new IntroModel( Substance.WATER, true ); },
      function( model ) {
        return new IntroView( model,
          false, // hasMoreTools
          2, // indexOfRefractionDecimals

          // createLaserControlPanel
          function( introModel ) {
            return new LaserTypeAquaRadioButtonGroup( introModel.laserViewProperty );
          }, [] );
      },
      options );
  }

  bendingLight.register( 'IntroScreen', IntroScreen );

  return inherit( Screen, IntroScreen );
} );