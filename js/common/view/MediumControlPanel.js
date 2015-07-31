// Copyright 2002-2015, University of Colorado Boulder

/**
 * Controls for changing and viewing the medium type, including its current index of refraction
 * (depends on the laser wavelength through the dispersion function).
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var ComboBox = require( 'SUN/ComboBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HSlider = require( 'SUN/HSlider' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );
  var Medium = require( 'BENDING_LIGHT/common/model/Medium' );
  var DispersionFunction = require( 'BENDING_LIGHT/common/model/DispersionFunction' );
  var MediumState = require( 'BENDING_LIGHT/common/model/MediumState' );
  var ArrowButton = require( 'SCENERY_PHET/buttons/ArrowButton' );
  var Util = require( 'DOT/Util' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );

  // strings
  var airString = require( 'string!BENDING_LIGHT/air' );
  var waterString = require( 'string!BENDING_LIGHT/water' );
  var glassString = require( 'string!BENDING_LIGHT/glass' );
  var customString = require( 'string!BENDING_LIGHT/custom' );
  var unknownString = require( 'string!BENDING_LIGHT/unknown' );
  var indexOfRefractionString = require( 'string!BENDING_LIGHT/indexOfRefraction' );

  // constants
  // range of the index of refraction slider
  var INDEX_OF_REFRACTION_MIN = 1.0;
  var INDEX_OF_REFRACTION_MAX = 1.6;
  var PLUS_MINUS_SPACING = 4;
  var INSET = 10;

  /**
   * @param {BendingLightView} view - view of the simulation
   * @param {Property.<Medium>} mediumProperty - specifies medium
   * @param {string} name - name of the medium material
   * @param {boolean} textFieldVisible - whether to display index of refraction value
   * @param {number} laserWavelength - wavelength of laser
   * @param {number} decimalPlaces - decimalPlaces to show for index of refraction
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function MediumControlPanel( view, mediumProperty, name, textFieldVisible, laserWavelength, decimalPlaces, options ) {

    Node.call( this );
    var mediumControlPanel = this;

    options = _.extend( {
      xMargin: 10,
      yMargin: 10,
      fill: '#f2fa6a',
      stroke: '#696969',
      lineWidth: 1.5
    }, options );
    this.mediumProperty = mediumProperty; // the medium to observe
    this.laserWavelength = laserWavelength;
    var initialMediumState = mediumProperty.get().mediumState;

    // store the value the user used last (unless it was mystery), so we can revert to it when going to custom.
    // if we kept the same index of refraction, the user could use that to easily look up the mystery values.
    var lastNonMysteryIndexAtRed = initialMediumState.getIndexOfRefractionForRedLight();

    // dummy state for putting the combo box in "custom" mode, meaning none of the other named substances are selected
    var customState = new MediumState( customString, BendingLightModel.MYSTERY_B.getIndexOfRefractionForRedLight() + 1.2, false, true );
    var custom = true;

    // add material combo box
    var materialTitleWidth = textFieldVisible ? 80 : 90;
    var materialTitle = new Text( name, { font: new PhetFont( 12 ), fontWeight: 'bold' } );
    if ( materialTitle.width > materialTitleWidth ) {
      materialTitle.scale( materialTitleWidth / materialTitle.width );
    }

    var maxWidth = (textFieldVisible ? 178 : 128) - materialTitle.width;
    var textOptionsOfComboBoxStrings = { font: new PhetFont( 10 ) };

    var createItem = function( item ) {
      var comboBoxTextWidth = textFieldVisible ? 130 : 75;
      var itemName = new Text( item.name, textOptionsOfComboBoxStrings );
      if ( itemName.width > comboBoxTextWidth ) {
        itemName.scale( comboBoxTextWidth / itemName.width );
      }
      var strutWidth = maxWidth - itemName.width;

      return ComboBox.createItem( new HBox( {
        children: [ itemName, new HStrut( strutWidth ) ]
      } ), item );
    };
    // states to choose from (and indicate) in the combo box
    var mediumStates = [
      BendingLightModel.AIR,
      BendingLightModel.WATER,
      BendingLightModel.GLASS,
      BendingLightModel.MYSTERY_A,
      BendingLightModel.MYSTERY_B,
      customState ];
    var comboBoxMediumStateProperty = new Property( initialMediumState );

    // update combo box
    var updateComboBox = function() {
      var selected = -1;
      for ( var i = 0; i < mediumStates.length; i++ ) {
        var mediumState = mediumStates[ i ];
        if ( mediumState.dispersionFunction.getIndexOfRefraction( laserWavelength.get() ) ===
             mediumProperty.get().getIndexOfRefraction( laserWavelength.get() ) ) {
          selected = i;
        }
      }

      // only set to a different substance if "custom" wasn't specified.
      // otherwise pressing "air" then "custom" will make the combobox jump back to "air"
      if ( selected !== -1 && !mediumProperty.get().mediumState.custom ) {
        comboBoxMediumStateProperty.set( mediumStates[ selected ] );
        custom = false;
      }
      else {
        // no match to a named medium, so it must be a custom medium
        comboBoxMediumStateProperty.set( customState );
        custom = true;
      }
    };

    // items
    var items = [];
    for ( var i = 0; i < mediumStates.length; i++ ) {
      var material = mediumStates[ i ];
      items[ i ] = createItem( material );
    }
    var materialComboBox = new ComboBox( items, comboBoxMediumStateProperty, view, {
      labelNode: materialTitle,
      listPosition: 'below',
      buttonXMargin: 5,
      buttonYMargin: 2,
      buttonCornerRadius: 3,
      itemXMargin: 2,
      itemYMargin: 2
    } );

    var textOptions = { font: new PhetFont( 12 ) };
    var indexOfRefractionLabelWidth = textFieldVisible ? 152 : 208;
    var indexOfRefractionLabel = new Text( indexOfRefractionString, textOptions );
    if ( indexOfRefractionLabel.width > indexOfRefractionLabelWidth ) {
      indexOfRefractionLabel.scale( indexOfRefractionLabelWidth / indexOfRefractionLabel.width );
    }
    this.mediumIndexProperty = new Property( mediumProperty.get().getIndexOfRefraction( laserWavelength.get() ) );
    var indexOfRefractionValueText = new Text( Util.toFixed( this.mediumIndexProperty.get(), decimalPlaces ), textOptions );
    var indexOfRefractionReadoutBoxShape = new Rectangle( 0, 0, 45, 20, 2, 2, {
      fill: 'white',
      stroke: 'black'
    } );

    var plusButton = new ArrowButton( 'right', function propertyPlus() {
      custom = true;
      mediumControlPanel.mediumIndexProperty.set(
        Util.toFixedNumber( Math.min( mediumControlPanel.mediumIndexProperty.get() + 1 / Math.pow( 10, decimalPlaces ),
          INDEX_OF_REFRACTION_MAX ), decimalPlaces ) );
    }, {
      scale: 0.7,
      xMargin: 5,
      yMargin: 5,
      arrowHeight: 15,
      arrowWidth: 15
    } );
    plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
      plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 20 );

    var minusButton = new ArrowButton( 'left', function propertyMinus() {
      custom = true;
      mediumControlPanel.mediumIndexProperty.set(
        Util.toFixedNumber( Math.max( mediumControlPanel.mediumIndexProperty.get() - 1 / Math.pow( 10, decimalPlaces ),
          INDEX_OF_REFRACTION_MIN ), decimalPlaces ) );
    }, {
      scale: 0.7,
      xMargin: 5,
      yMargin: 5,
      arrowHeight: 15,
      arrowWidth: 15
    } );
    minusButton.touchArea = new Bounds2( minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
      minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 20 );

    indexOfRefractionValueText.centerX = indexOfRefractionReadoutBoxShape.centerX;
    indexOfRefractionValueText.centerY = indexOfRefractionReadoutBoxShape.centerY;

    // plus button to the right of the value
    plusButton.left = indexOfRefractionReadoutBoxShape.right + PLUS_MINUS_SPACING;
    plusButton.centerY = indexOfRefractionReadoutBoxShape.centerY;

    // minus button to the left of the value
    minusButton.right = indexOfRefractionReadoutBoxShape.left - PLUS_MINUS_SPACING;
    minusButton.centerY = indexOfRefractionReadoutBoxShape.centerY;

    indexOfRefractionLabel.right = minusButton.left - INSET;
    indexOfRefractionLabel.centerY = minusButton.centerY;

    var sliderWidth = Math.max( materialComboBox.width,
        textFieldVisible ? indexOfRefractionLabel.width + 90 : indexOfRefractionLabel.width ) - 35;
    var labelWidth = sliderWidth * 0.25;
    var airTitle = new Text( airString );
    if ( airTitle.width > labelWidth ) {
      airTitle.scale( labelWidth / airTitle.width );
    }
    var waterTitle = new Text( waterString );
    if ( waterTitle.width > labelWidth ) {
      waterTitle.scale( labelWidth / waterTitle.width );
    }
    var glassTitle = new Text( glassString );
    if ( glassTitle.width > labelWidth ) {
      glassTitle.scale( labelWidth / glassTitle.width );
    }
    var indexOfRefractionSlider = new HSlider( this.mediumIndexProperty, {
      min: INDEX_OF_REFRACTION_MIN,
      max: INDEX_OF_REFRACTION_MAX
    }, {
      trackFill: 'white',
      trackSize: new Dimension2( sliderWidth, 1 ),
      thumbSize: new Dimension2( 10, 20 ),
      majorTickLength: 11,
      tickLabelSpacing: 3,
      startDrag: function() {
        custom = true;
      }
    } );
    indexOfRefractionSlider.addMajorTick( BendingLightModel.AIR.getIndexOfRefractionForRedLight(), airTitle );
    indexOfRefractionSlider.addMajorTick( BendingLightModel.WATER.getIndexOfRefractionForRedLight(), waterTitle );
    indexOfRefractionSlider.addMajorTick( BendingLightModel.GLASS.getIndexOfRefractionForRedLight(), glassTitle );
    indexOfRefractionSlider.addMajorTick( 1.6 );

    var unknown = new Text( unknownString, {
      font: new PhetFont( 16 ),
      centerX: indexOfRefractionSlider.centerX,
      centerY: indexOfRefractionSlider.centerY
    } );
    var indexOfRefractionNode;
    if ( textFieldVisible ) {
      indexOfRefractionNode = new Node( {
        children: [ indexOfRefractionLabel, minusButton, indexOfRefractionReadoutBoxShape, indexOfRefractionValueText, plusButton ]
      } );
    }
    else {
      indexOfRefractionNode = new Node( {
        children: [ indexOfRefractionLabel ]
      } );
    }

    indexOfRefractionNode.top = materialComboBox.bottom + INSET;
    indexOfRefractionNode.left = materialComboBox.left;
    indexOfRefractionSlider.centerX = materialComboBox.centerX;
    indexOfRefractionSlider.top = indexOfRefractionNode.bottom + INSET / 2;
    unknown.centerX = materialComboBox.centerX;
    unknown.centerY = indexOfRefractionNode.bottom + INSET;
    var mediumPanelNode = new Node( {
      children: [ materialComboBox, indexOfRefractionNode, indexOfRefractionSlider, unknown ],
      spacing: 10
    } );

    var mediumPanel = new Panel( mediumPanelNode, {
      fill: '#EEEEEE',
      stroke: '#696969',
      xMargin: options.xMargin,
      yMargin: options.yMargin,
      cornerRadius: 5, lineWidth: options.lineWidth
    } );
    this.addChild( mediumPanel );
    Property.multilink( [ mediumProperty, this.laserWavelength ],
      function() {
        custom = mediumProperty.get().mediumState.custom;
        indexOfRefractionValueText.text = Util.toFixed(
          mediumProperty.get().getIndexOfRefraction( laserWavelength.get() ), decimalPlaces );
      } );


    mediumProperty.link( function() {
      indexOfRefractionNode.setVisible( !mediumProperty.get().isMystery() );
      unknown.setVisible( mediumProperty.get().isMystery() );
      indexOfRefractionSlider.setVisible( !mediumProperty.get().isMystery() );
      if ( !mediumProperty.get().isMystery() ) {
        lastNonMysteryIndexAtRed = mediumProperty.get().getIndexOfRefraction( BendingLightConstants.WAVELENGTH_RED );
        mediumControlPanel.mediumIndexProperty.set( lastNonMysteryIndexAtRed );
      }
      updateComboBox();
    } );
    comboBoxMediumStateProperty.link( function( selected ) {
      if ( !selected.custom ) {
        mediumControlPanel.setMediumState( selected );
      }
      else {

        // if it was custom, then use the the index of refraction but keep the name as "custom"
        mediumControlPanel.setMediumState(
          new MediumState( selected.name, lastNonMysteryIndexAtRed, selected.mystery, selected.custom ) );
      }
    } );

    this.mediumIndexProperty.link( function( indexOfRefraction ) {
      if ( custom ) {
        mediumControlPanel.setCustomIndexOfRefraction( indexOfRefraction );
      }
      plusButton.enabled = ( Util.toFixed( indexOfRefraction, decimalPlaces ) < INDEX_OF_REFRACTION_MAX);
      minusButton.enabled = ( Util.toFixed( indexOfRefraction, decimalPlaces ) > INDEX_OF_REFRACTION_MIN );
    } );
  }

  return inherit( Node, MediumControlPanel, {

    /**
     * @public
     */
    reset: function() {
      this.mediumIndexProperty.reset();
    },

    /**
     * Called when the user enters a new index of refraction (with text box or slider),
     * updates the model with the specified value
     * @public
     * @param {number} indexOfRefraction - indexOfRefraction of medium
     */
    setCustomIndexOfRefraction: function( indexOfRefraction ) {

      // have to pass the value through the dispersion function to account for the
      // current wavelength of the laser (since index of refraction is a function of wavelength)
      var dispersionFunction = new DispersionFunction( indexOfRefraction, this.laserWavelength.get() );
      this.setMedium( new Medium( this.mediumProperty.get().shape,
        new MediumState( customString, indexOfRefraction, false, true ),
        MediumColorFactory.getColor( dispersionFunction.getIndexOfRefractionForRed() )
      ) );
    },

    /**
     * Update the medium state from the combo box
     * @public
     * @param {MediumState} mediumState - specifies state of the medium
     */
    setMediumState: function( mediumState ) {
      this.setMedium( new Medium( this.mediumProperty.get().shape, mediumState,
        MediumColorFactory.getColor(
          mediumState.getIndexOfRefractionForRedLight() ) ) );
    },

    /**
     * Update the medium
     * @private
     * @param {Medium} medium - specifies medium
     */
    setMedium: function( medium ) {
      this.mediumProperty.set( medium );
    }
  } );
} );