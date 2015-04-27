// Copyright (c) 2002 - 2015. University of Colorado Boulder

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
  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );

  var colorsProperty = new Property( new Color( 255, 0, 0 ) );

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
      function( model ) { return new PrismBreakView( model, colorsProperty ); },
      { backgroundColor: colorsProperty.value.toCSS() }
    );
    // update the background  when its medium changes
    prismModel.environmentMediumProperty.link( function( environmentMedium ) {
      colorsProperty.value = environmentMedium.color;
    } );
    colorsProperty.linkAttribute( screen, 'backgroundColor' );
  }

  return inherit( Screen, PrismsScreen );
} );