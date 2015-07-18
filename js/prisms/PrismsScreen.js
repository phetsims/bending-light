// Copyright 2002 - 2015, University of Colorado Boulder

/**
 * The 'Prisms' screen.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var PrismBreakModel = require( 'BENDING_LIGHT/prisms/model/PrismBreakModel' );
  var PrismsView = require( 'BENDING_LIGHT/prisms/view/PrismsView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var prismsTitleString = require( 'string!BENDING_LIGHT/prisms' );

  /**
   *
   * @constructor
   */
  function PrismsScreen() {
    var screen = this;
    var prismModel = new PrismBreakModel();
    Screen.call( this, prismsTitleString, new Rectangle( 0, 0, 548, 373, { fill: 'green' } ),
      function() {
        return prismModel;
      },
      function( model ) { return new PrismsView( model ); },
      { backgroundColor: 'white' }
    );
    // update the background  when its medium changes
    prismModel.environmentMediumProperty.link( function( environmentMedium ) {
      screen.backgroundColor = environmentMedium.color;
    } );
  }

  return inherit( Screen, PrismsScreen );
} );