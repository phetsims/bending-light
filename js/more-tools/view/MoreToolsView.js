// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the "more tools" screen, which adds more tools to the toolbox, and a few more controls for the laser.
 * This extends the IntroView since it shares many of the same features.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  var VelocitySensorNode = require( 'BENDING_LIGHT/more-tools/view/VelocitySensorNode' );
  var WaveSensorNode = require( 'BENDING_LIGHT/more-tools/view/WaveSensorNode' );
  var Property = require( 'AXON/Property' );
  var ToolListener = require( 'SCENERY_PHET/input/ToolListener' );
  var Vector2 = require( 'DOT/Vector2' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  /**
   * Move a node from one parent to another but keeping it in exactly the same position/scale/orientation on the screen.
   * Require the oldParent explicitly rather than inferring it from the node to support multiparent nodes.
   * @param node
   * @param oldParent
   * @param newParent
   */
  var reparent = function( node, newParent ) {
    var oldParent = node.getParent();
    var g1 = node.getLocalToGlobalMatrix();

    oldParent.removeChild( node );
    newParent.addChild( node );

    var p2 = newParent.getGlobalToLocalMatrix();

    var m2 = p2.timesMatrix( g1 );
    node.setMatrix( m2 );
  };

  /**
   * @param {MoreToolsModel} moreToolsModel - model of the more tools screen
   * @constructor
   */
  function MoreToolsView( moreToolsModel ) {

    var moreToolsView = this;
    this.moreToolsModel = moreToolsModel; // @public
    var arrowScale = 1.5E-14; // @public read-only
    IntroView.call( this, moreToolsModel, 0, true, 3 );

    // @public - Create the Velocity Sensor tool and wave sensor tool to add to the tool box
    var velocitySensorToolboxScale = 0.85;
    this.velocitySensorNode = new VelocitySensorNode(
      this.beforeLightLayer2,
      this.afterLightLayer2,
      this.modelViewTransform,
      moreToolsModel.velocitySensor,
      arrowScale, {
        scale: velocitySensorToolboxScale
      }
    );
    var velocitySensorNode = this.velocitySensorNode;
    var modelViewTransform = this.modelViewTransform;
    var inToolbox = true;
    var p = moreToolsModel.velocitySensor.positionProperty;
    var vector2 = new Vector2( this.toolbox.getSelfBounds().width / 2 - this.velocitySensorNode.width / 2, 200 );
    var velocitySensorNodeListener = new MovableDragHandler( p, {
      modelViewTransform: modelViewTransform,
      startDrag: function( event ) {
        if ( inToolbox ) {
          reparent( velocitySensorNode, moreToolsView.afterLightLayer2 );
          velocitySensorNode.setScaleMagnitude( 2 );
          p.value = modelViewTransform.viewToModelPosition( velocitySensorNode.globalToParentPoint( event.pointer.point ) );
        }
        inToolbox = false;
      },
      onDrag: function() {
      },
      endDrag: function() {
        if ( velocitySensorNode.getGlobalBounds().intersectsBounds( moreToolsView.toolbox.getGlobalBounds() ) ) {
          reparent( velocitySensorNode, moreToolsView.toolbox );
          velocitySensorNode.setScaleMagnitude( velocitySensorToolboxScale );
          inToolbox = true;
          velocitySensorNode.translation = vector2;
        }
      }
    } );
    velocitySensorNode.translation = vector2;
    velocitySensorNode.addInputListener( velocitySensorNodeListener );

    this.toolbox.addChild( this.velocitySensorNode );

    // @public
    this.waveSensorNode = new WaveSensorNode(
      this.afterLightLayer2,
      this.beforeLightLayer2,
      this.modelViewTransform,
      moreToolsModel.waveSensor,
      this.toolbox,
      this.visibleBoundsProperty
    );
    this.toolbox.addChild( this.waveSensorNode );

    // updates the visibility of speed controls
    Property.multilink( [ moreToolsModel.laserViewProperty, moreToolsModel.waveSensor.enabledProperty ],
      function( laserView, isWaveSensorEnabled ) {
        moreToolsView.timeControlNode.visible = isWaveSensorEnabled || laserView === 'wave';
      } );
  }

  return inherit( IntroView, MoreToolsView, {
    /**
     * Update chart node and wave.
     * @protected
     */
    updateWaveShape: function() {
      IntroView.prototype.updateWaveShape.call( this );
      if ( this.waveSensorNode.waveSensor.visible ) {
        this.waveSensorNode.waveSensor.step();
        this.waveSensorNode.chartNode.step( this.moreToolsModel.time );
      }
    },

    /**
     * @protected
     */
    reset: function() {
      IntroView.prototype.reset.call( this );
      this.velocitySensorNode.reset();
      this.waveSensorNode.reset();
    }
  } );
} );