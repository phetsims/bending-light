// Copyright 2002 - 2015, University of Colorado Boulder

/**
 * The 'Prisms' screen.
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
    var screen = this;
    var prismModel = new PrismBreakModel();
    Screen.call( this, prismsTitleString, new Image( prismsMockUpImage ),
      function() {
        return prismModel;
      },
      function( model ) { return new PrismBreakView( model ); },
      { backgroundColor: 'white' }
    );
    // update the background  when its medium changes
    prismModel.environmentMediumProperty.link( function( environmentMedium ) {
      screen.backgroundColor = environmentMedium.color;
    } );
  }

  return inherit( Screen, PrismsScreen );
} );