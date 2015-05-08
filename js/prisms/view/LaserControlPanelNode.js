// Copyright 2002-2015, University of Colorado Boulder

/**
 * Control panel for the laser in the "prisms" Screen, such as choosing whether it is white light or one color, and the
 * wavelength.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var WavelengthSlider = require( 'SCENERY_PHET/WavelengthSlider' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ArrowButton = require( 'SCENERY_PHET/buttons/ArrowButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );

  // strings
  var oneColorString = require( 'string!BENDING_LIGHT/oneColor' );
  var whiteLightString = require( 'string!BENDING_LIGHT/whiteLight' );
  var units_nmString = require( 'string!BENDING_LIGHT/units_nm' );

  // constants
  var PLUS_MINUS_SPACING = 4;

  /**
   *
   * @param { Property<string>} colorModeProperty - to indicate ray in singleColor or white .
   * @param {Property<number>} wavelengthProperty
   * @param {Object} [options]
   * @constructor
   */
  function LaserControlPanelNode( colorModeProperty, wavelengthProperty, options ) {

    var laserControlPanelNode = this;

    options = _.extend( {
      fill: '#EEEEEE ',
      stroke: '#696969',
      lineWidth: 1.5,
      cornerRadius: 5,
      xMargin: 5,
      yMargin: 10
    }, options );

    var createButtonTextNode = function( text ) {
      return new Text( text, { font: new PhetFont( 12 ) } );
    };

    var AQUA_RADIO_BUTTON_OPTIONS = { radius: 7, font: new PhetFont( 12 ) };

    // create the radio buttons
    var whiteLightRadio = new AquaRadioButton( colorModeProperty, 'white', createButtonTextNode( whiteLightString ),
      AQUA_RADIO_BUTTON_OPTIONS );
    var oneColorRadio = new AquaRadioButton( colorModeProperty, 'singleColor', createButtonTextNode( oneColorString ),
      AQUA_RADIO_BUTTON_OPTIONS );

    var maxRadioButtonWidth = _.max( [ whiteLightRadio, oneColorRadio ], function( item ) {
      return item.width;
    } ).width;

    //  Touch areas
    var touchExpansion = 5;
    oneColorRadio.touchArea = new Bounds2( ( oneColorRadio.localBounds.minX - touchExpansion ), oneColorRadio.localBounds.minY,
      ( oneColorRadio.localBounds.minX + maxRadioButtonWidth ), oneColorRadio.localBounds.maxY );

    whiteLightRadio.touchArea = new Bounds2( ( whiteLightRadio.localBounds.minX - touchExpansion ), whiteLightRadio.localBounds.minY,
      ( whiteLightRadio.localBounds.minX + maxRadioButtonWidth ), whiteLightRadio.localBounds.maxY );

    this.wavelengthProperty = new Property( wavelengthProperty.value * 1E9 );

    //  Create  WavelengthSlider node
    var wavelengthSlider = new WavelengthSlider( this.wavelengthProperty,
      {
        cursorStroke: 'white',
        maxWavelength: BendingLightConstants.LASER_MAX_WAVELENGTH,
        thumbWidth: 20,
        thumbHeight: 20,
        trackWidth: 155,
        trackHeight: 20,
        tweakersVisible: false,
        valueVisible: false,
        thumbTouchAreaExpandY: 10,
        pointerAreasOverTrack: true
      } );

    var wavelengthValueText = new Text( this.wavelengthProperty.get() + units_nmString );
    var wavelengthBoxShape = new Rectangle( 0, 0, 45, 18, 2, 2,
      { fill: 'white', stroke: 'black' } );

    var plusButton = new ArrowButton( 'right', function propertyPlus() {
      laserControlPanelNode.wavelengthProperty.set(
        Math.min( laserControlPanelNode.wavelengthProperty.get() + 1, VisibleColor.MAX_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );
    plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
      plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 20 );

    var minusButton = new ArrowButton( 'left', function propertyMinus() {
      laserControlPanelNode.wavelengthProperty.set(
        Math.max( laserControlPanelNode.wavelengthProperty.get() - 1, VisibleColor.MIN_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );
    minusButton.touchArea = new Bounds2( minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
      minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 20 );

    wavelengthBoxShape.centerX = wavelengthSlider.centerX;
    wavelengthBoxShape.bottom = wavelengthSlider.top - 5;

    wavelengthValueText.centerX = wavelengthBoxShape.centerX;
    wavelengthValueText.centerY = wavelengthBoxShape.centerY;

    // Plus button to the right of the value
    plusButton.left = wavelengthBoxShape.right + PLUS_MINUS_SPACING;
    plusButton.centerY = wavelengthBoxShape.centerY;

    // Minus button to the left of the value
    minusButton.right = wavelengthBoxShape.left - PLUS_MINUS_SPACING;
    minusButton.centerY = wavelengthBoxShape.centerY;

    var wavelengthValue = new Node( {
      children: [ minusButton, wavelengthBoxShape, wavelengthValueText,
        plusButton, wavelengthSlider ]
    } );

    colorModeProperty.link( function() {
      wavelengthValue.setPickable( colorModeProperty.value === 'singleColor' );
      wavelengthValue.opacity = colorModeProperty.value === 'singleColor' ? 1 : 0.4;
    } );

    var content = new VBox( {
      spacing: 8.4,
      children: [ whiteLightRadio, oneColorRadio, wavelengthValue ],
      align: 'left'
    } );

    this.wavelengthProperty.link( function( wavelength ) {
      wavelengthProperty.set( wavelength / 1E9 );
      wavelengthValueText.text = wavelength + units_nmString;
    } );

    Panel.call( this, content, options );
  }

  return inherit( Panel, LaserControlPanelNode, {

    reset: function() {
      this.wavelengthProperty.reset();
    }
  } );
} );
