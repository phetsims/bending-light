// Copyright 2015, University of Colorado Boulder

/**
 * View for the "more tools" screen, which adds more tools to the toolbox, and a few more controls for the laser.
 * This extends the IntroView since it shares many of the same features.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  var VelocitySensorNode = require( 'BENDING_LIGHT/more-tools/view/VelocitySensorNode' );
  var WaveSensorNode = require( 'BENDING_LIGHT/more-tools/view/WaveSensorNode' );
  var Property = require( 'AXON/Property' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var LaserTypeAquaRadioButtonGroup = require( 'BENDING_LIGHT/intro/view/LaserTypeAquaRadioButtonGroup' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var WavelengthControl = require( 'BENDING_LIGHT/common/view/WavelengthControl' );
  var Rectangle = require( 'DOT/Rectangle' );
  var ToolIconListener = require( 'BENDING_LIGHT/common/view/ToolIconListener' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var arrowScale = 1.5E-14;

  /**
   * @param {MoreToolsModel} moreToolsModel - model of the more tools screen
   * @constructor
   */
  function MoreToolsView( moreToolsModel ) {

    this.moreToolsModel = moreToolsModel; // @public (read-only)
    var moreToolsView = this;

    IntroView.call( this, moreToolsModel, 0, true, 3, function( model ) {
      return new VBox( {
        spacing: 10,
        align: 'left',
        children: [
          new LaserTypeAquaRadioButtonGroup( model.laserViewProperty ),
          new WavelengthControl( model.wavelengthProperty, new Property( true ), 120 )
        ]
      } );
    } );

    // updates the visibility of speed controls
    Property.multilink( [ moreToolsModel.laserViewProperty, moreToolsModel.waveSensor.enabledProperty ],
      function( laserView, isWaveSensorEnabled ) {
        moreToolsView.timeControlNode.visible = isWaveSensorEnabled || laserView === 'wave';
      } );
  }

  return inherit( IntroView, MoreToolsView, {
    getWaveSensorIcon: function() {
      var modelViewTransform = this.modelViewTransform;
      var moreToolsView = this;

      var waveSensor = this.moreToolsModel.waveSensor;
      var waveSensorIcon = new WaveSensorNode(
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
      var waveSensorNode = this.waveSensorNode;
      waveSensor.enabledProperty.link( function( enabled ) {
        waveSensorIcon.visible = !enabled;
        moreToolsView.waveSensorNode.visible = enabled;
      } );

      var dropInToolbox = this.dropInToolbox;

      var createMovableDragHandler = function( node, positionProperty, enabledProperty ) {
        return new MovableDragHandler( positionProperty, {
          modelViewTransform: modelViewTransform,
          endDrag: function() {
            moreToolsView.bumpLeft( node, positionProperty );
            dropInToolbox( node, enabledProperty );
          }
        } );
      };

      var probe1Listener = createMovableDragHandler(
        waveSensorNode.probe1Node,
        waveSensor.probe1.positionProperty,
        moreToolsView.moreToolsModel.waveSensor.enabledProperty
      );
      waveSensorNode.probe1Node.addInputListener( probe1Listener );

      var probe2Listener = createMovableDragHandler(
        waveSensorNode.probe2Node,
        waveSensor.probe2.positionProperty,
        moreToolsView.moreToolsModel.waveSensor.enabledProperty
      );
      waveSensorNode.probe2Node.addInputListener( probe2Listener );

      var bodyListener = createMovableDragHandler(
        waveSensorNode.bodyNode,
        moreToolsView.moreToolsModel.waveSensor.bodyPositionProperty,
        moreToolsView.moreToolsModel.waveSensor.enabledProperty
      );
      waveSensorNode.bodyNode.addInputListener( bodyListener );

      waveSensorIcon.addInputListener( new ToolIconListener( [
        bodyListener,
        probe1Listener,
        probe2Listener
      ], function( event ) {

        // Show the probe in the play area and hide the icon
        moreToolsView.moreToolsModel.waveSensor.enabled = true;

        // Center the probe on the pointer
        var pt = moreToolsView.waveSensorNode.probe1Node.globalToParentPoint( event.pointer.point );
        moreToolsView.moreToolsModel.waveSensor.probe1.position = modelViewTransform.viewToModelPosition( pt );
        moreToolsView.waveSensorNode.resetRelativePositions();
        moreToolsView.waveSensorNode.syncModelFromView();
      } ) );

      this.events.on( 'layoutFinished', function( dx, dy, width, height ) {

        // The body node origin is at its top left, so translate the allowed drag area so that the center of the body
        // node will remain in bounds
        var viewBounds = new Rectangle( -dx, -dy, width, height );
        var modelBounds = moreToolsView.modelViewTransform.viewToModelBounds( viewBounds );
        probe1Listener.setDragBounds( modelBounds );
        probe2Listener.setDragBounds( modelBounds );
        bodyListener.setDragBounds( modelBounds );
      } );

      this.afterLightLayer2.addChild( this.waveSensorNode );
      return waveSensorIcon;
    },
    getVelocitySensorIcon: function() {
      var moreToolsView = this;
      var velocitySensorToolboxScale = 1.2;
      var velocitySensorIconNode = new VelocitySensorNode(
        this.modelViewTransform,
        this.moreToolsModel.velocitySensor.copy(),
        arrowScale, {
          scale: velocitySensorToolboxScale
        }
      );
      velocitySensorIconNode.mouseArea = Shape.bounds( velocitySensorIconNode.localBounds );
      velocitySensorIconNode.touchArea = Shape.bounds( velocitySensorIconNode.localBounds );

      var velocitySensorNode = new VelocitySensorNode(
        this.modelViewTransform,
        this.moreToolsModel.velocitySensor,
        arrowScale, {
          scale: 2
        }
      );
      moreToolsView.moreToolsModel.velocitySensor.enabledProperty.link( function( enabled ) {
        velocitySensorIconNode.visible = !enabled;
        velocitySensorNode.visible = enabled;
      } );

      var velocitySensorListener = new MovableDragHandler( this.moreToolsModel.velocitySensor.positionProperty, {
        modelViewTransform: this.modelViewTransform,
        endDrag: function() {
          moreToolsView.bumpLeft( velocitySensorNode, moreToolsView.moreToolsModel.velocitySensor.positionProperty );
          moreToolsView.dropInToolbox(
            velocitySensorNode,
            moreToolsView.moreToolsModel.velocitySensor.enabledProperty
          );
        }
      } );
      velocitySensorNode.addInputListener( velocitySensorListener );

      // Add an input listener to the toolbox icon for the protractor, which forwards events to the MovableDragHander
      // for the node in the play area
      velocitySensorIconNode.addInputListener( new ToolIconListener( [ velocitySensorListener ], function( event ) {

        // Show the protractor in the play area and hide the icon
        moreToolsView.moreToolsModel.velocitySensor.enabledProperty.value = true;

        // Center the protractor on the pointer
        var viewPosition = velocitySensorNode.globalToParentPoint( event.pointer.point );
        var velocitySensorModelPosition = moreToolsView.modelViewTransform.viewToModelPosition( viewPosition );
        moreToolsView.moreToolsModel.velocitySensor.position = velocitySensorModelPosition;
      } ) );

      this.events.on( 'layoutFinished', function( dx, dy, width, height ) {

        // The body node origin is at its top left, so translate the allowed drag area so that the center of the body
        // node will remain in bounds
        var bounds = new Rectangle( -dx - velocitySensorNode.bounds.width / 2, -dy, width, height );
        velocitySensorListener.setDragBounds( moreToolsView.modelViewTransform.viewToModelBounds( bounds ) );
      } );

      this.afterLightLayer2.addChild( velocitySensorNode );
      return velocitySensorIconNode;
    },
    getAdditionalToolIcons: function() {
      return [
        this.getVelocitySensorIcon(),
        this.getWaveSensorIcon()
      ];
    },
    /**
     * Update chart node and wave.
     * @protected
     */
    updateWaveShape: function() {
      IntroView.prototype.updateWaveShape.call( this );
      if ( this.waveSensorNode.waveSensor.enabled ) {
        this.waveSensorNode.waveSensor.step();
        this.waveSensorNode.chartNode.step( this.moreToolsModel.time );
      }
    },

    /**
     * @protected
     */
    reset: function() {
      IntroView.prototype.reset.call( this );
    }
  } );
} );