//  Copyright 2002-2014, University of Colorado Boulder

/**
 * These controls appear only in wave mode and control the play/pause/speed for the light waves
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var slowMotionString = require( 'string!BENDING_LIGHT/slowMotion' );
  var normalString = require( 'string!BENDING_LIGHT/normal' );

  // constants
  var INSET = 10;

  /**
   *
   * @constructor
   */
  function TimeControlNode( introModel, updateWaveShape, options ) {
    Node.call( this );

    var slowMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'slow',
      new Text( slowMotionString, { font: new PhetFont( 12 ) } ), { radius: 8 } );
    var normalMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'normal',
      new Text( normalString, { font: new PhetFont( 12 ) } ), { radius: 8 } );

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
    this.speedControl = new VBox( {
      align: 'left',
      spacing: radioButtonSpacing,
      children: [ normalMotionRadioBox, slowMotionRadioBox ]
    } );
    this.addChild( this.speedControl );

    // add play pause button
    this.playPauseButton = new PlayPauseButton( introModel.isPlayingProperty, {
      radius: 18, stroke: 'black', fill: '#005566',
      bottom: this.speedControl.bottom,
      left: this.speedControl.right + INSET
    } );
    this.addChild( this.playPauseButton );

    // add step button
    this.stepButton = new StepButton(
      function() {
        introModel.updateSimulationTimeAndWaveShape();
        updateWaveShape();
      },
      introModel.isPlayingProperty, {
        radius: 12,
        stroke: 'black',
        fill: '#005566',
        left: this.playPauseButton.right + 15,
        y: this.playPauseButton.centerY
      } );
    this.addChild( this.stepButton );

    this.mutate( options );
  }

  return inherit( Node, TimeControlNode );
} );