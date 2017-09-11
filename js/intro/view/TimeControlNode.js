// Copyright 2015, University of Colorado Boulder

/**
 * These controls appear only in wave mode and control the play/pause/speed for the light waves
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var normalSpeedString = require( 'string!BENDING_LIGHT/normalSpeed' );
  var slowMotionString = require( 'string!BENDING_LIGHT/slowMotion' );

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
    var touchAreaYDilation = radioButtonSpacing / 2;
    slowMotionRadioBox.touchArea = new Bounds2(
      slowMotionRadioBox.localBounds.minX,
      slowMotionRadioBox.localBounds.minY - touchAreaYDilation,
      slowMotionRadioBox.localBounds.minX + speedControlMaxWidth,
      slowMotionRadioBox.localBounds.maxY + touchAreaYDilation
    );

    // touch area
    normalMotionRadioBox.touchArea = new Bounds2(
      normalMotionRadioBox.localBounds.minX,
      normalMotionRadioBox.localBounds.minY - touchAreaYDilation,
      normalMotionRadioBox.localBounds.minX + speedControlMaxWidth,
      normalMotionRadioBox.localBounds.maxY + touchAreaYDilation
    );

    // add radio buttons to the VBox
    var speedControl = new VBox( {
      align: 'left',
      spacing: radioButtonSpacing,
      children: [
        normalMotionRadioBox,
        slowMotionRadioBox
      ]
    } );

    // add play pause button
    var playPauseButton = new PlayPauseButton( introModel.isPlayingProperty, {
      radius: 18,
      stroke: 'black',
      fill: '#005566'
    } );

    // Make the Play/Pause button bigger when it is showing the pause button, see #298
    var pauseSizeIncreaseFactor = 1.28;
    introModel.isPlayingProperty.lazyLink( function( isPlaying ) {
      playPauseButton.scale( isPlaying ? ( 1 / pauseSizeIncreaseFactor ) : pauseSizeIncreaseFactor );
    } );

    // add step button
    var stepButton = new StepForwardButton( {
      playingProperty: introModel.isPlayingProperty,
      listener: function() {
        introModel.updateSimulationTimeAndWaveShape( 'normal' );
        updateWaveShape();
      },
      radius: 12,
      stroke: 'black',
      fill: '#005566'
    } );

    HBox.call( this, {
      spacing: 15,
      children: [
        speedControl,
        playPauseButton,
        stepButton
      ],
      resize: false // don't relayout when the play/pause button changes size
    } );
    this.mutate( options );
  }

  bendingLight.register( 'TimeControlNode', TimeControlNode );
  
  return inherit( HBox, TimeControlNode );
} );