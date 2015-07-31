// Copyright 2002-2015, University of Colorado Boulder

/**
 *
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
  var units_nmString = require( 'string!BENDING_LIGHT/units_nm' );
  var waveLengthPattern = require( 'string!BENDING_LIGHT/waveLengthPattern' );

  // constants
  var PLUS_MINUS_SPACING = 4;

  /**
   * @param {Property.<string>} radioButtonProperty - specifies value of the radio button selected
   * @param {Property.<number>} wavelengthProperty - specifies wavelength
   * @param {string} firstButtonValue - value corresponds to the firstButton
   * @param {string} secondButtonValue - value corresponds to the secondButton
   * @param {string} firstButtonString - name of the first radio button
   * @param {string} secondButtonString - name of the second radio button
   * @param {boolean} hasWavelengthSlider - specifies whether panel contains wavelength slider or not
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function LaserControlPanel( radioButtonProperty, wavelengthProperty, firstButtonValue, secondButtonValue,
                              firstButtonString, secondButtonString, hasWavelengthSlider, options ) {
    options = _.extend( {
      cornerRadius: 5,
      xMargin: 9,
      yMargin: 6,
      fill: '#EEEEEE',
      stroke: '#696969',
      lineWidth: 1.5
    }, options );
    var laserControlPanel = this;
    this.hasWavelengthSlider = hasWavelengthSlider;

    var maxWidth = options.minWidth - 35;
    var createButtonTextNode = function( text ) {
      var itemName = new Text( text, { font: new PhetFont( 12 ) } );
      if ( itemName.width > maxWidth ) {
        itemName.scale( maxWidth / itemName.width );
      }
      return itemName;
    };

    // Create the radio buttons
    var radioButtonOptions = { radius: options.radioButtonradius, font: new PhetFont( 12 ) };
    var firstRadioButton = new AquaRadioButton( radioButtonProperty, firstButtonValue,
      createButtonTextNode( firstButtonString ), radioButtonOptions );
    var secondRadioButton = new AquaRadioButton( radioButtonProperty, secondButtonValue,
      createButtonTextNode( secondButtonString ), radioButtonOptions );

    // Touch areas
    var touchExpansion = 5;
    var maxRadioButtonWidth = _.max( [ firstRadioButton, secondRadioButton ], function( item ) {
      return item.width;
    } ).width;

    // Touch areas
    firstRadioButton.touchArea = new Bounds2(
      firstRadioButton.localBounds.minX - touchExpansion, firstRadioButton.localBounds.minY - touchExpansion,
      firstRadioButton.localBounds.minX + maxRadioButtonWidth, firstRadioButton.localBounds.maxY + touchExpansion );

    secondRadioButton.touchArea = new Bounds2(
      secondRadioButton.localBounds.minX - touchExpansion, secondRadioButton.localBounds.minY - touchExpansion,
      secondRadioButton.localBounds.minX + maxRadioButtonWidth, secondRadioButton.localBounds.maxY + touchExpansion );

    var content;
    if ( hasWavelengthSlider ) {
      this.wavelengthProperty = new Property( wavelengthProperty.value * 1E9 );

      // Add WavelengthSlider node
      var wavelengthSlider = new WavelengthSlider( this.wavelengthProperty,
        {
          cursorStroke: 'white',
          maxWavelength: BendingLightConstants.LASER_MAX_WAVELENGTH,
          thumbWidth: 20,
          thumbHeight: 20,
          trackWidth: maxWidth,
          trackHeight: 20,
          tweakersVisible: false,
          valueVisible: false,
          thumbTouchAreaExpandY: 4,
          pointerAreasOverTrack: true
        } );

      var wavelengthValueText = new Text( StringUtils.format( waveLengthPattern, this.wavelengthProperty.get(), units_nmString ) );
      var wavelengthBoxShape = new Rectangle( 0, 0, new Text( units_nmString ).width + 36, 18, 2, 2, {
        fill: 'white',
        stroke: 'black'
      } );

      var plusButton = new ArrowButton( 'right', function propertyPlus() {
        laserControlPanel.wavelengthProperty.set(
          Math.min( laserControlPanel.wavelengthProperty.get() + 1, BendingLightConstants.LASER_MAX_WAVELENGTH ) );
      }, {
        scale: 0.6
      } );
      plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
        plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 8 );

      var minusButton = new ArrowButton( 'left', function propertyMinus() {
        laserControlPanel.wavelengthProperty.set(
          Math.max( laserControlPanel.wavelengthProperty.get() - 1, VisibleColor.MIN_WAVELENGTH ) );
      }, {
        scale: 0.6
      } );
      this.wavelengthProperty.link( function( wavelength ) {
        plusButton.enabled = ( wavelength < BendingLightConstants.LASER_MAX_WAVELENGTH);
        minusButton.enabled = ( wavelength > VisibleColor.MIN_WAVELENGTH );
      } );

      minusButton.touchArea = new Bounds2( minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
        minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 8 );

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
      if ( options.disableUnselected ) {
        radioButtonProperty.link( function() {
          wavelengthValue.setPickable( radioButtonProperty.value === secondButtonValue );
          wavelengthValue.opacity = radioButtonProperty.value === secondButtonValue ? 1 : 0.4;
        } );
      }

      content = new VBox( {
        spacing: options.spacing,
        children: [ firstRadioButton, secondRadioButton, wavelengthValue ],
        align: 'left'
      } );
      this.wavelengthProperty.link( function( wavelength ) {
        wavelengthProperty.set( wavelength / 1E9 );
        wavelengthValueText.setText( StringUtils.format( waveLengthPattern, wavelength, units_nmString ) );
      } );
    }
    else {
      content = new VBox( {
        spacing: 10,
        children: [ firstRadioButton, secondRadioButton ],
        align: 'left'
      } );
    }

    Panel.call( this, content, options );
  }

  return inherit( Panel, LaserControlPanel, {

    /**
     * reset only if laser panel has wavelength slider
     * @public
     */
    reset: function() {
      if ( this.hasWavelengthSlider ) {
        this.wavelengthProperty.reset();
      }
    }
  } );
} );