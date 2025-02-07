// Copyright 2015-2024, University of Colorado Boulder

/**
 * View for the "more tools" screen, which adds more tools to the toolbox, and a few more controls for the laser.
 * This extends the IntroScreenView since it shares many of the same features.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import bendingLight from '../../bendingLight.js';
import BendingLightModel from '../../common/model/BendingLightModel.js';
import LaserViewEnum from '../../common/model/LaserViewEnum.js';
import WavelengthControl from '../../common/view/WavelengthControl.js';
import IntroScreenView, { IntroScreenViewOptions } from '../../intro/view/IntroScreenView.js';
import LaserTypeAquaRadioButtonGroup from '../../intro/view/LaserTypeAquaRadioButtonGroup.js';
import MoreToolsModel from '../model/MoreToolsModel.js';
import VelocitySensorNode from './VelocitySensorNode.js';
import WaveSensorNode from './WaveSensorNode.js';

// constants
const arrowScale = 1.5E-14;

type MoreToolsScreenViewOptions = IntroScreenViewOptions;

export default class MoreToolsScreenView extends IntroScreenView {
  private readonly moreToolsModel: MoreToolsModel;

  // Only created after superclass template method is called
  private waveSensorNode!: WaveSensorNode;

  /**
   * @param moreToolsModel - model of the more tools screen
   * @param [providedOptions]
   */
  public constructor( moreToolsModel: MoreToolsModel, providedOptions?: MoreToolsScreenViewOptions ) {

    super( moreToolsModel,
      true, // hasMoreTools
      3, // indexOfRefractionDecimals

      // createLaserControlPanel
      ( model: BendingLightModel ) => new VBox( {
        spacing: 10,
        align: 'left',
        children: [
          new LaserTypeAquaRadioButtonGroup( model.laserViewProperty ),
          new WavelengthControl( model.wavelengthProperty, new Property<boolean>( true ), 120 )
        ]
      } ), combineOptions<MoreToolsScreenViewOptions>( {
        verticalPlayAreaOffset: 0,
        horizontalPlayAreaOffset: 0
      }, providedOptions ) );

    this.moreToolsModel = moreToolsModel;

    // updates the visibility of speed controls
    Multilink.multilink( [ moreToolsModel.laserViewProperty, moreToolsModel.waveSensor.enabledProperty ],
      ( laserView, isWaveSensorEnabled ) => {
        this.timeControlNode.visible = isWaveSensorEnabled || laserView === LaserViewEnum.WAVE;
      } );
  }

  private initWaveSensorAndGetIcon(): WaveSensorNode {
    const modelViewTransform = this.modelViewTransform;

    const waveSensor = ( this.bendingLightModel as MoreToolsModel ).waveSensor;
    const waveSensorIcon = new WaveSensorNode(
      this.modelViewTransform,
      waveSensor.copy(), {
        scale: 0.4
      }
    );
    waveSensorIcon.mouseArea = Shape.bounds( waveSensorIcon.localBounds );
    waveSensorIcon.touchArea = Shape.bounds( waveSensorIcon.localBounds );

    // Create and assign the real wave sensor node as well
    this.waveSensorNode = new WaveSensorNode(
      this.modelViewTransform,
      waveSensor
    );
    const waveSensorNode = this.waveSensorNode;
    waveSensor.enabledProperty.link( enabled => {
      waveSensorIcon.visible = !enabled;
      waveSensorNode.visible = enabled;
    } );

    const dropInToolbox = this.dropInToolbox;

    const draggingTogetherProperty = new BooleanProperty( true );

    const createDragListener = ( node: Node, positionProperty: Property<Vector2>, enabledProperty: Property<boolean> ) => {

      // Recover an occluded node if the window reshapes to cover it
      this.visibleBoundsProperty.lazyLink( () => {
        this.bumpLeft( node, positionProperty );
      } );

      return new DragListener( {
        useParentOffset: true,
        positionProperty: positionProperty,
        transform: modelViewTransform,
        // The body node origin is at its top left, so translate the allowed drag area so that the center of the body node
        // will remain in bounds
        dragBoundsProperty: new DerivedProperty( [ this.visibleBoundsProperty, draggingTogetherProperty ], visibleBounds => {
          return modelViewTransform.viewToModelBounds( visibleBounds.erodedX( draggingTogetherProperty.value ? 100 : 0 ) );
        } ),
        drag: () => {
          if ( draggingTogetherProperty.value ) {
            waveSensorNode.resetRelativePositions();
          }
        },
        end: () => {

          if ( draggingTogetherProperty.value ) {
            this.bumpLeft( waveSensorNode, positionProperty );
            waveSensorNode.resetRelativePositions();
          }
          else {
            this.bumpLeft( node, positionProperty );
          }

          draggingTogetherProperty.value = false;

          dropInToolbox( node, enabledProperty );
        }
      } );
    };

    const probe1Listener = createDragListener(
      waveSensorNode.probe1Node,
      waveSensor.probe1.positionProperty,
      waveSensor.enabledProperty
    );
    waveSensorNode.probe1Node.addInputListener( probe1Listener );

    const probe2Listener = createDragListener(
      waveSensorNode.probe2Node,
      waveSensor.probe2.positionProperty,
      waveSensor.enabledProperty
    );
    waveSensorNode.probe2Node.addInputListener( probe2Listener );

    const bodyListener = createDragListener(
      waveSensorNode.bodyNode,
      waveSensor.bodyPositionProperty,
      waveSensor.enabledProperty
    );
    waveSensorNode.bodyNode.addInputListener( bodyListener );

    // Keep each part in bounds when visibleBoundsProperty changes
    this.visibleBoundsProperty.lazyLink( visibleBounds => {
      waveSensor.probe1.positionProperty.value = modelViewTransform.viewToModelPosition( visibleBounds.closestPointTo( modelViewTransform.modelToViewPosition( waveSensor.probe1.positionProperty.value ) ) );
      waveSensor.probe2.positionProperty.value = modelViewTransform.viewToModelPosition( visibleBounds.closestPointTo( modelViewTransform.modelToViewPosition( waveSensor.probe2.positionProperty.value ) ) );
      waveSensor.bodyPositionProperty.value = modelViewTransform.viewToModelPosition( visibleBounds.closestPointTo( modelViewTransform.modelToViewPosition( waveSensor.bodyPositionProperty.value ) ) );
    } );

    waveSensorIcon.addInputListener( DragListener.createForwardingListener( event => {

      // Show the probe in the play area and hide the icon
      waveSensor.enabledProperty.set( true );

      // Center the body label on the pointer
      const pt = waveSensorNode.bodyNode.globalToParentPoint( event.pointer.point )
        .plusXY( 0, -waveSensorNode.bodyNode.height / 2 + 5 );
      waveSensor.bodyPositionProperty.value = modelViewTransform.viewToModelPosition( pt );
      waveSensorNode.resetRelativePositions();
      waveSensorNode.syncModelFromView();

      draggingTogetherProperty.value = true;
      waveSensorNode.resetRelativePositions();
      bodyListener.press( event, waveSensorNode.bodyNode );
      waveSensorNode.resetRelativePositions();
    } ) );

    this.afterLightLayer2.addChild( this.waveSensorNode );
    return waveSensorIcon;
  }

  private getVelocitySensorIcon(): VelocitySensorNode {
    const moreToolsModel = this.bendingLightModel as MoreToolsModel;
    const velocitySensorToolboxScale = 1.2;
    const velocitySensorIconNode = new VelocitySensorNode(
      this.modelViewTransform,
      moreToolsModel.velocitySensor.copy(),
      arrowScale, {
        scale: velocitySensorToolboxScale
      }
    );
    velocitySensorIconNode.mouseArea = Shape.bounds( velocitySensorIconNode.localBounds );
    velocitySensorIconNode.touchArea = Shape.bounds( velocitySensorIconNode.localBounds );

    const velocitySensorNode = new VelocitySensorNode(
      this.modelViewTransform,
      moreToolsModel.velocitySensor,
      arrowScale, {
        scale: 2
      }
    );
    moreToolsModel.velocitySensor.enabledProperty.link( enabled => {
      velocitySensorIconNode.visible = !enabled;
      velocitySensorNode.visible = enabled;
    } );

    const velocitySensorListener = new DragListener( {
      useParentOffset: true,
      positionProperty: moreToolsModel.velocitySensor.positionProperty,
      transform: this.modelViewTransform,
      // The body node origin is at its top left, so translate the allowed drag area so that the center of the body node
      // will remain in bounds
      dragBoundsProperty: new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => {
        return this.modelViewTransform.viewToModelBounds( new Rectangle(
          visibleBounds.left - velocitySensorNode.bounds.width / 2,
          visibleBounds.top,
          visibleBounds.width,
          visibleBounds.height
        ) );
      } ),
      end: () => {
        this.bumpLeft( velocitySensorNode, moreToolsModel.velocitySensor.positionProperty );
        this.dropInToolbox(
          velocitySensorNode,
          this.moreToolsModel.velocitySensor.enabledProperty
        );
      }
    } );
    velocitySensorNode.addInputListener( velocitySensorListener );
    const modelViewTransform = this.modelViewTransform;

    // Recover an occluded node if the window reshapes to cover it
    this.visibleBoundsProperty.lazyLink( () => {
      this.bumpLeft( velocitySensorNode, moreToolsModel.velocitySensor.positionProperty );
    } );

    // Ensure the IntensityMeterNode remains within bounds when visibleBoundsProperty changes
    this.visibleBoundsProperty.lazyLink( visibleBounds => {

      visibleBounds = new Rectangle(
        visibleBounds.left - velocitySensorNode.bounds.width / 2,
        visibleBounds.top,
        visibleBounds.width,
        visibleBounds.height
      );

      // Keep the IntensityMeterNode probe in bounds
      const sensorViewPosition = modelViewTransform.modelToViewPosition( moreToolsModel.velocitySensor.positionProperty.value );
      moreToolsModel.velocitySensor.positionProperty.value = modelViewTransform.viewToModelPosition( visibleBounds.closestPointTo( sensorViewPosition ) );
    } );

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the DragListener
    // for the node in the play area
    velocitySensorIconNode.addInputListener( DragListener.createForwardingListener( event => {

      // Show the protractor in the play area and hide the icon
      this.moreToolsModel.velocitySensor.enabledProperty.value = true;

      // Center the protractor on the pointer
      const viewPosition = velocitySensorNode.globalToParentPoint( event.pointer.point );
      const velocitySensorModelPosition = this.modelViewTransform.viewToModelPosition( viewPosition );
      this.moreToolsModel.velocitySensor.positionProperty.set( velocitySensorModelPosition );
      velocitySensorListener.press( event, velocitySensorNode );
    } ) );

    this.afterLightLayer2.addChild( velocitySensorNode );
    return velocitySensorIconNode;
  }

  protected override getAdditionalToolIcons(): ( WaveSensorNode | VelocitySensorNode )[] {
    return [
      this.getVelocitySensorIcon(),
      this.initWaveSensorAndGetIcon()
    ];
  }

  /**
   * Update chart node and wave.
   */
  protected override updateWaveShape(): void {
    super.updateWaveShape();
    if ( this.waveSensorNode && this.waveSensorNode.waveSensor.enabledProperty.get() ) {
      this.waveSensorNode.waveSensor.step();
      this.waveSensorNode.chartNode.step( this.moreToolsModel.time );
    }
  }
}

bendingLight.register( 'MoreToolsScreenView', MoreToolsScreenView );