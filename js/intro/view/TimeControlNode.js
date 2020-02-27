// Copyright 2015-2019, University of Colorado Boulder

/**
 * These controls appear only in wave mode and control the play/pause/speed for the light waves
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import inherit from '../../../../phet-core/js/inherit.js';
import PlayPauseButton from '../../../../scenery-phet/js/buttons/PlayPauseButton.js';
import StepForwardButton from '../../../../scenery-phet/js/buttons/StepForwardButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import bendingLightStrings from '../../bending-light-strings.js';
import bendingLight from '../../bendingLight.js';

const normalSpeedString = bendingLightStrings.normalSpeed;
const slowMotionString = bendingLightStrings.slowMotion;

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

inherit( HBox, TimeControlNode );
export default TimeControlNode;