// Copyright 2015-2019, University of Colorado Boulder

/**
 * In the intro screen, these radio buttons choose between "Ray" and "Wave" representations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const inherit = require( 'PHET_CORE/inherit' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const rayString = require( 'string!BENDING_LIGHT/ray' );
  const waveString = require( 'string!BENDING_LIGHT/wave' );

  /**
   *
   * @constructor
   */
  function LaserTypeAquaRadioButtonGroup( laserTypeProperty ) {

    const radioButtonOptions = {
      radius: 6,
      font: new PhetFont( 12 )
    };
    const createButtonTextNode = function( text ) {
      return new Text( text, {
        maxWidth: 120, // measured empirically to ensure no overlap with the laser at any angle
        font: new PhetFont( 12 )
      } );
    };
    const rayButton = new AquaRadioButton(
      laserTypeProperty,
      'ray',
      createButtonTextNode( rayString ),
      radioButtonOptions
    );
    const waveButton = new AquaRadioButton(
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