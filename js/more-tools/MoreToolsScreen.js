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
  function MoreToolsScreen() {
    Screen.call( this,
      moreToolsString,
      new Image( iconImage ),
      function() {
        return new MoreToolsModel();
      },
      function( model ) {
        return new MoreToolsView( model );
      }, {
        backgroundColor: 'white'
      }
    );

  }

  return inherit( Screen, MoreToolsScreen );
} );