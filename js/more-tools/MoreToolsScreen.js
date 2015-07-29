// Copyright 2002-2015, University of Colorado Boulder

/**
 * The 'more tools' screen
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var MoreToolsModel = require( 'BENDING_LIGHT/more-tools/model/MoreToolsModel' );
  var MoreToolsView = require( 'BENDING_LIGHT/more-tools/view/MoreToolsView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var moreToolsTitleString = require( 'string!BENDING_LIGHT/moreTools' );

  /**
   *
   * @constructor
   */
  function MoreToolsScreen() {
    Screen.call( this, moreToolsTitleString, new Rectangle( 0, 0, 548, 373, { fill: 'blue' } ),
      function() { return new MoreToolsModel(); },
      function( model ) { return new MoreToolsView( model ); },
      { backgroundColor: 'white' }
    );

  }

  return inherit( Screen, MoreToolsScreen );
} );