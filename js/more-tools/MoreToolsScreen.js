// Copyright 2002 - 2015, University of Colorado Boulder

/**
 * The 'more tools'  screen
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var MoreToolsModel = require( 'BENDING_LIGHT/more-tools/model/MoreToolsModel' );
  var MoreToolsView = require( 'BENDING_LIGHT/more-tools/view/MoreToolsView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Screen = require( 'JOIST/Screen' );

  // images
  var moreToolsMockUpImage = require( 'image!BENDING_LIGHT/mockup-more-tools.png' );

  // strings
  var moreToolsTitleString = require( 'string!BENDING_LIGHT/moreTools' );

  /**
   *
   * @constructor
   */
  function MoreToolsScreen() {
    Screen.call( this, moreToolsTitleString, new Image( moreToolsMockUpImage ),
      function() { return new MoreToolsModel(); },
      function( model ) { return new MoreToolsView( model ); },
      { backgroundColor: 'white' }
    );

  }

  return inherit( Screen, MoreToolsScreen );
} );