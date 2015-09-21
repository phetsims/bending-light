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
    this.velocitySensorNode = new VelocitySensorNode(
      this.beforeLightLayer2,
      this.afterLightLayer2,
      this.modelViewTransform,
      moreToolsModel.velocitySensor,
      arrowScale
    );
    // Add the input listener, also initializes the position of the tool
    var velocitySensorToolListener = new ToolListener( this.velocitySensorNode, this.toolbox, this.beforeLightLayer2,
      this.visibleBoundsProperty, true, 1, 2, function() {

        // Don't include the size/shape/location of children in the bounds of the toolbox or nodes will fall back to the
        // wrong location.
        return new Vector2( moreToolsView.toolbox.getSelfBounds().width / 2, moreToolsView.toolbox.getSelfBounds().width / 2 );
      }
    );
    this.velocitySensorNode.addInputListener( velocitySensorToolListener );
    velocitySensorToolListener.positionInToolbox();
    velocitySensorToolListener.events.on( 'droppedInToolbox', function( callback ) {callback();} );
    velocitySensorToolListener.events.on( 'draggedOutOfToolbox', function( callback ) {callback();} );
    velocitySensorToolListener.events.on( 'dragged', function() {moreToolsView.velocitySensorNode.syncModelCoordinates();} );
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