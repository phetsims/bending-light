// Copyright 2015-2023, University of Colorado Boulder

/**
 * View for the "Prisms" Screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */


import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ProtractorNode from '../../../../scenery-phet/js/ProtractorNode.js';
import { DragListener, Node, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import bendingLight from '../../bendingLight.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import BendingLightScreenView, { BendingLightScreenViewOptions } from '../../common/view/BendingLightScreenView.js';
import FloatingLayout from '../../common/view/FloatingLayout.js';
import MediumControlPanel from '../../common/view/MediumControlPanel.js';
import TranslationDragHandle from '../../common/view/TranslationDragHandle.js';
import WavelengthControl from '../../common/view/WavelengthControl.js';
import Intersection from '../model/Intersection.js';
import PrismsModel from '../model/PrismsModel.js';
import IntersectionNode from './IntersectionNode.js';
import LaserTypeRadioButtonGroup from './LaserTypeRadioButtonGroup.js';
import PrismToolboxNode from './PrismToolboxNode.js';
import WhiteLightCanvasNode from './WhiteLightCanvasNode.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import ColorModeEnum from '../../common/model/ColorModeEnum.js';
import LightType from '../model/LightType.js';

// constants
const INSET = 10;

const environmentStringProperty = BendingLightStrings.environmentStringProperty;

type PrismsScreenViewOptions = BendingLightScreenViewOptions;

class PrismsScreenView extends BendingLightScreenView {
  private prismLayer: Node;
  private prismsModel: PrismsModel;
  private resetPrismsView: () => void;

  // @ts-expect-error assigned in the supercall which calls addLightNodes
  private whiteLightNode: WhiteLightCanvasNode;

  /**
   * @param prismsModel - model of prisms screen
   * @param [providedOptions]
   */
  public constructor( prismsModel: PrismsModel, providedOptions?: PrismsScreenViewOptions ) {

    super(
      prismsModel,

      // laserHasKnob
      true,

      merge( {

        // center the play area horizontally in the space between the left side of the screen and the control panels on
        // the right, and move the laser to the left.
        horizontalPlayAreaOffset: 240,

        // Center the play area vertically above the south control panel
        verticalPlayAreaOffset: -43,

        // if the prism is dropped behind a control panel, bump it to the left.
        occlusionHandler: ( node: Node ) => {

          const controlPanels = [
            laserControlPanel,
            laserTypeRadioButtonGroup,
            environmentMediumControlPanel
          ];
          controlPanels.forEach( controlPanel => {
            if ( controlPanel.globalBounds.containsPoint( node.globalBounds.center ) ) {

              // @ts-expect-error
              node.translateViewXY( node.globalToParentBounds( controlPanel.globalBounds ).minX - node.centerX, 0 );
            }
          } );
        }
      }, providedOptions )
    );

    this.prismLayer = new Node( { layerSplit: true } );
    this.prismsModel = prismsModel;

    // Node for the environment that spans the screen (only for monochromatic light, the white light background
    // is rendered as opaque in the white light node for blending purposes)
    const environmentMediumNodeForMonochromaticLight = new Rectangle( 0, 0, 0, 0 );
    prismsModel.environmentMediumProperty.link( environmentMedium => {

      // This medium node only shows the color for monochromatic light
      const indexOfRefractionForRed = environmentMedium.substance.dispersionFunction.getIndexOfRefractionForRed();
      const color = prismsModel.mediumColorFactory.getColorAgainstWhite( indexOfRefractionForRed );

      environmentMediumNodeForMonochromaticLight.fill = color;
    } );

    // Put it behind everything else
    this.insertChild( 0, environmentMediumNodeForMonochromaticLight );

    const indexOfRefractionDecimals = 2;

    // Add control panels for setting the index of refraction for each medium
    const environmentMediumControlPanel = new MediumControlPanel( this, prismsModel.mediumColorFactory, prismsModel.environmentMediumProperty,
      environmentStringProperty, false, prismsModel.wavelengthProperty,
      indexOfRefractionDecimals, {
        yMargin: 6,
        comboBoxListPosition: 'below'
      } );
    environmentMediumControlPanel.setTranslation(
      this.layoutBounds.right - 2 * INSET - environmentMediumControlPanel.width, this.layoutBounds.top + 15 );
    this.afterLightLayer2.addChild( environmentMediumControlPanel );

    const sliderEnabledProperty = new BooleanProperty( false );

    const radioButtonAdapterProperty = new EnumerationProperty( LightType.SINGLE_COLOR );
    radioButtonAdapterProperty.link( radioButtonAdapterValue => {
      prismsModel.laser.colorModeProperty.value = radioButtonAdapterValue === LightType.WHITE ? ColorModeEnum.WHITE :
                                                  ColorModeEnum.SINGLE_COLOR;
      prismsModel.manyRaysProperty.value = radioButtonAdapterValue === LightType.SINGLE_COLOR_5X ? 5 : 1;
      sliderEnabledProperty.value = radioButtonAdapterValue !== LightType.WHITE;
    } );

    const laserTypeRadioButtonGroup = new LaserTypeRadioButtonGroup( radioButtonAdapterProperty );
    this.afterLightLayer2.addChild( laserTypeRadioButtonGroup );

    const laserControlPanel = new Panel( new VBox( {
      spacing: 10,
      children: [
        new WavelengthControl( prismsModel.wavelengthProperty, sliderEnabledProperty, 146 ) ]
    } ), {
      cornerRadius: 5,
      xMargin: 10,
      yMargin: 6,
      fill: '#EEEEEE',
      stroke: '#696969',
      lineWidth: 1.5
    } );

    this.afterLightLayer2.addChild( laserControlPanel );
    this.incidentWaveLayer.setVisible( false );

    // Optionally show the normal lines at each intersection
    prismsModel.intersections.addItemAddedListener( ( addedIntersection: Intersection ) => {
      if ( prismsModel.showNormalsProperty.value ) {
        const node = new IntersectionNode(
          this.modelViewTransform,
          addedIntersection,
          prismsModel.intersectionStrokeProperty
        );
        this.addChild( node );

        prismsModel.intersections.addItemRemovedListener( ( removedIntersection: Intersection ) => {
          if ( removedIntersection === addedIntersection ) {

            // dispose will remove the child from the view
            node.dispose();
          }
        } );
      }
    } );

    // Add prisms toolbox Node
    const prismToolboxNode = new PrismToolboxNode(
      this.modelViewTransform,
      prismsModel,
      this.prismLayer,
      this.visibleBoundsProperty,
      this.occlusionHandler, {
        left: this.layoutBounds.minX + 12
      }
    );

    // Add the reset all button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        prismsModel.reset();
        this.reset();
        environmentMediumControlPanel.reset();
        prismToolboxNode.objectMediumControlPanel.reset();
        radioButtonAdapterProperty.reset();
      },
      radius: 19
    } );

    this.afterLightLayer2.addChild( resetAllButton );
    this.afterLightLayer.addChild( prismToolboxNode );

    // Add the protractor node
    const protractorNode = new ProtractorNode( {
      visibleProperty: prismsModel.showProtractorProperty,
      rotatable: true,
      scale: 0.46
    } );
    const protractorPositionProperty = new Property( this.modelViewTransform.modelToViewXY( 2E-5, 0 ) );

    const protractorNodeListener = new DragListener( {
      useParentOffset: true,
      positionProperty: protractorPositionProperty,
      targetNode: protractorNode,
      dragBoundsProperty: this.visibleBoundsProperty,
      end: () => {

        // If the protractor is hidden behind any of the controls in the top right, move it to the left
        const bounds = environmentMediumControlPanel.globalBounds
          .union( laserTypeRadioButtonGroup.globalBounds )
          .union( laserControlPanel.globalBounds );
        while ( bounds.intersectsBounds( protractorNode.globalBounds ) ) {
          protractorPositionProperty.value = protractorPositionProperty.value.plusXY( -10, 0 );
        }
      }
    } );
    protractorNode.addInputListener( protractorNodeListener );

    protractorPositionProperty.link( protractorPosition => {
      protractorNode.center = protractorPosition;
    } );

    this.afterLightLayer.addChild( protractorNode );
    this.afterLightLayer.addChild( this.prismLayer );

    FloatingLayout.floatRight( this, [
      environmentMediumControlPanel,
      laserControlPanel,
      resetAllButton,
      laserTypeRadioButtonGroup
    ] );
    FloatingLayout.floatBottom( this, [ prismToolboxNode, resetAllButton ] );
    FloatingLayout.floatTop( this, [ environmentMediumControlPanel ] );

    this.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {
      laserTypeRadioButtonGroup.top = environmentMediumControlPanel.bottom + 15;
      laserControlPanel.top = laserTypeRadioButtonGroup.bottom + 15;
    } );

    this.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {
      this.whiteLightNode && this.whiteLightNode.setCanvasBounds( visibleBounds );
      environmentMediumNodeForMonochromaticLight.setRect( visibleBounds.x, visibleBounds.y, visibleBounds.width, visibleBounds.height );
    } );

    this.resetPrismsView = () => {
      protractorPositionProperty.reset();
      protractorNode.reset();
    };

    // Add a thin gray line to separate the navigation bar when the environmentMediumNode is black
    const navigationBarSeparator = new Rectangle( 0, 0, 100, 100, { fill: '#999999', pickable: false } );
    this.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {
      const rectHeight = 2;
      navigationBarSeparator.setRect( visibleBounds.x, visibleBounds.y + visibleBounds.height - rectHeight, visibleBounds.width, rectHeight );
    } );
    prismsModel.laser.colorModeProperty.link( color => {
      navigationBarSeparator.visible = color === ColorModeEnum.WHITE;
      prismsModel.mediumColorFactory.lightTypeProperty.value = color;
    } );
    this.addChild( navigationBarSeparator );
  }

  public override reset(): void {
    this.prismLayer.removeAllChildren();
    this.resetPrismsView();
  }

  public override step(): void {
    super.step();
    this.updateWhiteLightNode();
  }

  private updateWhiteLightNode(): void {
    if ( this.prismsModel.laser.colorModeProperty.value === ColorModeEnum.WHITE && this.prismsModel.dirty ) {
      this.whiteLightNode && this.whiteLightNode.step();
      this.prismsModel.dirty = false;
    }
  }

  /**
   * Add the screen-specific light nodes
   * @param bendingLightModel - passed because this is called during construction (before this.model
   * is set in the subtype)
   */
  protected addLightNodes( bendingLightModel: PrismsModel ): void {

    const stageWidth = this.layoutBounds.width;
    const stageHeight = this.layoutBounds.height;

    this.whiteLightNode = new WhiteLightCanvasNode(
      this.modelViewTransform,
      stageWidth,
      stageHeight,
      bendingLightModel.rays,
      bendingLightModel.environmentMediumProperty,
      bendingLightModel.mediumColorFactory
    );
    this.whiteLightNode.setExcludeInvisible( true );

    // Since the light canvas is opaque, it must be placed behind the control panels.
    this.addChild( this.whiteLightNode );

    // switch between light render for white vs nonwhite light
    bendingLightModel.laser.colorModeProperty.link( color => {
      this.whiteLightNode && this.whiteLightNode.setVisible( color === ColorModeEnum.WHITE );
    } );
  }

  protected override addLaserHandles( showRotationDragHandlesProperty: Property<boolean>, showTranslationDragHandlesProperty: Property<boolean>,
                                      clockwiseArrowNotAtMax: ( n: number ) => boolean, ccwArrowNotAtMax: ( n: number ) => boolean, laserImageWidth: number ): void {
    const bendingLightModel = this.bendingLightModel;
    super.addLaserHandles(
      showRotationDragHandlesProperty,
      showTranslationDragHandlesProperty,
      clockwiseArrowNotAtMax,
      ccwArrowNotAtMax,
      laserImageWidth
    );

    // add translation indicators that show if/when the laser can be moved by dragging
    const arrowLength = 83;

    const horizontalTranslationDragHandle = new TranslationDragHandle(
      this.modelViewTransform,
      bendingLightModel.laser,
      arrowLength,
      0,
      showTranslationDragHandlesProperty,
      laserImageWidth
    );
    this.addChild( horizontalTranslationDragHandle );

    const verticalTranslationDragHandle = new TranslationDragHandle(
      this.modelViewTransform,
      bendingLightModel.laser,
      0,
      arrowLength,
      showTranslationDragHandlesProperty,
      laserImageWidth
    );
    this.addChild( verticalTranslationDragHandle );
  }
}

bendingLight.register( 'PrismsScreenView', PrismsScreenView );

export default PrismsScreenView;