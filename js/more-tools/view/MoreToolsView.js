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
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
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
    var self = this;

    IntroView.call( this, moreToolsModel,
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

    // updates the visibility of speed controls
    Property.multilink( [ moreToolsModel.laserViewProperty, moreToolsModel.waveSensor.enabledProperty ],
      function( laserView, isWaveSensorEnabled ) {
        self.timeControlNode.visible = isWaveSensorEnabled || laserView === 'wave';
      } );
  }

  bendingLight.register( 'MoreToolsView', MoreToolsView );
  
  return inherit( IntroView, MoreToolsView, {
    getWaveSensorIcon: function() {
      var modelViewTransform = this.modelViewTransform;
      var self = this;

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
        waveSensorNode.visible = enabled;
      } );

      var dropInToolbox = this.dropInToolbox;

      var createMovableDragHandler = function( node, positionProperty, enabledProperty ) {
        return new MovableDragHandler( positionProperty, {
          modelViewTransform: modelViewTransform,
          endDrag: function() {
            self.bumpLeft( node, positionProperty );
            dropInToolbox( node, enabledProperty );
          }
        } );
      };

      var probe1Listener = createMovableDragHandler(
        waveSensorNode.probe1Node,
        waveSensor.probe1.positionProperty,
        waveSensor.enabledProperty
      );
      waveSensorNode.probe1Node.addInputListener( probe1Listener );

      var probe2Listener = createMovableDragHandler(
        waveSensorNode.probe2Node,
        waveSensor.probe2.positionProperty,
        waveSensor.enabledProperty
      );
      waveSensorNode.probe2Node.addInputListener( probe2Listener );

      var bodyListener = createMovableDragHandler(
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
        waveSensor.enabled = true;

          // Center the body label on the pointer
        var pt = waveSensorNode.bodyNode.globalToParentPoint( event.pointer.point )
          .plusXY( 0, -waveSensorNode.bodyNode.height / 2 + 5 );
        waveSensor.bodyPosition = modelViewTransform.viewToModelPosition( pt );
        waveSensorNode.resetRelativePositions();
        waveSensorNode.syncModelFromView();
        } )
      );

      this.visibleBoundsProperty.link( function( visibleBounds ) {

        // The body node origin is at its top left, so translate the allowed drag area so that the center of the body
        // node will remain in bounds
        var modelBounds = self.modelViewTransform.viewToModelBounds( visibleBounds );
        probe1Listener.setDragBounds( modelBounds );
        probe2Listener.setDragBounds( modelBounds );
        bodyListener.setDragBounds( modelBounds );
      } );

      this.afterLightLayer2.addChild( this.waveSensorNode );
      return waveSensorIcon;
    },
    getVelocitySensorIcon: function() {
      var self = this;
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
      self.moreToolsModel.velocitySensor.enabledProperty.link( function( enabled ) {
        velocitySensorIconNode.visible = !enabled;
        velocitySensorNode.visible = enabled;
      } );

      var velocitySensorListener = new MovableDragHandler( this.moreToolsModel.velocitySensor.positionProperty, {
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
        var viewPosition = velocitySensorNode.globalToParentPoint( event.pointer.point );
        var velocitySensorModelPosition = self.modelViewTransform.viewToModelPosition( viewPosition );
        self.moreToolsModel.velocitySensor.position = velocitySensorModelPosition;
      } ) );

      this.visibleBoundsProperty.link( function( visibleBounds ) {

        // The body node origin is at its top left, so translate the allowed drag area so that the center of the body
        // node will remain in bounds
        var bounds = new Rectangle( visibleBounds.x - velocitySensorNode.bounds.width / 2, visibleBounds.y, visibleBounds.width, visibleBounds.height );
        velocitySensorListener.setDragBounds( self.modelViewTransform.viewToModelBounds( bounds ) );
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