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

  /**
   * @param {MoreToolsModel} moreToolsModel - model of the more tools screen
   * @constructor
   */
  function MoreToolsView( moreToolsModel ) {

    var moreToolsView = this;
    this.moreToolsModel = moreToolsModel; // @public
    var arrowScale = 1.5E-14; // @public read-only
    IntroView.call( this, moreToolsModel, 0, true, 3 );

    // @public - Create the Velocity Sensor tool and wave sensor tool to add to the sensor Panel
    this.velocitySensorNode = new VelocitySensorNode(
      this.beforeLightLayer2,
      this.afterLightLayer2,
      this.modelViewTransform,
      moreToolsModel.velocitySensor,
      arrowScale,
      this.toolbox,
      this.visibleBoundsProperty,
      this.getVelocitySensorToolboxModelLocation.bind( this )
    );

    // @public
    this.waveSensorNode = new WaveSensorNode(
      this.afterLightLayer2,
      this.beforeLightLayer2,
      this.modelViewTransform,
      moreToolsModel.waveSensor,
      this.toolbox,
      this.visibleBoundsProperty,
      this.getWaveSensorToolboxPosition.bind( this )
    );

    this.velocitySensorNode.addToSensorPanel();
    this.waveSensorNode.addToSensorPanel();

    Property.multilink( [ moreToolsModel.laserViewProperty, moreToolsModel.waveSensor.enabledProperty ],
      function( laserView, isWaveSensorEnabled ) {
        var isButtonsVisible = isWaveSensorEnabled || laserView === 'wave';
        moreToolsView.playPauseButton.visible = isButtonsVisible;
        moreToolsView.stepButton.visible = isButtonsVisible;
        moreToolsView.speedControl.visible = isButtonsVisible;
      } );

    this.events.on( 'layoutFinished', function() {

      if ( !moreToolsView.velocitySensorNode.velocitySensor.enabled ) {
        moreToolsView.moveVelocitySensorToToolbox();
      }

      if ( !moreToolsView.waveSensorNode.enabled ) {
        moreToolsView.moveWaveSensorToToolbox();
      }
    } );
  }

  return inherit( IntroView, MoreToolsView, {
    getVelocitySensorToolboxModelLocation: function() {

      // Cannot rely on the width, height of the nodes for layout since they scale up and down,
      // Se we use magic numbers here instead.  If the initial size of the objects in the toolbox changes, these values
      // will have to be updated as well.
      return this.modelViewTransform.viewToModelPosition( this.getProtractorNodeToolboxPosition().plusXY( -45, 65 ) );
    },
    moveVelocitySensorToToolbox: function() {
      this.velocitySensorNode.velocitySensor.position = this.getVelocitySensorToolboxModelLocation();
    },
    moveWaveSensorToToolbox: function() {
      this.waveSensorNode.waveSensor.bodyPosition = this.getWaveSensorToolboxPosition();
      this.waveSensorNode.reset();
    },
    getWaveSensorToolboxPosition: function() {
      var modelPosition = this.modelViewTransform.modelToViewPosition( this.getVelocitySensorToolboxModelLocation() );
      return this.modelViewTransform.viewToModelPosition( modelPosition.plusXY( 20, 50 ) );
    },
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