// Copyright 2015-2025, University of Colorado Boulder

/**
 * View for intro screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ProtractorNode from '../../../../scenery-phet/js/ProtractorNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import bendingLight from '../../bendingLight.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import BendingLightModel from '../../common/model/BendingLightModel.js';
import LaserViewEnum from '../../common/model/LaserViewEnum.js';
import BendingLightScreenView, { BendingLightScreenViewOptions } from '../../common/view/BendingLightScreenView.js';
import FloatingLayout from '../../common/view/FloatingLayout.js';
import IntensityMeterNode from '../../common/view/IntensityMeterNode.js';
import MediumControlPanel from '../../common/view/MediumControlPanel.js';
import MediumNode from '../../common/view/MediumNode.js';
import IntroModel from '../model/IntroModel.js';
import AngleIcon from './AngleIcon.js';
import AngleNode from './AngleNode.js';
import NormalLine from './NormalLine.js';
import WaveCanvasNode from './WaveCanvasNode.js';
import WaveWebGLNode from './WaveWebGLNode.js';

const anglesStringProperty = BendingLightStrings.anglesStringProperty;
const materialStringProperty = BendingLightStrings.materialStringProperty;
const normalLineStringProperty = BendingLightStrings.normalLineStringProperty;

// constants
const INSET = 10;

type SelfOptions = EmptySelfOptions;
type ParentOptions = BendingLightScreenViewOptions;
type IntroScreenViewOptions = SelfOptions & ParentOptions;

export default class IntroScreenView extends BendingLightScreenView {
  private readonly introModel: IntroModel;
  private readonly stepEmitter: TEmitter;
  private readonly topMediumControlPanel: MediumControlPanel;
  private readonly bottomMediumControlPanel: MediumControlPanel;
  protected readonly dropInToolbox: ( node: Node, enabledProperty: Property<boolean> ) => void;
  protected readonly bumpLeft: ( node: Node, positionProperty: Property<Vector2> ) => void;
  private readonly toolbox: Panel;
  protected readonly timeControlNode: TimeControlNode;

  /**
   * @param introModel - model of intro screen
   * @param hasMoreTools - whether contain more tools
   * @param indexOfRefractionDecimals - decimalPlaces to show for index of refraction
   * @param createLaserControlPanel
   * @param [providedOptions]
   */
  public constructor( introModel: IntroModel, hasMoreTools: boolean, indexOfRefractionDecimals: number,
                      createLaserControlPanel: ( model: BendingLightModel ) => Node, providedOptions?: IntroScreenViewOptions ) {

    const options = optionize<IntroScreenViewOptions, SelfOptions, ParentOptions>()( {

      // in the Intro screen, it is shifted 102 to the left since there is extra room above the protractor toolbox
      // for the laser to traverse to.
      horizontalPlayAreaOffset: 102,

      /**
       * Specify how the drag angle should be clamped, in this case the laser must remain in the top left quadrant
       */
      clampDragAngle: ( angle: number ) => {
        while ( angle < 0 ) { angle += Math.PI * 2; }
        return Utils.clamp( angle, Math.PI / 2, Math.PI );
      },
      /**
       * Indicate if the laser is not at its max angle, and therefore can be dragged to larger angles
       */
      clockwiseArrowNotAtMax: ( laserAngle: number ) => {
        if ( introModel.laserViewProperty.value === LaserViewEnum.RAY ) {
          return laserAngle < Math.PI;
        }
        else {
          return laserAngle < BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
        }
      },
      /**
       * indicate if the laser is not at its min angle, and can therefore be dragged to smaller angles.
       */
      ccwArrowNotAtMax: ( laserAngle: number ) => laserAngle > Math.PI / 2
    }, providedOptions );

    super(
      introModel,

      // laserHasKnob
      false,
      options
    );

    this.introModel = introModel;

    const stageWidth = this.layoutBounds.width;
    const stageHeight = this.layoutBounds.height;

    // add MediumNodes for top and bottom
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.topMediumProperty ) );
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.bottomMediumProperty ) );

    this.stepEmitter = new Emitter<[]>();

    // add control panels for setting the index of refraction for each medium
    const topMediumControlPanel = new MediumControlPanel( this, introModel.mediumColorFactory,
      introModel.topMediumProperty, materialStringProperty, true, introModel.wavelengthProperty, indexOfRefractionDecimals, {
        yMargin: 7
      } );
    const topMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    topMediumControlPanel.setTranslation(
      stageWidth - topMediumControlPanel.getWidth() - 2 * INSET - topMediumControlPanelXOffset,
      this.modelViewTransform.modelToViewY( 0 ) - 2 * INSET - topMediumControlPanel.getHeight() + 4 );

    this.topMediumControlPanel = topMediumControlPanel;

    this.afterLightLayer3.addChild( topMediumControlPanel );

    // add control panels for setting the index of refraction for each medium
    const bottomMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    const bottomMediumControlPanel = new MediumControlPanel( this, introModel.mediumColorFactory,
      introModel.bottomMediumProperty, materialStringProperty, true, introModel.wavelengthProperty, indexOfRefractionDecimals, {
        yMargin: 7
      } );
    bottomMediumControlPanel.setTranslation(
      stageWidth - topMediumControlPanel.getWidth() - 2 * INSET - bottomMediumControlPanelXOffset,
      this.modelViewTransform.modelToViewY( 0 ) + 2 * INSET + 1 );

    this.bottomMediumControlPanel = bottomMediumControlPanel;
    this.afterLightLayer3.addChild( bottomMediumControlPanel );

    // add a line that will show the border between the mediums even when both n's are the same... Just a thin line will
    // be fine.
    this.beforeLightLayer.addChild( new Path( this.modelViewTransform.modelToViewShape( new Shape()
      .moveTo( -1, 0 )
      .lineTo( 1, 0 ) ), {
      stroke: 'gray',
      pickable: false
    } ) );

    // show the normal line where the laser strikes the interface between mediums
    const normalLineHeight = stageHeight / 2;
    const normalLine = new NormalLine( normalLineHeight, [ 7, 6 ], {
      x: this.modelViewTransform.modelToViewX( 0 ),
      y: this.modelViewTransform.modelToViewY( 0 ) - normalLineHeight / 2
    } );
    this.afterLightLayer2.addChild( normalLine );

    // Add the angle node
    this.afterLightLayer2.addChild( new AngleNode(
      this.introModel.showAnglesProperty,
      this.introModel.laser.onProperty,
      this.introModel.showNormalProperty,
      this.introModel.rays,
      this.modelViewTransform,

      // Method to add a step listener
      ( stepCallback: () => void ) => this.stepEmitter.addListener( stepCallback )
    ) );

    introModel.showNormalProperty.linkAttribute( normalLine, 'visible' );

    Multilink.multilink( [
      introModel.laserViewProperty,
      introModel.laser.onProperty,
      introModel.intensityMeter.sensorPositionProperty,
      introModel.topMediumProperty,
      introModel.bottomMediumProperty,
      introModel.laser.emissionPointProperty,
      introModel.laser.colorProperty
    ], () => {
      for ( let k = 0; k < this.incidentWaveLayer.getChildrenCount(); k++ ) {

        const child = this.incidentWaveLayer.children[ k ];
        affirm( child instanceof WaveWebGLNode || child instanceof WaveCanvasNode, 'unexpected node type' );
        child.step();
      }
      this.incidentWaveLayer.setVisible( introModel.laser.onProperty.value && introModel.laserViewProperty.value === LaserViewEnum.WAVE );
    } );

    // add laser view panel
    const laserViewXOffset = hasMoreTools ? 13 : 12;
    const laserViewYOffset = hasMoreTools ? 2 * INSET - 4 : 2 * INSET;

    const laserControlPanel = new Panel( createLaserControlPanel( introModel ), {
      cornerRadius: 5,
      xMargin: 9,
      yMargin: 6,
      fill: '#EEEEEE',
      stroke: '#696969',
      lineWidth: 1.5,
      left: this.layoutBounds.minX + laserViewXOffset,
      top: this.layoutBounds.top + laserViewYOffset
    } );
    this.laserViewLayer.addChild( laserControlPanel );

    // text for checkboxes
    const textOptions = { fontSize: 12, maxWidth: 80 };
    const normalText = new Text( normalLineStringProperty, textOptions );
    const angleText = new Text( anglesStringProperty, textOptions );

    // add normal checkbox
    const normalIcon = new NormalLine( 17, [ 4, 3 ] );
    const normalCheckbox = new Checkbox( introModel.showNormalProperty, new HBox( {
      children: [
        normalText, normalIcon
      ], spacing: 12
    } ), {
      boxWidth: 15,
      spacing: 5
    } );

    // add angle checkbox
    const angleIcon = new AngleIcon();
    const angleCheckbox = new Checkbox( introModel.showAnglesProperty, new HBox( {
      children: [
        angleText, angleIcon
      ], spacing: 12
    } ), {
      boxWidth: 15,
      spacing: 5
    } );

    const checkboxPanelChildren = hasMoreTools ? [ normalCheckbox, angleCheckbox ] : [ normalCheckbox ];
    const checkboxPanel = new VBox( {
      children: checkboxPanelChildren,
      spacing: 6,
      align: 'left',
      bottom: this.layoutBounds.maxY - 10
    } );
    this.beforeLightLayer2.addChild( checkboxPanel );

    // create the protractor node
    const protractorNodeIcon = ProtractorNode.createIcon( {
      scale: 0.24,
      cursor: 'pointer'
    } );
    protractorNodeIcon.mouseArea = Shape.bounds( protractorNodeIcon.localBounds );
    protractorNodeIcon.touchArea = Shape.bounds( protractorNodeIcon.localBounds );
    this.showProtractorProperty.link( showProtractor => {
      protractorNodeIcon.visible = !showProtractor;
    } );

    const protractorNode = new ProtractorNode( {
      visibleProperty: this.showProtractorProperty,
      scale: 0.8
    } );
    const protractorPosition = new Vector2( protractorNode.centerX, protractorNode.centerY );
    const protractorPositionProperty = new Property( protractorPosition );

    // When a node is released, check if it is over the toolbox.  If so, drop it in.
    const dropInToolbox = ( node: Node, enabledProperty: Property<boolean> ) => {
      if ( node.getGlobalBounds().intersectsBounds( this.toolbox.getGlobalBounds() ) ) {
        enabledProperty.value = false;
      }
    };
    this.dropInToolbox = dropInToolbox;
    const protractorNodeListener = new DragListener( {
      useParentOffset: true,
      dragBoundsProperty: this.visibleBoundsProperty,
      positionProperty: protractorPositionProperty,
      end: () => dropInToolbox( protractorNode, this.showProtractorProperty )
    } );

    // Keep the protractor in bounds if the window is resized
    this.visibleBoundsProperty.lazyLink( visibleBounds => {
      protractorPositionProperty.value = visibleBounds.closestPointTo( protractorPositionProperty.value );
    } );

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the DragListener
    // for the node in the play area
    protractorNodeIcon.addInputListener( DragListener.createForwardingListener( event => {

      // Show the protractor in the play area and hide the icon
      this.showProtractorProperty.value = true;

      // Center the protractor on the pointer
      protractorPositionProperty.value = protractorNode.globalToParentPoint( event.pointer.point );

      protractorNodeListener.press( event, protractorNode );
    } ) );

    this.showProtractorProperty.linkAttribute( protractorNode, 'visible' );

    const modelViewTransform = this.modelViewTransform;

    // Compute a single exact shift to ensure the node no longer intersects with the panels.
    const bumpLeft = ( node: Node, positionProperty: Property<Vector2> ) => {
      const nodeBounds = node.getGlobalBounds();

      // Check intersection with top panel
      if ( nodeBounds.intersectsBounds( topMediumControlPanel.getGlobalBounds() ) ) {
        const tooFarToTheRight = nodeBounds.maxX - topMediumControlPanel.getGlobalBounds().minX;

        const testPoint1 = node.globalToParentPoint( new Vector2( 0, 0 ) );
        const testPoint2 = node.globalToParentPoint( new Vector2( tooFarToTheRight, 0 ) );
        const modelShift = modelViewTransform.viewToModelDeltaX( testPoint2.x - testPoint1.x + 20 );
        positionProperty.value = positionProperty.value.plusXY( -modelShift, 0 );
      }

      // Check intersection with top panel
      else if ( nodeBounds.intersectsBounds( bottomMediumControlPanel.getGlobalBounds() ) ) {
        const tooFarToTheRight = nodeBounds.maxX - bottomMediumControlPanel.getGlobalBounds().minX;

        const testPoint1 = node.globalToParentPoint( new Vector2( 0, 0 ) );
        const testPoint2 = node.globalToParentPoint( new Vector2( tooFarToTheRight, 0 ) );
        const modelShift = modelViewTransform.viewToModelDeltaX( testPoint2.x - testPoint1.x + 20 );
        positionProperty.value = positionProperty.value.plusXY( -modelShift, 0 );
      }
    };

    protractorPositionProperty.link( protractorPosition => {
      protractorNode.center = protractorPosition;
    } );

    protractorNode.addInputListener( protractorNodeListener );

    // add intensity meter
    const intensityMeterNodeIcon = new IntensityMeterNode( this.modelViewTransform, introModel.intensityMeter.copy(), {
      scale: 0.45,
      cursor: 'pointer'
    } );
    intensityMeterNodeIcon.mouseArea = Shape.bounds( intensityMeterNodeIcon.localBounds );
    intensityMeterNodeIcon.touchArea = Shape.bounds( intensityMeterNodeIcon.localBounds );

    const intensityMeterNode = new IntensityMeterNode( this.modelViewTransform, introModel.intensityMeter );
    introModel.intensityMeter.enabledProperty.link( enabled => {
      intensityMeterNode.visible = enabled;
      intensityMeterNodeIcon.visible = !enabled;
    } );
    const probeListener = new DragListener( {
      positionProperty: introModel.intensityMeter.sensorPositionProperty,
      transform: modelViewTransform,
      dragBoundsProperty: new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => {
        return modelViewTransform.viewToModelBounds( visibleBounds );
      } ),
      end: () => {
        bumpLeft( intensityMeterNode.probeNode, introModel.intensityMeter.sensorPositionProperty );
        dropInToolbox( intensityMeterNode.probeNode, introModel.intensityMeter.enabledProperty );
      }
    } );
    intensityMeterNode.probeNode.addInputListener( probeListener );

    // When the window reshapes, bump an occluded sensor probe or body. Assume that the window does not reshape
    // while they are being dragged together.
    this.visibleBoundsProperty.link( () => {
      bumpLeft( intensityMeterNode.probeNode, introModel.intensityMeter.sensorPositionProperty );
      bumpLeft( intensityMeterNode.bodyNode, introModel.intensityMeter.bodyPositionProperty );
    } );

    let draggingTogether = true;
    const bodyListener = new DragListener( {
      useParentOffset: true,
      positionProperty: introModel.intensityMeter.bodyPositionProperty,
      transform: modelViewTransform,

      // The body node origin is at its top left, so translate the allowed drag area so that the center of the body node
      // will remain in bounds
      dragBoundsProperty: new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => {
        return modelViewTransform.viewToModelBounds( new Rectangle(
          visibleBounds.left - intensityMeterNode.bodyNode.bounds.width / 2,
          visibleBounds.top - intensityMeterNode.bodyNode.bounds.height / 2,
          visibleBounds.width - intensityMeterNode.bodyNode.width,
          visibleBounds.height
        ) );
      } ),
      drag: () => {
        if ( draggingTogether ) {
          intensityMeterNode.resetRelativePositions();
        }
      },

      end: () => {
        if ( draggingTogether ) {
          bumpLeft( intensityMeterNode, introModel.intensityMeter.bodyPositionProperty );
          intensityMeterNode.resetRelativePositions();
        }
        else {
          bumpLeft( intensityMeterNode.bodyNode, introModel.intensityMeter.bodyPositionProperty );
        }
        draggingTogether = false;

        dropInToolbox( intensityMeterNode.bodyNode, introModel.intensityMeter.enabledProperty );
      }
    } );
    intensityMeterNode.bodyNode.addInputListener( bodyListener );

    // Ensure the IntensityMeterNode remains within bounds when visibleBoundsProperty changes
    this.visibleBoundsProperty.lazyLink( visibleBounds => {

      // Keep the IntensityMeterNode probe in bounds
      const sensorViewPosition = modelViewTransform.modelToViewPosition( introModel.intensityMeter.sensorPositionProperty.value );
      introModel.intensityMeter.sensorPositionProperty.value = modelViewTransform.viewToModelPosition( visibleBounds.closestPointTo( sensorViewPosition ) );

      // Keep the IntensityMeterNode body in bounds
      const bodyViewPosition = modelViewTransform.modelToViewPosition( introModel.intensityMeter.bodyPositionProperty.value );
      introModel.intensityMeter.bodyPositionProperty.value = modelViewTransform.viewToModelPosition( visibleBounds.closestPointTo( bodyViewPosition ) );
    } );

    // Add an input listener to the toolbox icon, which forwards events to the DragListener
    // for the node in the play area
    intensityMeterNodeIcon.addInputListener( DragListener.createForwardingListener( event => {

      // Show the probe in the play area and hide the icon
      introModel.intensityMeter.enabledProperty.value = true;

      // Center the center-bottom of the body on the pointer
      const bodyViewPosition = intensityMeterNode.bodyNode.globalToParentPoint( event.pointer.point )
        .plusXY( -intensityMeterNode.bodyNode.width / 2, -intensityMeterNode.bodyNode.height + 5 );
      introModel.intensityMeter.bodyPositionProperty.value = modelViewTransform.viewToModelPosition( bodyViewPosition );
      intensityMeterNode.resetRelativePositions();
      intensityMeterNode.syncModelFromView();

      draggingTogether = true;

      bodyListener.press( event, intensityMeterNode.bodyNode );
    } ) );

    // for subexport default class usage in MoreToolsScreenView
    this.bumpLeft = bumpLeft;

    let toolboxNodes = [
      protractorNodeIcon,
      intensityMeterNodeIcon
    ];

    toolboxNodes = toolboxNodes.concat( this.getAdditionalToolIcons() );
    this.toolbox = new Panel( new VBox( {
      spacing: 10,
      children: toolboxNodes,
      excludeInvisibleChildrenFromBounds: false
    } ), {
      xMargin: 10,
      yMargin: 10,
      stroke: '#696969',
      lineWidth: 1.5, fill: '#EEEEEE',
      bottom: checkboxPanel.top - 15
    } );
    this.beforeLightLayer2.addChild( this.toolbox );
    this.beforeLightLayer2.addChild( protractorNode );
    this.beforeLightLayer2.addChild( intensityMeterNode );

    // add reset all button
    const resetAllButton = new ResetAllButton( {
      listener: () => this.reset(),
      bottom: this.layoutBounds.bottom - 14,
      right: this.layoutBounds.right - 2 * INSET,
      radius: 19
    } );

    this.afterLightLayer2.addChild( resetAllButton );

    // add sim speed controls
    this.timeControlNode = new TimeControlNode( introModel.isPlayingProperty, {
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => {
            introModel.updateSimulationTimeAndWaveShape( TimeSpeed.NORMAL );
            this.updateWaveShape();
          }
        }
      },
      speedRadioButtonGroupPlacement: 'left',
      timeSpeedProperty: introModel.speedProperty,
      x: normalLine.centerX,
      bottom: this.layoutBounds.maxY - 10,
      speedRadioButtonGroupOptions: {
        labelOptions: {
          maxWidth: 80
        }
      },
      flowBoxSpacing: 10
    } );
    this.beforeLightLayer.addChild( this.timeControlNode );

    if ( !hasMoreTools ) {

      // show play pause and step buttons only in wave view
      introModel.laserViewProperty.link( laserType => this.timeControlNode.setVisible( laserType === LaserViewEnum.WAVE ) );
    }

    FloatingLayout.floatRight( this, [ topMediumControlPanel, bottomMediumControlPanel, resetAllButton ] );
    FloatingLayout.floatLeft( this, [ laserControlPanel, this.toolbox ] );

    // Indent the checkboxes a bit so it looks more natural
    FloatingLayout.floatLeft( this, [ checkboxPanel ], 10 );

    FloatingLayout.floatTop( this, [ laserControlPanel ] );
    FloatingLayout.floatBottom( this, [ checkboxPanel, resetAllButton, this.timeControlNode ] );

    this.visibleBoundsProperty.link( () => {
      this.toolbox.bottom = checkboxPanel.top - 10;
    } );
  }

  /**
   * restore initial conditions
   */
  protected override reset(): void {
    super.reset();
    this.introModel.reset();
    this.topMediumControlPanel.reset();
    this.bottomMediumControlPanel.reset();
  }

  /**
   * Allow subclasses to provide more tools
   */
  protected getAdditionalToolIcons(): Node[] {
    return [];
  }

  /**
   * Called by the animation loop.
   */
  public override step(): void {
    this.stepEmitter.emit();
    super.step();
    if ( this.introModel.isPlayingProperty.value ) {
      this.updateWaveShape();
    }
  }

  /**
   * Update wave shape.
   */
  protected updateWaveShape(): void {
    if ( this.introModel.laserViewProperty.value === LaserViewEnum.WAVE ) {
      for ( let k = 0; k < this.incidentWaveLayer.getChildrenCount(); k++ ) {

        const child = this.incidentWaveLayer.children[ k ];
        affirm( child instanceof WaveWebGLNode || child instanceof WaveCanvasNode, 'unexpected node type' );
        child.step();
      }
    }
  }

  /**
   * Add light representations which are specific to this view.  In this case it is the wave representation.
   */
  protected override addLightNodes( bendingLightModel: BendingLightModel ): void {

    this.addChild( this.incidentWaveLayer );

    // if WebGL is supported add WaveWebGLNode otherwise wave is rendered with the canvas.
    if ( bendingLightModel.allowWebGL ) {
      const waveWebGLNode = new WaveWebGLNode( this.modelViewTransform, bendingLightModel.rays );
      this.incidentWaveLayer.addChild( waveWebGLNode );
    }
    else {
      const waveCanvasNode = new WaveCanvasNode( this.bendingLightModel.rays, this.modelViewTransform, {
        canvasBounds: new Bounds2( 0, 0, 1000, 1000 )
      } );
      this.incidentWaveLayer.addChild( waveCanvasNode );
      this.visibleBoundsProperty.link( visibleBounds => {
        waveCanvasNode.setCanvasBounds( visibleBounds );
      } );
    }
  }
}

bendingLight.register( 'IntroScreenView', IntroScreenView );

export type { IntroScreenViewOptions };