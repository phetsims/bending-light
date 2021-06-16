// Copyright 2015-2021, University of Colorado Boulder

/**
 * Control that shows a spectrum and lets the user choose the color for monochromatic light.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import WavelengthSlider from '../../../../scenery-phet/js/WavelengthSlider.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import bendingLightStrings from '../../bendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';

const unitsNmString = bendingLightStrings.units_nm;
const wavelengthPatternString = bendingLightStrings.wavelengthPattern;

// constants
const PLUS_MINUS_SPACING = 4;

class WavelengthControl extends Node {

  /**
   * @param {Property.<number>} wavelengthProperty
   * @param {Property.<boolean>} enabledProperty
   * @param {number} trackWidth
   */
  constructor( wavelengthProperty, enabledProperty, trackWidth ) {
    const wavelengthPropertyNM = new Property( wavelengthProperty.value * 1E9, { reentrant: true } );

    wavelengthProperty.link( wavelength => {
      wavelengthPropertyNM.value = wavelength * 1E9;
    } );
    // Add WavelengthSlider node
    const wavelengthSlider = new WavelengthSlider( wavelengthPropertyNM, {
      cursorStroke: 'white',
      maxWavelength: BendingLightConstants.LASER_MAX_WAVELENGTH,
      thumbWidth: 20,
      thumbHeight: 20,
      trackWidth: trackWidth,
      trackHeight: 20,
      tweakersVisible: false,
      valueVisible: false,
      thumbTouchAreaYDilation: 4
    } );

    const formattedString = StringUtils.format( wavelengthPatternString, Utils.roundSymmetric( wavelengthPropertyNM.value ) );

    // Prevent the i18n strings from making the wavelength slider too wide, see #311
    const maxWidth = 80;
    const wavelengthValueText = new Text( formattedString, { maxWidth: maxWidth } );
    const wavelengthBoxShape = new Rectangle( 0, 0, new Text( unitsNmString, { maxWidth: maxWidth } ).width + 36, 18, 2, 2, {
      fill: 'white',
      stroke: 'black'
    } );

    // add plus button
    const plusButton = new ArrowButton( 'right', () => {
      wavelengthPropertyNM.set(
        Math.min( wavelengthPropertyNM.value + 1, BendingLightConstants.LASER_MAX_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );

    // touch area
    plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
      plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 8 );

    // add minus button
    const minusButton = new ArrowButton( 'left', () => {
      wavelengthPropertyNM.set(
        Math.max( wavelengthPropertyNM.value - 1, VisibleColor.MIN_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );

    // disable the minus button at minimum wavelength and plus button at max wavelength
    wavelengthPropertyNM.link( wavelength => {
      plusButton.enabled = ( wavelength < BendingLightConstants.LASER_MAX_WAVELENGTH );
      minusButton.enabled = ( wavelength > VisibleColor.MIN_WAVELENGTH );
    } );

    // touch area
    minusButton.touchArea = new Bounds2( minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
      minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 8 );

    // set the position of the wavelength text box
    wavelengthBoxShape.centerX = wavelengthSlider.centerX;
    wavelengthBoxShape.bottom = wavelengthSlider.top - 5;

    // set the position of the wavelength value in the center of text box
    wavelengthValueText.centerX = wavelengthBoxShape.centerX;
    wavelengthValueText.centerY = wavelengthBoxShape.centerY;

    // Plus button to the right of the value
    plusButton.left = wavelengthBoxShape.right + PLUS_MINUS_SPACING;
    plusButton.centerY = wavelengthBoxShape.centerY;

    // Minus button to the left of the value
    minusButton.right = wavelengthBoxShape.left - PLUS_MINUS_SPACING;
    minusButton.centerY = wavelengthBoxShape.centerY;

    super( {
      children: [
        minusButton,
        wavelengthBoxShape,
        wavelengthValueText,
        plusButton,
        wavelengthSlider
      ]
    } );
    enabledProperty.link( enabled => {

      // set the opacity when not selected
      this.setPickable( enabled );
      this.opacity = enabled ? 1 : 0.4;
    } );

    wavelengthPropertyNM.link( wavelength => {

      // set the laser wavelength according to the slider wavelength
      wavelengthProperty.set( wavelength / 1E9 );

      // set the value in the slider text box
      wavelengthValueText.setText( StringUtils.format( wavelengthPatternString, Utils.roundSymmetric( wavelength ), unitsNmString ) );
    } );
  }
}

bendingLight.register( 'WavelengthControl', WavelengthControl );

export default WavelengthControl;