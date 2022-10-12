// Copyright 2015-2022, University of Colorado Boulder

/**
 * Control that shows a spectrum and lets the user choose the color for monochromatic light.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import WavelengthSlider from '../../../../scenery-phet/js/WavelengthSlider.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

const unitsNmStringProperty = BendingLightStrings.units_nmStringProperty;
const wavelengthPatternStringProperty = BendingLightStrings.wavelengthPatternStringProperty;

// constants
const PLUS_MINUS_SPACING = 4;

class WavelengthControl extends Node {

  public constructor( wavelengthProperty: Property<number>, enabledProperty: Property<boolean>, trackWidth: number ) {
    const wavelengthPropertyNMProperty = new Property<number>( wavelengthProperty.value * 1E9, {

      // See https://github.com/phetsims/bending-light/issues/378
      reentrant: true
    } );

    wavelengthProperty.link( wavelength => {
      wavelengthPropertyNMProperty.value = wavelength * 1E9;
    } );
    // Add WavelengthSlider node
    const wavelengthSlider = new WavelengthSlider( wavelengthPropertyNMProperty, {
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

    const formattedStringProperty = new DerivedProperty( [ wavelengthPatternStringProperty, wavelengthPropertyNMProperty ],
      ( wavelengthPatternString, wavelength ) => StringUtils.format( wavelengthPatternStringProperty.value, Utils.roundSymmetric( wavelengthPropertyNMProperty.value ) ) );

    // Prevent the i18n strings from making the wavelength slider too wide, see #311
    const maxWidth = 50;
    const wavelengthValueText = new Text( formattedStringProperty, { maxWidth: maxWidth } );
    const wavelengthBoxShape = new Rectangle( 0, 0, new Text( unitsNmStringProperty, { maxWidth: maxWidth } ).width + 36, 18, 2, 2, {
      fill: 'white',
      stroke: 'black'
    } );

    // add plus button
    const plusButton = new ArrowButton( 'right', () => {
      wavelengthPropertyNMProperty.set(
        Math.min( wavelengthPropertyNMProperty.value + 1, BendingLightConstants.LASER_MAX_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );

    // touch area
    plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
      plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 8 );

    // add minus button
    const minusButton = new ArrowButton( 'left', () => {
      wavelengthPropertyNMProperty.set(
        Math.max( wavelengthPropertyNMProperty.value - 1, BendingLightConstants.LASER_MIN_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );

    // disable the minus button at minimum wavelength and plus button at max wavelength
    wavelengthPropertyNMProperty.link( wavelength => {
      plusButton.enabled = ( wavelength < BendingLightConstants.LASER_MAX_WAVELENGTH );
      minusButton.enabled = ( wavelength > BendingLightConstants.LASER_MIN_WAVELENGTH );
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

    wavelengthPropertyNMProperty.link( wavelength => {

      // set the laser wavelength according to the slider wavelength
      wavelengthProperty.set( wavelength / 1E9 );
    } );
  }
}

bendingLight.register( 'WavelengthControl', WavelengthControl );

export default WavelengthControl;