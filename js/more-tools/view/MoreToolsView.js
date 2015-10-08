// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the "more tools" screen, which adds more tools to the toolbox, and a few more controls for the laser.
 * This extends the moreToolsView since it shares many of the same features.
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
  var Vector2 = require( 'DOT/Vector2' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var reparent = require( 'BENDING_LIGHT/common/view/reparent' );
  var LaserTypeAquaRadioButtonGroup = require( 'BENDING_LIGHT/intro/view/LaserTypeAquaRadioButtonGroup' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var WavelengthControl = require( 'BENDING_LIGHT/common/view/WavelengthControl' );

  /**
   * @param {MoreToolsModel} moreToolsModel - model of the more tools screen
   * @constructor
   */
  function MoreToolsView( moreToolsModel ) {

    var moreToolsView = this;
    this.moreToolsModel = moreToolsModel; // @public
    var arrowScale = 1.5E-14; // @public read-only
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
    var velocitySensorInToolbox = true;
    var velocitySensorPositionProperty = moreToolsModel.velocitySensor.positionProperty;
    var velocitySensorToolboxPosition = new Vector2( this.toolbox.getSelfBounds().width / 2 - this.velocitySensorNode.width / 2, 215 );
    var velocitySensorNodeListener = new MovableDragHandler( velocitySensorPositionProperty, {
      modelViewTransform: modelViewTransform,
      startDrag: function( event ) {
        if ( velocitySensorInToolbox ) {
          reparent( velocitySensorNode, moreToolsView.afterLightLayer2 );
          velocitySensorNode.setScaleMagnitude( 2 );
          velocitySensorPositionProperty.value = modelViewTransform.viewToModelPosition( velocitySensorNode.globalToParentPoint( event.pointer.point ) );
        }
        velocitySensorInToolbox = false;
      },
      onDrag: function() {
      },
      endDrag: function() {
        if ( velocitySensorNode.getGlobalBounds().intersectsBounds( moreToolsView.toolbox.getGlobalBounds() ) ) {
          moreToolsView.resetVelocitySensorNode();
        }

        // Move it to the left if completely obscured by a medium control panel
        moreToolsView.bumpLeft( velocitySensorNode, velocitySensorPositionProperty );
      }
    } );
    velocitySensorNode.translation = velocitySensorToolboxPosition;
    velocitySensorNode.addInputListener( velocitySensorNodeListener );

    // @private
    this.resetVelocitySensorNode = function() {
      reparent( velocitySensorNode, moreToolsView.toolbox );
      velocitySensorNode.setScaleMagnitude( velocitySensorToolboxScale );
      velocitySensorInToolbox = true;
      velocitySensorNode.translation = velocitySensorToolboxPosition;
    };

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

    var previousItemBottomY = 135;
    var positionBodyAndProbe2 = function() {
      moreToolsView.waveSensorNode.bodyNode.center = moreToolsView.waveSensorNode.probe1Node.center.plusXY( 180, 0 );
      moreToolsView.waveSensorNode.probe2Node.center = moreToolsView.waveSensorNode.probe1Node.center.plusXY( 60, 0 );
      moreToolsView.waveSensorNode.syncModelFromView();
    };
    var positionInToolbox = function() {
      moreToolsView.waveSensorNode.setScaleMagnitude( 0.24 );
      moreToolsModel.waveSensor.sensorPosition = modelViewTransform.viewToModelPosition( new Vector2() );
      positionBodyAndProbe2();
      moreToolsView.waveSensorNode.centerX = moreToolsView.toolbox.getSelfBounds().width / 2;
      moreToolsView.waveSensorNode.top = previousItemBottomY + 15;
      moreToolsView.waveSensorNode.syncModelFromView();
    };
    positionInToolbox();
    var draggingTogether = true;

    // When a node is dropped behind a control panel, move it to the side so it won't be lost.
    var bumpLeft = function( node, positionProperty ) {
      while ( node.getGlobalBounds().intersectsBounds( moreToolsView.topMediumControlPanel.getGlobalBounds() ) ||
              node.getGlobalBounds().intersectsBounds( moreToolsView.bottomMediumControlPanel.getGlobalBounds() ) ) {
        positionProperty.value = positionProperty.value.plusXY( modelViewTransform.viewToModelDeltaX( -20 ), 0 );
      }
    };

    // @protected for subclass usage in MoreToolsView
    this.bumpLeft = bumpLeft;

    /**
     * Create an input listener for the intensity meter probe or body.  When dragging from the toolbox, both items
     * drag together.  When dragged in the play area, each item drags by itself.
     * @param node
     * @param positionProperty
     * @returns {*}
     */
    var createIntensityMeterComponentListener = function( node, positionProperty ) {

      var updatePosition = function( event ) {

        // Same as code below, but we need to add animation, so they will diverge
        var p = modelViewTransform.viewToModelPosition( moreToolsView.waveSensorNode.probe1Node.globalToParentPoint( event.pointer.point ) );
        if ( draggingTogether ) {
          moreToolsModel.waveSensor.probe1.position = p;
          positionBodyAndProbe2();
        }
        else {
          positionProperty.value = p;
        }
      };
      return new SimpleDragHandler( {
        start: function( event ) {
          reparent( moreToolsView.waveSensorNode, moreToolsView.afterLightLayer );
          moreToolsView.waveSensorNode.setScaleMagnitude( 1 );
          moreToolsView.waveSensorNode.setTranslation( 0, 0 );
          updatePosition( event );
          moreToolsModel.waveSensor.enabled = true;
        },
        drag: function( event ) {
          updatePosition( event ); // TODO: Relative drag
        },
        end: function() {
          if ( moreToolsView.waveSensorNode.bodyNode.getGlobalBounds().intersectsBounds( moreToolsView.toolbox.getGlobalBounds() ) ||
               moreToolsView.waveSensorNode.probe1Node.getGlobalBounds().intersectsBounds( moreToolsView.toolbox.getGlobalBounds() ) ||
               moreToolsView.waveSensorNode.probe2Node.getGlobalBounds().intersectsBounds( moreToolsView.toolbox.getGlobalBounds() ) ) {
            moreToolsView.resetWaveSensorNode();
          }
          else {
            draggingTogether = false;
          }

          bumpLeft( moreToolsView.waveSensorNode.probe1Node, moreToolsModel.waveSensor.probe1.positionProperty );
          bumpLeft( moreToolsView.waveSensorNode.probe2Node, moreToolsModel.waveSensor.probe2.positionProperty );
          bumpLeft( moreToolsView.waveSensorNode.bodyNode, moreToolsModel.waveSensor.bodyPositionProperty );
        }
      } );
    };
    // @private
    this.resetWaveSensorNode = function() {
      reparent( moreToolsView.waveSensorNode, moreToolsView.toolbox );
      positionInToolbox();
      draggingTogether = true;
      moreToolsModel.waveSensor.enabled = false;
    };

    this.waveSensorNode.probe1Node.addInputListener(
      createIntensityMeterComponentListener(
        this.waveSensorNode.probe1Node,
        moreToolsModel.waveSensor.probe1.positionProperty
      )
    );
    this.waveSensorNode.probe2Node.addInputListener(
      createIntensityMeterComponentListener(
        this.waveSensorNode.probe2Node,
        moreToolsModel.waveSensor.probe2.positionProperty
      )
    );
    this.waveSensorNode.bodyNode.addInputListener(
      createIntensityMeterComponentListener(
        this.waveSensorNode.bodyNode,
        moreToolsModel.waveSensor.bodyPositionProperty
      )
    );

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
      this.resetVelocitySensorNode();
      this.resetWaveSensorNode();
    }
  } );
} );