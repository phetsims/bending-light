// Copyright 2015-2025, University of Colorado Boulder

/**
 * In the intro screen, these radio buttons choose between "Ray" and "Wave" representations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import bendingLight from '../../bendingLight.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import LaserViewEnum from '../../common/model/LaserViewEnum.js';

const rayStringProperty = BendingLightStrings.rayStringProperty;
const waveStringProperty = BendingLightStrings.waveStringProperty;

export default class LaserTypeAquaRadioButtonGroup extends VBox {

  public constructor( laserTypeProperty: Property<LaserViewEnum> ) {
    const radioButtonOptions = {
      radius: 6,
      font: new PhetFont( 12 )
    };
    const createButtonTextNode = ( text: TReadOnlyProperty<string> ) => new Text( text, {
      maxWidth: 120, // measured empirically to ensure no overlap with the laser at any angle
      font: new PhetFont( 12 )
    } );
    const rayButton = new AquaRadioButton(
      laserTypeProperty,
      LaserViewEnum.RAY,
      createButtonTextNode( rayStringProperty ),
      radioButtonOptions
    );
    const waveButton = new AquaRadioButton(
      laserTypeProperty,
      LaserViewEnum.WAVE,
      createButtonTextNode( waveStringProperty ),
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