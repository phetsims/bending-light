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
      this.visibleBoundsProperty
    );

    // @public
    this.waveSensorNode = new WaveSensorNode(
      this.afterLightLayer2,
      this.beforeLightLayer2,
      this.modelViewTransform,
      moreToolsModel.waveSensor,
      this.toolbox,
      this.layoutBounds
    );
    
    this.velocitySensorNode.addToSensorPanel();
    this.waveSensorNode.addToSensorPanel();

    Property.multilink( [ moreToolsModel.laserViewProperty, moreToolsModel.waveSensor.visibleProperty ],
      function( laserView, isWaveSensorEnabled ) {
        var isButtonsVisible = isWaveSensorEnabled || laserView === 'wave';
        moreToolsView.playPauseButton.visible = isButtonsVisible;
        moreToolsView.stepButton.visible = isButtonsVisible;
        moreToolsView.speedControl.visible = isButtonsVisible;
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