// Copyright 2015-2017, University of Colorado Boulder

/**
 * The 'Intro' screen.
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
  const IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  const IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  const LaserTypeAquaRadioButtonGroup = require( 'BENDING_LIGHT/intro/view/LaserTypeAquaRadioButtonGroup' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );
  const Substance = require( 'BENDING_LIGHT/common/model/Substance' );

  // strings
  const introString = require( 'string!BENDING_LIGHT/intro' );

  // images
  const icon = require( 'mipmap!BENDING_LIGHT/Intro_Screen.png' );

  /**
   * @constructor
   */
  function IntroScreen( tandem ) {

    const options = {
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