// Copyright 2015-2021, University of Colorado Boulder

/**
 * Controls for changing and viewing the medium type, including its current index of refraction
 * (depends on the laser wavelength through the dispersion function).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import bendingLightStrings from '../../bendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import DispersionFunction from '../model/DispersionFunction.js';
import Medium from '../model/Medium.js';
import Substance from '../model/Substance.js';

const airString = bendingLightStrings.air;
const customString = bendingLightStrings.custom;
const glassString = bendingLightStrings.glass;
const indexOfRefractionString = bendingLightStrings.indexOfRefraction;
const unknownString = bendingLightStrings.unknown;
const waterString = bendingLightStrings.water;

// constants
const INDEX_OF_REFRACTION_MIN = Substance.AIR.indexForRed;
const INDEX_OF_REFRACTION_MAX = 1.6;
const PLUS_MINUS_SPACING = 4;
const INSET = 10;

class MediumControlPanel extends Node {

  /**
   * @param {BendingLightScreenView} view - view of the simulation
   * @param {MediumColorFactory} mediumColorFactory - for turning index of refraction into color
   * @param {Property.<Medium>} mediumProperty - specifies medium
   * @param {string} name - name of the medium material
   * @param {boolean} textFieldVisible - whether to display index of refraction value
   * @param {number} laserWavelength - wavelength of laser
   * @param {number} decimalPlaces - decimalPlaces to show for index of refraction
   * @param {Object} [options] - options that can be passed on to the underlying node
   */
  constructor( view, mediumColorFactory, mediumProperty, name, textFieldVisible, laserWavelength,
               decimalPlaces, options ) {

    super();
    this.mediumColorFactory = mediumColorFactory;

    options = merge( {
      xMargin: 10,
      yMargin: 10,
      fill: '#f2fa6a',
      stroke: '#696969',
      lineWidth: 1.5,
      comboBoxListPosition: 'above'
    }, options );
    this.mediumProperty = mediumProperty; // @private, the medium to observe
    this.laserWavelength = laserWavelength; // @private
    const initialSubstance = mediumProperty.get().substance;

    // store the value the user used last (unless it was mystery), so we can revert to it when going to custom.
    // if we kept the same index of refraction, the user could use that to easily look up the mystery values.
    let lastNonMysteryIndexAtRed = initialSubstance.indexOfRefractionForRedLight;

    // dummy state for putting the combo box in "custom" mode, meaning none of the other named substances are selected
    const customState = new Substance(
      customString,
      Substance.MYSTERY_B.indexOfRefractionForRedLight + 1.2,
      false,
      true
    );
    let custom = true;

    // add material combo box
    const materialTitleWidth = textFieldVisible ? 80 : 90;
    const materialTitle = new Text( name, { font: new PhetFont( 12 ), fontWeight: 'bold' } );
    if ( materialTitle.width > materialTitleWidth ) {
      materialTitle.scale( materialTitleWidth / materialTitle.width );
    }

    const textOptionsOfComboBoxStrings = { font: new PhetFont( 10 ) };

    const createItem = item => {
      const comboBoxTextWidth = textFieldVisible ? 130 : 75;
      const itemName = new Text( item.name, textOptionsOfComboBoxStrings );
      if ( itemName.width > comboBoxTextWidth ) {
        itemName.scale( comboBoxTextWidth / itemName.width );
      }

      return new ComboBoxItem( itemName, item );
    };
    // states to choose from (and indicate) in the combo box
    const substances = [
      Substance.AIR,
      Substance.WATER,
      Substance.GLASS,
      Substance.MYSTERY_A,
      Substance.MYSTERY_B,
      customState
    ];
    const comboBoxSubstanceProperty = new Property( initialSubstance );

    // update combo box
    const updateComboBox = () => {
      let selected = -1;
      for ( let i = 0; i < substances.length; i++ ) {
        const substance = substances[ i ];
        if ( substance.dispersionFunction.getIndexOfRefraction( laserWavelength.get() ) ===
             mediumProperty.get().getIndexOfRefraction( laserWavelength.get() ) ) {
          selected = i;
        }
      }

      // only set to a different substance if "custom" wasn't specified.
      // otherwise pressing "air" then "custom" will make the combo box jump back to "air"
      if ( selected !== -1 && !mediumProperty.get().substance.custom ) {
        comboBoxSubstanceProperty.set( substances[ selected ] );
        custom = false;
      }
      else {
        // no match to a named medium, so it must be a custom medium
        comboBoxSubstanceProperty.set( customState );
        custom = true;
      }
    };

    // items
    const items = [];
    for ( let i = 0; i < substances.length; i++ ) {
      const material = substances[ i ];
      items[ i ] = createItem( material );
    }
    // add a combo box
    const materialComboBox = new ComboBox( items, comboBoxSubstanceProperty, view, {
      labelNode: materialTitle,
      listPosition: options.comboBoxListPosition,
      xMargin: 7,
      yMargin: 4,
      arrowHeight: 6,
      cornerRadius: 3
    } );

    // add index of refraction text and value
    const textOptions = { font: new PhetFont( 12 ) };
    const indexOfRefractionLabelWidth = textFieldVisible ? 152 : 208;
    const indexOfRefractionLabel = new Text( indexOfRefractionString, textOptions );
    if ( indexOfRefractionLabel.width > indexOfRefractionLabelWidth ) {
      indexOfRefractionLabel.scale( indexOfRefractionLabelWidth / indexOfRefractionLabel.width );
    }
    this.mediumIndexProperty = new Property( mediumProperty.get().getIndexOfRefraction( laserWavelength.get() ), {
      reentrant: true
    } );
    const readoutString = Utils.toFixed( this.mediumIndexProperty.get(), decimalPlaces );
    const indexOfRefractionValueText = new Text( readoutString, textOptions );
    const indexOfRefractionReadoutBoxShape = new Rectangle( 0, 0, 45, 20, 2, 2, {
      fill: 'white',
      stroke: 'black'
    } );

    // add plus button for index of refraction text
    const plusButton = new ArrowButton( 'right', () => {
      custom = true;
      this.mediumIndexProperty.set(
        Utils.toFixedNumber( Math.min( this.mediumIndexProperty.get() + 1 / Math.pow( 10, decimalPlaces ),
          INDEX_OF_REFRACTION_MAX ), decimalPlaces ) );
    }, {
      scale: 0.7,
      xMargin: 5,
      yMargin: 5,
      arrowHeight: 15,
      arrowWidth: 15
    } );

    // touch area
    plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
      plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 20 );

    // add minus button for index of refraction text
    const minusButton = new ArrowButton( 'left', () => {
      custom = true;
      this.mediumIndexProperty.set(
        Utils.toFixedNumber( Math.max( this.mediumIndexProperty.get() - 1 / Math.pow( 10, decimalPlaces ),
          INDEX_OF_REFRACTION_MIN ), decimalPlaces ) );
    }, {
      scale: 0.7,
      xMargin: 5,
      yMargin: 5,
      arrowHeight: 15,
      arrowWidth: 15
    } );
    // touch area
    minusButton.touchArea = new Bounds2(
      minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
      minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 20
    );

    // adjust index of refraction value to the center of the readout box
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

    const indexOfRefractionNode = new Node( {
      children: textFieldVisible ? [
        indexOfRefractionLabel,
        minusButton,
        indexOfRefractionReadoutBoxShape,
        indexOfRefractionValueText,
        plusButton
      ] : [
        indexOfRefractionLabel
      ]
    } );

    // handling long strings, bring the slider in enough that moving the knob to the right doesn't resize the parent
    // panel.
    const sliderWidth = Math.max( materialComboBox.width, indexOfRefractionNode.width ) - 12;
    const labelWidth = sliderWidth * 0.25;
    const airTitle = new Text( airString );
    if ( airTitle.width > labelWidth ) {
      airTitle.scale( labelWidth / airTitle.width );
    }
    const waterTitle = new Text( waterString );
    if ( waterTitle.width > labelWidth ) {
      waterTitle.scale( labelWidth / waterTitle.width );
    }
    const glassTitle = new Text( glassString );
    if ( glassTitle.width > labelWidth ) {
      glassTitle.scale( labelWidth / glassTitle.width );
    }

    // add slider for index of refraction
    const indexOfRefractionSlider = new HSlider( this.mediumIndexProperty,
      new Range( INDEX_OF_REFRACTION_MIN, INDEX_OF_REFRACTION_MAX ), {
        trackFill: 'white',
        trackSize: new Dimension2( sliderWidth, 1 ),
        thumbSize: new Dimension2( 10, 20 ),
        thumbTouchAreaYDilation: 8, // So it will not overlap the tweaker buttons
        majorTickLength: 11,
        tickLabelSpacing: 3,
        startDrag: () => {
          custom = true;
        }
      } );
    indexOfRefractionSlider.addMajorTick( Substance.AIR.indexOfRefractionForRedLight, airTitle );
    indexOfRefractionSlider.addMajorTick( Substance.WATER.indexOfRefractionForRedLight, waterTitle );
    indexOfRefractionSlider.addMajorTick( Substance.GLASS.indexOfRefractionForRedLight, glassTitle );
    indexOfRefractionSlider.addMajorTick( 1.6 );

    // add a text to display when mystery is selected
    const unknown = new Text( unknownString, {
      font: new PhetFont( 16 ),
      centerX: indexOfRefractionSlider.centerX,
      centerY: indexOfRefractionSlider.centerY,
      maxWidth: indexOfRefractionSlider.width * 0.8
    } );

    // position the indexOfRefractionNode and indexOfRefractionSlider
    indexOfRefractionNode.top = materialComboBox.bottom + INSET;
    indexOfRefractionNode.left = materialComboBox.left;
    indexOfRefractionSlider.left = materialComboBox.left;
    indexOfRefractionSlider.top = indexOfRefractionNode.bottom + INSET / 2;
    unknown.centerX = materialComboBox.centerX;
    unknown.centerY = indexOfRefractionNode.bottom + INSET;

    // add all the nodes to mediumPanelNode
    const mediumPanelNode = new Node( {
      children: [ materialComboBox, indexOfRefractionNode, indexOfRefractionSlider, unknown ],
      spacing: 10
    } );

    const mediumPanel = new Panel( mediumPanelNode, {
      fill: '#EEEEEE',
      stroke: '#696969',
      xMargin: 13.5, // Adjusted manually so that the panels will align in English and the slider knob won't go outside
                     // the panel
      yMargin: options.yMargin,
      cornerRadius: 5,
      lineWidth: options.lineWidth,
      resize: false // Don't resize when the slider knob encroaches on the right border
    } );
    this.addChild( mediumPanel );
    Property.multilink( [ mediumProperty, this.laserWavelength ],
      () => {
        custom = mediumProperty.get().substance.custom;
        indexOfRefractionValueText.text = Utils.toFixed(
          mediumProperty.get().getIndexOfRefraction( laserWavelength.get() ), decimalPlaces );
      } );

    mediumProperty.link( () => {
      indexOfRefractionNode.setVisible( !mediumProperty.get().isMystery() );
      unknown.setVisible( mediumProperty.get().isMystery() );
      indexOfRefractionSlider.setVisible( !mediumProperty.get().isMystery() );
      if ( !mediumProperty.get().isMystery() ) {
        lastNonMysteryIndexAtRed = mediumProperty.get().getIndexOfRefraction( BendingLightConstants.WAVELENGTH_RED );
        this.mediumIndexProperty.set( lastNonMysteryIndexAtRed );
      }
      updateComboBox();
    } );
    comboBoxSubstanceProperty.link( selected => {
      if ( !selected.custom ) {
        this.setSubstance( selected );
      }
      else {

        // if it was custom, then use the index of refraction but keep the name as "custom"
        this.setSubstance( new Substance( selected.name, lastNonMysteryIndexAtRed, selected.mystery, selected.custom ) );
      }
    } );

    // disable the plus button when wavelength is at max and minus button at min wavelength
    this.mediumIndexProperty.link( indexOfRefraction => {
      if ( custom ) {
        this.setCustomIndexOfRefraction( indexOfRefraction );
      }
      plusButton.enabled = ( Utils.toFixed( indexOfRefraction, decimalPlaces ) < INDEX_OF_REFRACTION_MAX );
      minusButton.enabled = ( Utils.toFixed( indexOfRefraction, decimalPlaces ) > INDEX_OF_REFRACTION_MIN );
    } );
  }

  /**
   * @public
   */
  reset() {
    this.mediumIndexProperty.reset();
  }

  /**
   * Called when the user enters a new index of refraction (with text box or slider),
   * updates the model with the specified value
   * @public
   * @param {number} indexOfRefraction - indexOfRefraction of medium
   */
  setCustomIndexOfRefraction( indexOfRefraction ) {

    // have to pass the value through the dispersion function to account for the
    // current wavelength of the laser (since index of refraction is a function of wavelength)
    const dispersionFunction = new DispersionFunction( indexOfRefraction, this.laserWavelength.get() );
    this.setMedium( new Medium( this.mediumProperty.get().shape,
      new Substance( customString, indexOfRefraction, false, true ),
      this.mediumColorFactory.getColor( dispersionFunction.getIndexOfRefractionForRed() )
    ) );
  }

  /**
   * Update the medium state from the combo box
   * @public
   * @param {Substance} substance - specifies state of the medium
   */
  setSubstance( substance ) {
    const color = this.mediumColorFactory.getColor( substance.indexOfRefractionForRedLight );
    this.setMedium( new Medium( this.mediumProperty.get().shape, substance, color ) );
  }

  /**
   * Update the medium
   * @private
   * @param {Medium} medium - specifies medium
   */
  setMedium( medium ) {
    this.mediumProperty.set( medium );
  }
}

bendingLight.register( 'MediumControlPanel', MediumControlPanel );

export default MediumControlPanel;