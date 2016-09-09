// Copyright 2015, University of Colorado Boulder

/**
 * The 'more tools' screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var MoreToolsModel = require( 'BENDING_LIGHT/more-tools/model/MoreToolsModel' );
  var MoreToolsView = require( 'BENDING_LIGHT/more-tools/view/MoreToolsView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Image = require( 'SCENERY/nodes/Image' );

  // strings
  var moreToolsString = require( 'string!BENDING_LIGHT/moreTools' );

  // images
  var iconImage = require( 'mipmap!BENDING_LIGHT/More_Tools_Screen.png' );

  /**
   * @constructor
   */
  function MoreToolsScreen( tandem ) {

    var options = {
      name: moreToolsString,
      homeScreenIcon: new Image( iconImage ),
      backgroundColor: 'white',
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