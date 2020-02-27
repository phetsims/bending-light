// Copyright 2015-2019, University of Colorado Boulder

/**
 * In the intro screen, these radio buttons choose between "Ray" and "Wave" representations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import bendingLightStrings from '../../bending-light-strings.js';
import bendingLight from '../../bendingLight.js';

const rayString = bendingLightStrings.ray;
const waveString = bendingLightStrings.wave;

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

inherit( VBox, LaserTypeAquaRadioButtonGroup );
export default LaserTypeAquaRadioButtonGroup;