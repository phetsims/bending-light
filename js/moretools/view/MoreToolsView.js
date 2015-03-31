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
  var WaveSensorNode = require( 'BENDING_LIGHT/moretools/view/WaveSensorNode' );

  /**
   *
   * @param model
   * @constructor
   */
  function MoreToolsView( model ) {
    this.model = model;
    this.arrowScale = 1.5E-14;
    IntroView.call( this, model, true, true );
  }

  return inherit( IntroView, MoreToolsView, {
    /**
     * Provide the additional tools for this tab
     *
     * @returns {*[]}
     */
    getMoreTools: function() {
      //Create the Velocity Sensor tool and wave sensor tool to add to the toolbox
      return [ /*this.createVelocitySensorTool(),*/ this.createWaveSensorTool() ];
    },
    createWaveSensorTool: function() {
      //Create the WaveSensorNode
      return new WaveSensorNode( this.modelViewTransform, this.model.waveSensor, this.sensorPanel );
    }
  } );
} );
