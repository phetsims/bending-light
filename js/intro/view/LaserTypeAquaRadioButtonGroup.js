// Copyright 2015, University of Colorado Boulder

/**
 * In the intro screen, these radio buttons choose between "Ray" and "Wave" representations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var rayString = require( 'string!BENDING_LIGHT/ray' );
  var waveString = require( 'string!BENDING_LIGHT/wave' );

  /**
   *
   * @constructor
   */
  function LaserTypeAquaRadioButtonGroup( laserTypeProperty ) {

    var radioButtonOptions = {
      radius: 6,
      font: new PhetFont( 12 )
    };
    var createButtonTextNode = function( text ) {
      return new Text( text, {
        maxWidth: 120, // measured empirically to ensure no overlap with the laser at any angle
        font: new PhetFont( 12 )
      } );
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

  bendingLight.register( 'LaserTypeAquaRadioButtonGroup', LaserTypeAquaRadioButtonGroup );
  
  return inherit( VBox, LaserTypeAquaRadioButtonGroup );
} );