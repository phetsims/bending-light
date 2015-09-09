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
   * @param {Array.<Object>} radioButtonItems - {string,value}
   * @param {boolean} hasWavelengthSlider - specifies whether panel contains wavelength slider or not
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function LaserControlPanel( radioButtonProperty, wavelengthProperty, radioButtonItems, hasWavelengthSlider, options ) {
    var firstButtonValue = radioButtonItems[ 0 ].value;
    var secondButtonValue = radioButtonItems[ 1 ].value;
    var firstButtonString = radioButtonItems[ 0 ].label;
    var secondButtonString = radioButtonItems[ 1 ].label;
    options = _.extend( {
      cornerRadius: 5,
      xMargin: 9,
      yMargin: 6,
      fill: '#EEEEEE',
      stroke: '#696969',
      lineWidth: 1.5
    }, options );
    var laserControlPanel = this;
    this.hasWavelengthSlider = hasWavelengthSlider; // @private

    // Create the radio button text
    var maxWidth = options.minWidth - 35;
    var createButtonTextNode = function( text ) {
      var itemName = new Text( text, { font: new PhetFont( 12 ) } );
      if ( itemName.width > maxWidth ) {
        itemName.scale( maxWidth / itemName.width );
      }
      return itemName;
    };

    // Create the radio buttons
    var radioButtonOptions = { radius: options.radioButtonRadius, font: new PhetFont( 12 ) };
    var radioButtons = [];
    for ( var i = 0; i < radioButtonItems.length; i++ ) {
      radioButtons.push( new AquaRadioButton( radioButtonProperty, radioButtonItems[ i ].value,
        createButtonTextNode( radioButtonItems[ i ].label ), radioButtonOptions ) );
    }

    // Touch areas
    var touchExpansion = 5;
    var maxRadioButtonWidth = _.max( radioButtons, function( item ) {
      return item.width;
    } ).width;

    for ( i = 0; i < radioButtons.length; i++ ) {
      var radioButton = radioButtons[ i ];

      // Touch areas
      radioButton.touchArea = new Bounds2(
        radioButton.localBounds.minX - touchExpansion, radioButton.localBounds.minY - touchExpansion,
        radioButton.localBounds.minX + maxRadioButtonWidth, radioButton.localBounds.maxY + touchExpansion );
    }

    var content;
    if ( hasWavelengthSlider ) {
      Property.addProperty( this, 'wavelength', wavelengthProperty.value * 1E9 );

      // Add WavelengthSlider node
      var wavelengthSlider = new WavelengthSlider( this.wavelengthProperty, {
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

      var wavelengthValueText = new Text( StringUtils.format( waveLengthPattern, this.wavelength, units_nmString ) );
      var wavelengthBoxShape = new Rectangle( 0, 0, new Text( units_nmString ).width + 36, 18, 2, 2, {
        fill: 'white',
        stroke: 'black'
      } );

      // add plus button
      var plusButton = new ArrowButton( 'right', function propertyPlus() {
        laserControlPanel.wavelengthProperty.set(
          Math.min( laserControlPanel.wavelength + 1, BendingLightConstants.LASER_MAX_WAVELENGTH ) );
      }, {
        scale: 0.6
      } );

      // touch area
      plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
        plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 8 );

      // add minus button
      var minusButton = new ArrowButton( 'left', function propertyMinus() {
        laserControlPanel.wavelengthProperty.set(
          Math.max( laserControlPanel.wavelength - 1, VisibleColor.MIN_WAVELENGTH ) );
      }, {
        scale: 0.6
      } );

      // disable the minus button at minimum wavelength and plus button at max wavelength
      this.wavelengthProperty.link( function( wavelength ) {
        plusButton.enabled = ( wavelength < BendingLightConstants.LASER_MAX_WAVELENGTH);
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

      var wavelengthValue = new Node( {
        children: [ minusButton, wavelengthBoxShape, wavelengthValueText, plusButton, wavelengthSlider ]
      } );
      if ( options.disableUnselected ) {
        radioButtonProperty.link( function() {

          // set the opacity when not selected
          wavelengthValue.setPickable( radioButtonProperty.value !== firstButtonValue );
          wavelengthValue.opacity = radioButtonProperty.value !== firstButtonValue ? 1 : 0.4;
        } );
      }

      // add the buttons to VBox
      content = new VBox( {
        spacing: options.spacing,
        children: radioButtons.concat( wavelengthValue ),
        align: 'left'
      } );
      this.wavelengthProperty.link( function( wavelength ) {

        // set the laser wavelength according to the slider wavelength
        wavelengthProperty.set( wavelength / 1E9 );

        // set the value in the slider text box
        wavelengthValueText.setText( StringUtils.format( waveLengthPattern, wavelength, units_nmString ) );
      } );
    }
    else {
      content = new VBox( {
        spacing: 10,
        children: radioButtons,
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