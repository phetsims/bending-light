//  Copyright 2002-2015, University of Colorado Boulder

/**
 * In the intro screen, choose between "Ray" and "Wave" representations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var rayString = require( 'string!BENDING_LIGHT/ray' );
  var waveString = require( 'string!BENDING_LIGHT/wave' );

  /**
   *
   * @constructor
   */
  function LaserTypeRadioButtonGroup( laserTypeProperty ) {

    var radioButtonOptions = { radius: 6, font: new PhetFont( 12 ) };
    var createButtonTextNode = function( text ) {
      return new Text( text, { font: new PhetFont( 12 ) } );
    };
    var rayButton = new AquaRadioButton(
      laserTypeProperty,
      'ray',
      createButtonTextNode( rayString ),
      radioButtonOptions
    );
    var waveButton = new AquaRadioButton(
      laserTypeProperty,
      'wave',
      createButtonTextNode( waveString ),
      radioButtonOptions
    );
    VBox.call( this, {
      spacing: 10,
      align: 'left',
      children: [ rayButton, waveButton ]
    } );
  }

  return inherit( VBox, LaserTypeRadioButtonGroup );
} );