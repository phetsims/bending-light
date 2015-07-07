// Copyright 2002-2015, University of Colorado Boulder

/**
 * Control panel for the laser in the "prisms" Screen, such as choosing whether it is white light or one color, and the
 * wavelength.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
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
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var oneColorString = require( 'string!BENDING_LIGHT/oneColor' );
  var whiteLightString = require( 'string!BENDING_LIGHT/whiteLight' );
  var units_nmString = require( 'string!BENDING_LIGHT/units_nm' );
  var waveLengthPattern = require( 'string!BENDING_LIGHT/waveLengthPattern' );

  // constants
  var PLUS_MINUS_SPACING = 4;

  /**
   *
   * @param { Property<string>} colorModeProperty - to indicate ray in singleColor or white .
   * @param {Property<number>} wavelengthProperty
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function LaserControlPanelNode( colorModeProperty, wavelengthProperty, options ) {

    var laserControlPanelNode = this;
    var MAX_WIDTH = options.minWidth - 35;


    options = _.extend( {
      fill: '#EEEEEE ',
      stroke: '#696969',
      lineWidth: 1.5,
      cornerRadius: 5,
      xMargin: 5,
      yMargin: 10
    }, options );

    var createButtonTextNode = function( text ) {
      var itemName = new Text( text, { font: new PhetFont( 12 ) } );
      if ( itemName.width > MAX_WIDTH ) {
        itemName.scale( MAX_WIDTH / itemName.width );
      }
      return itemName;
    };

    var aquaRadioButtonOptions = { radius: 7, font: new PhetFont( 12 ) };

    // create the radio buttons
    var whiteLightRadio = new AquaRadioButton( colorModeProperty, 'white', createButtonTextNode( whiteLightString ),
      aquaRadioButtonOptions );
    var oneColorRadio = new AquaRadioButton( colorModeProperty, 'singleColor', createButtonTextNode( oneColorString ),
      aquaRadioButtonOptions );

    var maxRadioButtonWidth = _.max( [ whiteLightRadio, oneColorRadio ], function( item ) {
      return item.width;
    } ).width;

    // Touch areas
    var touchExpansion = 5;
    oneColorRadio.touchArea = new Bounds2( oneColorRadio.localBounds.minX - touchExpansion, oneColorRadio.localBounds.minY,
      oneColorRadio.localBounds.minX + maxRadioButtonWidth, oneColorRadio.localBounds.maxY );

    whiteLightRadio.touchArea = new Bounds2( whiteLightRadio.localBounds.minX - touchExpansion, whiteLightRadio.localBounds.minY,
      whiteLightRadio.localBounds.minX + maxRadioButtonWidth, whiteLightRadio.localBounds.maxY );

    this.wavelengthProperty = new Property( wavelengthProperty.value * 1E9 );

    // Create  WavelengthSlider node
    var wavelengthSlider = new WavelengthSlider( this.wavelengthProperty, {
      cursorStroke: 'white',
      maxWavelength: BendingLightConstants.LASER_MAX_WAVELENGTH,
      thumbWidth: 20,
      thumbHeight: 20,
      trackWidth: MAX_WIDTH,
      trackHeight: 20,
      tweakersVisible: false,
      valueVisible: false,
      thumbTouchAreaExpandY: 4,
      pointerAreasOverTrack: true
    } );

    var wavelengthValueText = new Text( this.wavelengthProperty.get() + ' ' + units_nmString );
    var wavelengthBoxShape = new Rectangle( 0, 0, new Text( units_nmString ).width + 31, 18, 2, 2, {
      fill: 'white',
      stroke: 'black'
    } );

    var plusButton = new ArrowButton( 'right', function propertyPlus() {
      laserControlPanelNode.wavelengthProperty.set(
        Math.min( laserControlPanelNode.wavelengthProperty.get() + 1, BendingLightConstants.LASER_MAX_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );
    plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
      plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 10 );

    var minusButton = new ArrowButton( 'left', function propertyMinus() {
      laserControlPanelNode.wavelengthProperty.set(
        Math.max( laserControlPanelNode.wavelengthProperty.get() - 1, VisibleColor.MIN_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );
    this.wavelengthProperty.link( function( wavelength ) {
      plusButton.enabled = ( wavelength < BendingLightConstants.LASER_MAX_WAVELENGTH);
      minusButton.enabled = ( wavelength > VisibleColor.MIN_WAVELENGTH );
    } );
    minusButton.touchArea = new Bounds2( minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
      minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 10 );

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
      children: [ minusButton, wavelengthBoxShape, wavelengthValueText, plusButton, wavelengthSlider ]
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
      wavelengthValueText.setText( StringUtils.format( waveLengthPattern, wavelength, units_nmString ) );
    } );

    Panel.call( this, content, options );
  }

  return inherit( Panel, LaserControlPanelNode, {

    /**
     * @public
     */
    reset: function() {
      this.wavelengthProperty.reset();
    }
  } );
} );