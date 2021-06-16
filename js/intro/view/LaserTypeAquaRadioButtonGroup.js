[object Promise]

/**
 * In the intro screen, these radio buttons choose between "Ray" and "Wave" representations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import bendingLightStrings from '../../bendingLightStrings.js';
import bendingLight from '../../bendingLight.js';

const rayString = bendingLightStrings.ray;
const waveString = bendingLightStrings.wave;

class LaserTypeAquaRadioButtonGroup extends VBox {

  /**
   * @param laserTypeProperty
   */
  constructor( laserTypeProperty ) {
    const radioButtonOptions = {
      radius: 6,
      font: new PhetFont( 12 )
    };
    const createButtonTextNode = text => new Text( text, {
      maxWidth: 120, // measured empirically to ensure no overlap with the laser at any angle
      font: new PhetFont( 12 )
    } );
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
    const spacing = 10;
    const dilation = spacing / 2;

    // Use the same touch area width for each button, even if the texts are different widths
    const union = rayButton.localBounds.union( waveButton.localBounds );
    rayButton.touchArea = union.dilated( dilation );
    waveButton.touchArea = union.dilated( dilation );
    super( {
      spacing: spacing,
      align: 'left',
      children: [ rayButton, waveButton ]
    } );
  }
}

bendingLight.register( 'LaserTypeAquaRadioButtonGroup', LaserTypeAquaRadioButtonGroup );

export default LaserTypeAquaRadioButtonGroup;