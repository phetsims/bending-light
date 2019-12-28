// Copyright 2015-2019, University of Colorado Boulder

/**
 * These controls appear only in wave mode and control the play/pause/speed for the light waves
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  const StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const normalSpeedString = require( 'string!BENDING_LIGHT/normalSpeed' );
  const slowMotionString = require( 'string!BENDING_LIGHT/slowMotion' );

  /**
   *
   * @constructor
   */
  function TimeControlNode( introModel, updateWaveShape, options ) {

    const slowMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'slow',
      new Text( slowMotionString, { font: new PhetFont( 12 ) } ), { radius: 8 } );
    const normalMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'normal',
      new Text( normalSpeedString, { font: new PhetFont( 12 ) } ), { radius: 8 } );

    const speedControlMaxWidth = ( slowMotionRadioBox.width > normalMotionRadioBox.width ) ?
                               slowMotionRadioBox.width : normalMotionRadioBox.width;

    // touch area
    const radioButtonSpacing = 5;
    const touchAreaYDilation = radioButtonSpacing / 2;
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
    const speedControl = new VBox( {
      align: 'left',
      spacing: radioButtonSpacing,
      children: [
        normalMotionRadioBox,
        slowMotionRadioBox
      ]
    } );

    // add play pause button
    const playPauseButton = new PlayPauseButton( introModel.isPlayingProperty, {
      radius: 18,
      scaleFactorWhenPaused: 1.28,
      stroke: 'black',
      fill: '#005566'
    } );

    // add step button
    const stepButton = new StepForwardButton( {
      isPlayingProperty: introModel.isPlayingProperty,
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