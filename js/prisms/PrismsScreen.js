// Copyright (c) 2002 - 2015. University of Colorado Boulder

/**
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var PrismBreakModel = require( 'BENDING_LIGHT/prisms/model/PrismBreakModel' );
  var PrismBreakView = require( 'BENDING_LIGHT/prisms/view/PrismBreakView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var prismsTitleString = require( 'string!BENDING_LIGHT/prisms' );

  // images
  var prismsMockUpImage = require( 'image!BENDING_LIGHT/mockup-prisms.png' );

  /**
   *
   * @constructor
   */
  function PrismsScreen() {
    Screen.call( this, prismsTitleString, new Image( prismsMockUpImage ),
      function() { return new PrismBreakModel(); },
      function( model ) { return new PrismBreakView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, PrismsScreen );
} );