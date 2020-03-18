// Copyright 2015-2020, University of Colorado Boulder

/**
 * View for the "more tools" screen, which adds more tools to the toolbox, and a few more controls for the laser.
 * This extends the IntroView since it shares many of the same features.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Shape from '../../../../kite/js/Shape.js';
import MovableDragHandler from '../../../../scenery-phet/js/input/MovableDragHandler.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import bendingLight from '../../bendingLight.js';
import ToolIconListener from '../../common/view/ToolIconListener.js';
import WavelengthControl from '../../common/view/WavelengthControl.js';
import IntroView from '../../intro/view/IntroView.js';
import LaserTypeAquaRadioButtonGroup from '../../intro/view/LaserTypeAquaRadioButtonGroup.js';
import VelocitySensorNode from './VelocitySensorNode.js';
import WaveSensorNode from './WaveSensorNode.js';

// constants
const arrowScale = 1.5E-14;

class MoreToolsView extends IntroView {

  /**
   * @param {MoreToolsModel} moreToolsModel - model of the more tools screen
   */
  constructor( moreToolsModel ) {

    super( moreToolsModel,
      true, // hasMoreTools
      3, // indexOfRefractionDecimals

      // createLaserControlPanel
      function( model ) {
        return new VBox( {
          spacing: 10,
          align: 'left',
          children: [
            new LaserTypeAquaRadioButtonGroup( model.laserViewProperty ),
            new WavelengthControl( model.wavelengthProperty, new Property( true ), 120 )
          ]
        } );
      }, {
        verticalPlayAreaOffset: 0,
        horizontalPlayAreaOffset: 0
      } );

    this.moreToolsModel = moreToolsModel; // @public (read-only)
    const self = this;

    // updates the visibility of speed controls
    Property.multilink( [ moreToolsModel.laserViewProperty, moreToolsModel.waveSensor.enabledProperty ],
      function( laserView, isWaveSensorEnabled ) {
        self.timeControlNode.visible = isWaveSensorEnabled || laserView === 'wave';
      } );
  }

  // TODO
  getWaveSensorIcon() {
    const modelViewTransform = this.modelViewTransform;
    const self = this;

    const waveSensor = this.bendingLightModel.waveSensor;
    const waveSensorIcon = new WaveSensorNode(
      this.modelViewTransform,
      waveSensor.copy(), {
        scale: 0.4
      }
    );
    waveSensorIcon.mouseArea = Shape.bounds( waveSensorIcon.localBounds );
    waveSensorIcon.touchArea = Shape.bounds( waveSensorIcon.localBounds );

    // @public (read-only)
    this.waveSensorNode = new WaveSensorNode(
      this.modelViewTransform,
      waveSensor
    );
    const waveSensorNode = this.waveSensorNode;
    waveSensor.enabledProperty.link( function( enabled ) {
      waveSensorIcon.visible = !enabled;
      waveSensorNode.visible = enabled;
    } );

    const dropInToolbox = this.dropInToolbox;

    const createMovableDragHandler = function( node, positionProperty, enabledProperty ) {
      return new MovableDragHandler( positionProperty, {
        modelViewTransform: modelViewTransform,
        endDrag: function() {
          self.bumpLeft( node, positionProperty );
          dropInToolbox( node, enabledProperty );
        }
      } );
    };

    const probe1Listener = createMovableDragHandler(
      waveSensorNode.probe1Node,
      waveSensor.probe1.positionProperty,
      waveSensor.enabledProperty
    );
    waveSensorNode.probe1Node.addInputListener( probe1Listener );

    const probe2Listener = createMovableDragHandler(
      waveSensorNode.probe2Node,
      waveSensor.probe2.positionProperty,
      waveSensor.enabledProperty
    );
    waveSensorNode.probe2Node.addInputListener( probe2Listener );

    const bodyListener = createMovableDragHandler(
      waveSensorNode.bodyNode,
      waveSensor.bodyPositionProperty,
      waveSensor.enabledProperty
    );
    waveSensorNode.bodyNode.addInputListener( bodyListener );

    waveSensorIcon.addInputListener( new ToolIconListener( [
        bodyListener,
        probe1Listener,
        probe2Listener
      ], function( event ) {

        // Show the probe in the play area and hide the icon
        waveSensor.enabledProperty.set( true );

        // Center the body label on the pointer
        const pt = waveSensorNode.bodyNode.globalToParentPoint( event.pointer.point )
          .plusXY( 0, -waveSensorNode.bodyNode.height / 2 + 5 );
        waveSensor.bodyPositionProperty.value = modelViewTransform.viewToModelPosition( pt );
        waveSensorNode.resetRelativePositions();
        waveSensorNode.syncModelFromView();
      } )
    );

    this.visibleBoundsProperty.link( function( visibleBounds ) {

      // The body node origin is at its top left, so translate the allowed drag area so that the center of the body
      // node will remain in bounds
      const modelBounds = self.modelViewTransform.viewToModelBounds( visibleBounds );
      probe1Listener.setDragBounds( modelBounds );
      probe2Listener.setDragBounds( modelBounds );
      bodyListener.setDragBounds( modelBounds );
    } );

    this.afterLightLayer2.addChild( this.waveSensorNode );
    return waveSensorIcon;
  }

  // TODO:
  getVelocitySensorIcon() {
    const self = this;
    const moreToolsModel = this.bendingLightModel;
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
    moreToolsModel.velocitySensor.enabledProperty.link( function( enabled ) {
      velocitySensorIconNode.visible = !enabled;
      velocitySensorNode.visible = enabled;
    } );

    const velocitySensorListener = new MovableDragHandler( moreToolsModel.velocitySensor.positionProperty, {
      modelViewTransform: this.modelViewTransform,
      endDrag: function() {
        self.bumpLeft( velocitySensorNode, self.moreToolsModel.velocitySensor.positionProperty );
        self.dropInToolbox(
          velocitySensorNode,
          self.moreToolsModel.velocitySensor.enabledProperty
        );
      }
    } );
    velocitySensorNode.addInputListener( velocitySensorListener );

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the MovableDragHander
    // for the node in the play area
    velocitySensorIconNode.addInputListener( new ToolIconListener( [ velocitySensorListener ], function( event ) {

      // Show the protractor in the play area and hide the icon
      self.moreToolsModel.velocitySensor.enabledProperty.value = true;

      // Center the protractor on the pointer
      const viewPosition = velocitySensorNode.globalToParentPoint( event.pointer.point );
      const velocitySensorModelPosition = self.modelViewTransform.viewToModelPosition( viewPosition );
      self.moreToolsModel.velocitySensor.positionProperty.set( velocitySensorModelPosition );
    } ) );

    this.visibleBoundsProperty.link( function( visibleBounds ) {

      // The body node origin is at its top left, so translate the allowed drag area so that the center of the body
      // node will remain in bounds
      const bounds = new Rectangle( visibleBounds.x - velocitySensorNode.bounds.width / 2, visibleBounds.y, visibleBounds.width, visibleBounds.height );
      velocitySensorListener.setDragBounds( self.modelViewTransform.viewToModelBounds( bounds ) );
    } );

    this.afterLightLayer2.addChild( velocitySensorNode );
    return velocitySensorIconNode;
  }

  getAdditionalToolIcons() {
    return [
      this.getVelocitySensorIcon(),
      this.getWaveSensorIcon()
    ];
  }

  /**
   * Update chart node and wave.
   * @protected
   */
  updateWaveShape() {
    super.updateWaveShape();
    if ( this.waveSensorNode.waveSensor.enabledProperty.get() ) {
      this.waveSensorNode.waveSensor.step();
      this.waveSensorNode.chartNode.step( this.moreToolsModel.time );
    }
  }
}

bendingLight.register( 'MoreToolsView', MoreToolsView );

export default MoreToolsView;