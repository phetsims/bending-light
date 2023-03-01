// Copyright 2015-2023, University of Colorado Boulder

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
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, NodeOptions, Rectangle, Text } from '../../../../scenery/js/imports.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import ComboBox, { ComboBoxListPosition } from '../../../../sun/js/ComboBox.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import DispersionFunction from '../model/DispersionFunction.js';
import Medium from '../model/Medium.js';
import Substance from '../model/Substance.js';
import BendingLightScreenView from './BendingLightScreenView.js';
import MediumColorFactory from '../model/MediumColorFactory.js';
import Multilink from '../../../../axon/js/Multilink.js';
import optionize from '../../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

const airStringProperty = BendingLightStrings.airStringProperty;
const customStringProperty = BendingLightStrings.customStringProperty;
const glassStringProperty = BendingLightStrings.glassStringProperty;
const indexOfRefractionStringProperty = BendingLightStrings.indexOfRefractionStringProperty;
const unknownStringProperty = BendingLightStrings.unknownStringProperty;
const waterStringProperty = BendingLightStrings.waterStringProperty;

// constants
const INDEX_OF_REFRACTION_MIN = Substance.AIR.indexForRed;
const INDEX_OF_REFRACTION_MAX = 1.6;
const PLUS_MINUS_SPACING = 4;
const INSET = 10;

type SelfOptions = {
  comboBoxListPosition?: ComboBoxListPosition;
  xMargin?: number;
  yMargin?: number;
  lineWidth?: number;
  fill?: string;
  stroke?: string;
};

type MediumControlPanelOptions = SelfOptions & NodeOptions;

class MediumControlPanel extends Node {
  private readonly mediumColorFactory: MediumColorFactory;
  private readonly mediumProperty: Property<Medium>;
  private readonly laserWavelengthProperty: Property<number>;
  private readonly mediumIndexProperty: Property<number>;

  /**
   * @param view - view of the simulation
   * @param mediumColorFactory - for turning index of refraction into color
   * @param mediumProperty - specifies medium
   * @param nameProperty - name of the medium material
   * @param textFieldVisible - whether to display index of refraction value
   * @param laserWavelength - wavelength of laser
   * @param decimalPlaces - decimalPlaces to show for index of refraction
   * @param [providedOptions] - options that can be passed on to the underlying node
   */
  public constructor( view: BendingLightScreenView, mediumColorFactory: MediumColorFactory, mediumProperty: Property<Medium>,
                      nameProperty: TReadOnlyProperty<string>, textFieldVisible: boolean, laserWavelength: Property<number>,
                      decimalPlaces: number, providedOptions?: MediumControlPanelOptions ) {

    super();
    this.mediumColorFactory = mediumColorFactory;

    const options = optionize<MediumControlPanelOptions, SelfOptions, NodeOptions>()( {
      xMargin: 10,
      yMargin: 10,
      fill: '#f2fa6a',
      stroke: '#696969',
      lineWidth: 1.5,
      comboBoxListPosition: 'above'
    }, providedOptions ) as MediumControlPanelOptions;

    this.mediumProperty = mediumProperty;
    this.laserWavelengthProperty = laserWavelength;
    const initialSubstance = mediumProperty.get().substance;

    // store the value the user used last (unless it was mystery), so we can revert to it when going to custom.
    // if we kept the same index of refraction, the user could use that to easily look up the mystery values.
    let lastNonMysteryIndexAtRed = initialSubstance.indexOfRefractionForRedLight;

    // dummy state for putting the combo box in "custom" mode, meaning none of the other named substances are selected
    const customState = new Substance(
      customStringProperty,
      Substance.MYSTERY_B.indexOfRefractionForRedLight + 1.2,
      false,
      true
    );
    let custom = true;

    // add material combo box
    const materialTitleWidth = textFieldVisible ? 80 : 90;
    const materialTitle = new Text( nameProperty, { font: new PhetFont( 12 ), fontWeight: 'bold' } );
    if ( materialTitle.width > materialTitleWidth ) {
      materialTitle.scale( materialTitleWidth / materialTitle.width );
    }

    const textOptionsOfComboBoxStrings = { font: new PhetFont( 10 ) };

    const createItem = ( item: Substance ) => {

      return {
        value: item,
        createNode: () => {
          const comboBoxTextWidth = textFieldVisible ? 130 : 75;
          const itemName = new Text( item.nameProperty, textOptionsOfComboBoxStrings );
          if ( itemName.width > comboBoxTextWidth ) {
            itemName.scale( comboBoxTextWidth / itemName.width );
          }
          return itemName;
        }
      };
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
    const comboBoxSubstanceProperty = new Property<Substance>( initialSubstance );

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
      items[ i ] = createItem( substances[ i ] );
    }
    // add a combo box
    const materialComboBox = new ComboBox( comboBoxSubstanceProperty, items, view, {
      listPosition: options.comboBoxListPosition,
      xMargin: 7,
      yMargin: 4,
      // TODO: arrowHeight doesn't exist in ComboBox, should we add that feature?
      // arrowHeight: 6,
      cornerRadius: 3
    } );

    const materialControl = new HBox( {
      spacing: 10,
      children: [
        materialTitle,
        materialComboBox
      ]
    } );

    // add index of refraction text and value
    const textOptions = { font: new PhetFont( 12 ) };
    const indexOfRefractionLabelWidth = textFieldVisible ? 152 : 208;
    const indexOfRefractionLabel = new Text( indexOfRefractionStringProperty, {
      font: new PhetFont( 12 ),
      maxWidth: 165
    } );
    if ( indexOfRefractionLabel.width > indexOfRefractionLabelWidth ) {
      indexOfRefractionLabel.scale( indexOfRefractionLabelWidth / indexOfRefractionLabel.width );
    }
    this.mediumIndexProperty = new Property( mediumProperty.get().getIndexOfRefraction( laserWavelength.get() ), {

      // See https://github.com/phetsims/bending-light/issues/378
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
    const sliderWidth = Math.max( materialControl.width, indexOfRefractionNode.width ) - 12;
    const labelWidth = sliderWidth * 0.25;
    const airTitle = new Text( airStringProperty );
    if ( airTitle.width > labelWidth ) {
      airTitle.scale( labelWidth / airTitle.width );
    }
    const waterTitle = new Text( waterStringProperty );
    if ( waterTitle.width > labelWidth ) {
      waterTitle.scale( labelWidth / waterTitle.width );
    }
    const glassTitle = new Text( glassStringProperty );
    if ( glassTitle.width > labelWidth ) {
      glassTitle.scale( labelWidth / glassTitle.width );
    }

    // add slider for index of refraction
    const indexOfRefractionSlider = new HSlider( this.mediumIndexProperty,
      new Range( INDEX_OF_REFRACTION_MIN, INDEX_OF_REFRACTION_MAX ), {
        trackFillEnabled: 'white',
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
    const unknown = new Text( unknownStringProperty, {
      font: new PhetFont( 16 ),
      centerX: indexOfRefractionSlider.centerX,
      centerY: indexOfRefractionSlider.centerY,
      maxWidth: indexOfRefractionSlider.width * 0.8
    } );

    // position the indexOfRefractionNode and indexOfRefractionSlider
    indexOfRefractionNode.top = materialControl.bottom + INSET;
    indexOfRefractionNode.left = materialControl.left;
    indexOfRefractionSlider.left = materialControl.left;
    indexOfRefractionSlider.top = indexOfRefractionNode.bottom + INSET / 2;
    unknown.centerX = materialControl.centerX;
    unknown.centerY = indexOfRefractionNode.bottom + INSET;

    // add all the nodes to mediumPanelNode
    const mediumPanelNode = new Node( {
      children: [ materialControl, indexOfRefractionNode, indexOfRefractionSlider, unknown ],
      // @ts-expect-error TODO: Spacing isn't on Node
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
    Multilink.multilink( [ mediumProperty, this.laserWavelengthProperty ],
      () => {
        custom = mediumProperty.get().substance.custom;
        indexOfRefractionValueText.string = Utils.toFixed(
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
        this.setSubstance( new Substance( selected.nameProperty, lastNonMysteryIndexAtRed, selected.mystery, selected.custom ) );
      }
    } );

    // disable the plus button when wavelength is at max and minus button at min wavelength
    this.mediumIndexProperty.link( indexOfRefraction => {
      if ( custom ) {
        this.setCustomIndexOfRefraction( indexOfRefraction );
      }

      const slack = Math.pow( 10, -decimalPlaces );
      plusButton.enabled = ( indexOfRefraction < INDEX_OF_REFRACTION_MAX - slack / 2 );
      minusButton.enabled = ( indexOfRefraction > INDEX_OF_REFRACTION_MIN + slack / 2 );
    } );
  }

  /**
   */
  public reset(): void {
    this.mediumIndexProperty.reset();
  }

  /**
   * Called when the user enters a new index of refraction (with text box or slider),
   * updates the model with the specified value
   * @param indexOfRefraction - indexOfRefraction of medium
   */
  private setCustomIndexOfRefraction( indexOfRefraction: number ): void {

    // have to pass the value through the dispersion function to account for the
    // current wavelength of the laser (since index of refraction is a function of wavelength)
    const dispersionFunction = new DispersionFunction( indexOfRefraction, this.laserWavelengthProperty.get() );
    this.setMedium( new Medium( this.mediumProperty.get().shape,
      new Substance( customStringProperty, indexOfRefraction, false, true ),
      this.mediumColorFactory.getColor( dispersionFunction.getIndexOfRefractionForRed() )
    ) );
  }

  /**
   * Update the medium state from the combo box
   * @param substance - specifies state of the medium
   */
  private setSubstance( substance: Substance ): void {
    const color = this.mediumColorFactory.getColor( substance.indexOfRefractionForRedLight );
    this.setMedium( new Medium( this.mediumProperty.get().shape, substance, color ) );
  }

  /**
   * Update the medium
   * @param medium - specifies medium
   */
  private setMedium( medium: Medium ): void {
    this.mediumProperty.set( medium );
  }
}

bendingLight.register( 'MediumControlPanel', MediumControlPanel );

export default MediumControlPanel;