// Copyright 2002-2014, University of Colorado Boulder

/**
 * These controls appear only in wave mode and control the play/pause/speed for the light waves
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var slowMotionString = require( 'string!BENDING_LIGHT/slowMotion' );
  var normalSpeedString = require( 'string!BENDING_LIGHT/normalSpeed' );

  /**
   *
   * @constructor
   */
  function TimeControlNode( introModel, updateWaveShape, options ) {

    var slowMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'slow',
      new Text( slowMotionString, { font: new PhetFont( 12 ) } ), { radius: 8 } );
    var normalMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'normal',
      new Text( normalSpeedString, { font: new PhetFont( 12 ) } ), { radius: 8 } );

    var speedControlMaxWidth = ( slowMotionRadioBox.width > normalMotionRadioBox.width ) ?
                               slowMotionRadioBox.width : normalMotionRadioBox.width;

    // touch area
    var radioButtonSpacing = 5;
    var touchAreaHeightExpansion = radioButtonSpacing / 2;
    slowMotionRadioBox.touchArea = new Bounds2(
      slowMotionRadioBox.localBounds.minX,
      slowMotionRadioBox.localBounds.minY - touchAreaHeightExpansion,
      slowMotionRadioBox.localBounds.minX + speedControlMaxWidth,
      slowMotionRadioBox.localBounds.maxY + touchAreaHeightExpansion
    );

    // touch area
    normalMotionRadioBox.touchArea = new Bounds2(
      normalMotionRadioBox.localBounds.minX,
      normalMotionRadioBox.localBounds.minY - touchAreaHeightExpansion,
      normalMotionRadioBox.localBounds.minX + speedControlMaxWidth,
      normalMotionRadioBox.localBounds.maxY + touchAreaHeightExpansion
    );

    // add radio buttons to the VBox
    var speedControl = new VBox( {
      align: 'left',
      spacing: radioButtonSpacing,
      children: [ normalMotionRadioBox, slowMotionRadioBox ]
    } );

    // add play pause button
    var playPauseButton = new PlayPauseButton( introModel.isPlayingProperty, {
      radius: 18,
      stroke: 'black',
      fill: '#005566'
    } );

    // add step button
    var stepButton = new StepButton(
      function() {
        introModel.updateSimulationTimeAndWaveShape();
        updateWaveShape();
      },
      introModel.isPlayingProperty, {
        radius: 12,
        stroke: 'black',
        fill: '#005566'
      } );

    HBox.call( this, { spacing: 10, children: [ speedControl, playPauseButton, stepButton ] } );
    this.mutate( options );
  }

  return inherit( HBox, TimeControlNode );
} );