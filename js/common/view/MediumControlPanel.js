// Copyright 2002-2011, University of Colorado
/**
 * Controls for changing and viewing the medium type, including its current index of refraction (depends on the laser wavelength through the dispersion function).
 *
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
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HSlider = require( 'SUN/HSlider' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );
  var Medium = require( 'BENDING_LIGHT/common/model/Medium' );
  var DispersionFunction = require( 'BENDING_LIGHT/common/model/DispersionFunction' );
  var MediumState = require( 'BENDING_LIGHT/common/model/MediumState' );
  var WAVELENGTH_RED = 65E-09;

  // strings
  var airString = require( 'string!BENDING_LIGHT/air' );
  var waterString = require( 'string!BENDING_LIGHT/water' );
  var glassString = require( 'string!BENDING_LIGHT/glass' );
  var mysteryAString = require( 'string!BENDING_LIGHT/mysteryA' );
  var mysteryBString = require( 'string!BENDING_LIGHT/mysteryB' );
  var customString = require( 'string!BENDING_LIGHT/custom' );
  var materialString = require( 'string!BENDING_LIGHT/material' );
  var indexOfRefractionWithSymbolString = require( 'string!BENDING_LIGHT/indexOfRefractionWithSymbol' );

//Range of the index of refraction slider
  var MIN = 1;
  var MAX = 1.6;


  var mediumColorFactory = new MediumColorFactory;

  function MediumControlPanel( model, view, medium, textFieldVisible, laserWavelength ) {
    //Dummy state for putting the combo box in "custom" mode, meaning none of the other named substances are selected
    Node.call( this );
    var mediumControlPanel = this;

    //Store the value the user used last (unless it was mystery), so we can revert to it when going to custom.
    //If we kept the same index of refraction, the user could use that to easily look up the mystery values.

    //private
    this.lastNonMysteryIndexAtRed;
    this.medium = medium; //The medium to observe
    this.laserWavelength = laserWavelength;
    this.model = model;

    // add material combo box
    var textOptions = { font: new PhetFont( 12 ) };
    var materialTitle = new Text( materialString, textOptions );
    this.indexOfRefractionReadoutBoxShape = new Rectangle( 0, 0, 80, 15, 2, 2, { fill: 'white', stroke: 'black' } );
    var indexOfRefractionValueText = new Text( '1', textOptions );
    var indexOfRefractionLabel = new Text( indexOfRefractionWithSymbolString, textOptions );
    var textOptionsOfComboBoxStrings = { font: new PhetFont( 10 ) };

    var airText = new Text( airString, textOptionsOfComboBoxStrings );
    var waterText = new Text( waterString, textOptionsOfComboBoxStrings );
    var mysteryAText = new Text( mysteryAString, textOptionsOfComboBoxStrings );
    var mysteryBText = new Text( mysteryBString, textOptionsOfComboBoxStrings );
    var customText = new Text( customString, textOptionsOfComboBoxStrings );
    var glassText = new Text( glassString, textOptionsOfComboBoxStrings );

    var materialProperty = new Property( 3 );
    var materialComboBox = new ComboBox( [
      ComboBox.createItem( airText, 0 ),
      ComboBox.createItem( waterText, 1 ),
      ComboBox.createItem( glassText, 2 ),
      ComboBox.createItem( mysteryAText, 3 ),
      ComboBox.createItem( mysteryBText, 4 ),
      ComboBox.createItem( customText, 5 )
    ], materialProperty, this, {
      buttonXMargin: 5,
      buttonYMargin: 2,
      buttonCornerRadius: 5,
      itemXMargin: 2,
      itemYMargin: 2,
      buttonLineWidth: 0.4
    } );


    var airTitle = new Text( airString, textOptions );
    var waterTitle = new Text( waterString, textOptions );
    var glassTitle = new Text( glassString, textOptions );
    var indexProperty = new Property( medium.value.getIndexOfRefraction( laserWavelength ) );

    var indexOfRefractionSlider = new HSlider( indexProperty,
      { min: MIN, max: MAX },
      {
        trackFill: 'white',
        trackSize: new Dimension2( 130, 5 ),
        thumbSize: new Dimension2( 10, 20 ),
        majorTickLength: 15,
        minorTickLength: 12,
        trackStroke: 'black',
        trackLineWidth: 1,
        thumbLineWidth: 1,
        tickLabelSpacing: 6,
        majorTickLineWidth: 1,

        minorTickLineWidth: 1,

        cursor: 'pointer'

      } );
    indexOfRefractionSlider.addMajorTick( 1, airTitle );
    indexOfRefractionSlider.addMajorTick( 1.2, waterTitle );
    indexOfRefractionSlider.addMajorTick( 1.6, glassTitle );
    indexProperty.link( function( indexOfRefraction ) {
      mediumControlPanel.setCustomIndexOfRefraction( indexOfRefraction );
    } );


    var material = new HBox( {
      children: [ materialTitle, materialComboBox ],
      spacing: 10
    } );

    var indexOfRefraction = new HBox( {
      children: [ indexOfRefractionLabel, this.indexOfRefractionReadoutBoxShape, indexOfRefractionValueText ],
      spacing: 10
    } );

    var panelVBox = new VBox( {
      children: [ material, indexOfRefraction, indexOfRefractionSlider ]
    } );

    var panel = new Panel( panelVBox, { fill: '#C6CACE' } );
    this.addChild( panel );

  }

  return inherit( Node, MediumControlPanel, {

    /**
     * Called when the user enters a new index of refraction (with text box or slider),
     * updates the model with the specified value
     * @param indexOfRefraction
     */
    setCustomIndexOfRefraction: function( indexOfRefraction ) {
      //Have to pass the value through the dispersion function to account for the
      // current wavelength of the laser (since index of refraction is a function of wavelength)
      var dispersionFunction = new DispersionFunction( indexOfRefraction, this.laserWavelength );
      this.setMedium( new Medium( this.medium.get().shape, new MediumState( customString, dispersionFunction, false, true ), mediumColorFactory.getColor( dispersionFunction.getIndexOfRefractionForRed() ) ) );
    },

    /**
     *  Update the medium state from the combo box
     * @param mediumState
     */
    setMediumState: function( mediumState ) {
      this.setMedium( new Medium( this.medium.shape, mediumState,
        this.model.mediumColorFactory.getColor( mediumState.getIndexOfRefractionForRedLight() ) ) );
    },

    /**
     *
     * @param mediumValue
     */
    setMedium: function( mediumValue ) {
      this.medium.set( mediumValue );
    }
  } );
} );

