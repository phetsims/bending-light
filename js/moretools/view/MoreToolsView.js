// Copyright 2002-2015, University of Colorado Boulder
/**
 * View  for the "more tools" screen, which adds more tools to the toolbox, and a few more controls for the laser.
 *
 * @author Sam Reid
 *  * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );
  var VelocitySensorNode = require( 'BENDING_LIGHT/moretools/view/VelocitySensorNode' );
  var WaveSensorNode = require( 'BENDING_LIGHT/moretools/view/WaveSensorNode' );

  /**
   *
   * @param {MoreToolsModel} moreToolsModel
   * @constructor
   */
  function MoreToolsView( moreToolsModel ) {
    var moreToolsView = this;
    this.moreToolsModel = moreToolsModel;
    this.arrowScale = 1.5E-14;
    IntroView.call( this, moreToolsModel, 0, true, 3 );
    this.velocitySensorNode = this.createVelocitySensorTool();
    this.waveSensorNode = this.createWaveSensorTool();
    this.beforeLightLayer2.addChild( this.velocitySensorNode );
    this.beforeLightLayer2.addChild( this.waveSensorNode );
    this.moreToolsModel.waveSensor.visibleProperty.link( function( isvisble ) {

      moreToolsView.playPauseButton.visible = isvisble;
      moreToolsView.stepButton.visible = isvisble;
      moreToolsView.speedControl.visible = isvisble;
    } );

  }

  return inherit( IntroView, MoreToolsView, {

    stepInternal: function() {
      if ( this.waveSensorNode.waveSensor.visibleProperty.get() ) {
        this.waveSensorNode.waveSensor.step();
        this.waveSensorNode.chartNode.step( this.moreToolsModel.time );
      }
    },

    /**
     * Provide the additional tools for this tab
     *
     * @returns {*[]}
     */
    getMoreTools: function() {

      // create the Velocity Sensor tool and wave sensor tool to add to the toolbox
      return [ this.createVelocitySensorTool(), this.createWaveSensorTool() ];
    },

    createWaveSensorTool: function() {
      // create the WaveSensorNode
      return new WaveSensorNode( this, this.modelViewTransform, this.moreToolsModel.waveSensor, this.sensorPanel, this.layoutBounds );
    },

    resetAll: function() {

      this.protractorModel.reset();
      this.protractorNode.resetAll();
      this.velocitySensorNode.reset();
      this.waveSensorNode.reset();
    },

    createVelocitySensorTool: function() {
      return new VelocitySensorNode( this, this.modelViewTransform, this.moreToolsModel.velocitySensor, this.arrowScale,
        this.sensorPanel, this.layoutBounds );
    }
  } );
} );
