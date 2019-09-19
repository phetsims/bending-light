// Copyright 2015-2017, University of Colorado Boulder

/**
 * The 'more tools' screen
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
  const MoreToolsModel = require( 'BENDING_LIGHT/more-tools/model/MoreToolsModel' );
  const MoreToolsView = require( 'BENDING_LIGHT/more-tools/view/MoreToolsView' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  // strings
  const moreToolsString = require( 'string!BENDING_LIGHT/moreTools' );

  // images
  const iconImage = require( 'mipmap!BENDING_LIGHT/More_Tools_Screen.png' );

  /**
   * @constructor
   */
  function MoreToolsScreen( tandem ) {

    var options = {
      name: moreToolsString,
      homeScreenIcon: new Image( iconImage ),
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    Screen.call( this,
      function() { return new MoreToolsModel(); },
      function( model ) { return new MoreToolsView( model ); },
      options );
  }

  bendingLight.register( 'MoreToolsScreen', MoreToolsScreen );

  return inherit( Screen, MoreToolsScreen );
} );