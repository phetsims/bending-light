// Copyright 2002-2012, University of Colorado
/**
 * Canvas for the "more tools" tab, which adds more tools to the toolbox, and a few more controls for the laser.
 *
 * @author Sam Reid
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
   * @param moreToolsModel
   * @constructor
   */
  function MoreToolsView( moreToolsModel ) {
    this.moreToolsModel = moreToolsModel;
    this.arrowScale = 1.5E-14;
    IntroView.call( this, moreToolsModel, true, true );
    this.velocitySensorNode = this.createVelocitySensorTool();
    this.waveSensorNode = this.createWaveSensorTool();
    this.addChild( this.velocitySensorNode );
    this.addChild( this.waveSensorNode );

  }

  return inherit( IntroView, MoreToolsView, {
    /**
     * Provide the additional tools for this tab
     *
     * @returns {*[]}
     */
    getMoreTools: function() {
      //Create the Velocity Sensor tool and wave sensor tool to add to the toolbox
      return [ this.createVelocitySensorTool(), this.createWaveSensorTool() ];
    },
    createWaveSensorTool: function() {
      //Create the WaveSensorNode
      return new WaveSensorNode( this.modelViewTransform, this.moreToolsModel.waveSensor, this.sensorPanel );
    },
    resetAll: function() {

      this.protractorModel.reset();
      this.protractorNode.resetAll();
      this.velocitySensorNode.setScaleMagnitude( 0.7 );
      this.moreToolsModel.velocitySensor.reset();
      this.moreToolsModel.waveSensor.reset();
    },


    createVelocitySensorTool: function() {
      return new VelocitySensorNode( this.modelViewTransform, this.moreToolsModel.velocitySensor, this.arrowScale,
        this.sensorPanel );
    }
  } );
} );
