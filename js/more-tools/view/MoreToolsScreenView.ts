// Copyright 2015-2022, University of Colorado Boulder

/**
 * View for the "more tools" screen, which adds more tools to the toolbox, and a few more controls for the laser.
 * This extends the IntroScreenView since it shares many of the same features.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import { DragListener, Node, VBox } from '../../../../scenery/js/imports.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import bendingLight from '../../bendingLight.js';
import WavelengthControl from '../../common/view/WavelengthControl.js';
import IntroScreenView, { IntroScreenViewOptions } from '../../intro/view/IntroScreenView.js';
import LaserTypeAquaRadioButtonGroup from '../../intro/view/LaserTypeAquaRadioButtonGroup.js';
import MoreToolsModel from '../model/MoreToolsModel.js';
import VelocitySensorNode from './VelocitySensorNode.js';
import WaveSensorNode from './WaveSensorNode.js';
import LaserViewEnum from '../../common/model/LaserViewEnum.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import BendingLightModel from '../../common/model/BendingLightModel.js';
import Multilink from '../../../../axon/js/Multilink.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

// constants
const arrowScale = 1.5E-14;

type MoreToolsScreenViewOptions = IntroScreenViewOptions;

class MoreToolsScreenView extends IntroScreenView {
  private moreToolsModel: MoreToolsModel;
  private waveSensorNode: WaveSensorNode | null;

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
      } ), merge( {
        verticalPlayAreaOffset: 0,
        horizontalPlayAreaOffset: 0
      }, providedOptions ) );

    this.waveSensorNode = null;
    this.moreToolsModel = moreToolsModel; // (read-only)

    // updates the visibility of speed controls
    Multilink.multilink( [ moreToolsModel.laserViewProperty, moreToolsModel.waveSensor.enabledProperty ],
      ( laserView, isWaveSensorEnabled ) => {
        this.timeControlNode.visible = isWaveSensorEnabled || laserView === LaserViewEnum.WAVE;
      } );
  }

  private getWaveSensorIcon(): WaveSensorNode {
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

    // (read-only)
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
          draggingTogetherProperty.value = false;
          this.bumpLeft( node, positionProperty );
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
      bodyListener.press( event );
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
        this.bumpLeft( velocitySensorNode, this.moreToolsModel.velocitySensor.positionProperty );
        this.dropInToolbox(
          velocitySensorNode,
          this.moreToolsModel.velocitySensor.enabledProperty
        );
      }
    } );
    velocitySensorNode.addInputListener( velocitySensorListener );

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the DragListener
    // for the node in the play area
    velocitySensorIconNode.addInputListener( DragListener.createForwardingListener( event => {

      // Show the protractor in the play area and hide the icon
      this.moreToolsModel.velocitySensor.enabledProperty.value = true;

      // Center the protractor on the pointer
      const viewPosition = velocitySensorNode.globalToParentPoint( event.pointer.point );
      const velocitySensorModelPosition = this.modelViewTransform.viewToModelPosition( viewPosition );
      this.moreToolsModel.velocitySensor.positionProperty.set( velocitySensorModelPosition );
      velocitySensorListener.press( event );
    } ) );

    this.afterLightLayer2.addChild( velocitySensorNode );
    return velocitySensorIconNode;
  }

  protected override getAdditionalToolIcons(): ( WaveSensorNode | VelocitySensorNode )[] {
    return [
      this.getVelocitySensorIcon(),
      this.getWaveSensorIcon()
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

export default MoreToolsScreenView;