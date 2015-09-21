// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the wave sensor, which shows 2 sensor probes and a chart area (the body)
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var WireNode = require( 'BENDING_LIGHT/common/view/WireNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Vector2 = require( 'DOT/Vector2' );
  var ChartNode = require( 'BENDING_LIGHT/more-tools/view/ChartNode' );
  var Series = require( 'BENDING_LIGHT/more-tools/model/Series' );
  var TweenUtil = require( 'BENDING_LIGHT/common/view/TweenUtil' );

  // strings
  var timeString = require( 'string!BENDING_LIGHT/time' );

  // images
  var darkProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_dark.png' );
  var lightProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_light.png' );

  // constants
  var TOOLBOX_SCALE = 0.33;
  var PLAY_AREA_SCALE = 1;

  /**
   * View for rendering a probe that can be used to sense wave values
   *
   * @param {WaveSensorNode} waveSensorNode
   * @param {Probe} probe - probe containing position and recorded data series
   * @param {string} probeImageName - name of the probe image
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Rectangle} container - toolbox node bounds
   * @param {Bounds2} dragBoundsProperty - bounds that define where the probe may be dragged
   * @constructor
   */
  function ProbeNode( waveSensorNode, probe, probeImageName, modelViewTransform, container, dragBoundsProperty ) {

    var probeNode = this;
    Node.call( this, { cursor: 'pointer' } );

    // Add the probe
    this.addChild( new Image( probeImageName, { scale: 0.8 } ) );

    // Interaction: Translates when dragged, but keep it bounded within the play area
    var start;
    var centerEndLocation = new Vector2();

    // Probe location
    probe.positionProperty.link( function( position ) {
      var probePositionX = modelViewTransform.modelToViewX( position.x );
      var probePositionY = modelViewTransform.modelToViewY( position.y );
      probeNode.setTranslation( probePositionX - probeNode.getWidth() / 2, probePositionY - probeNode.getHeight() / 2 );
    } );
  }

  inherit( Node, ProbeNode );

  /**
   * @param {Node} afterLightLayer2 - layer in which VelocitySensorNode is present when in play area
   * @param {Node} beforeLightLayer2 - layer in which VelocitySensorNode is present when in toolbox
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {WaveSensor} waveSensor - model for the wave sensor
   * @param {Rectangle} container - toolbox node bounds
   * @param {Property.<Bounds2>} dragBoundsProperty - bounds that define where the protractor may be dragged
   * @param {function} getWaveSensorToolboxPosition - gets the position the wave sensor should appear at in the toolbox
   * @constructor
   */
  function WaveSensorNode( afterLightLayer2, beforeLightLayer2, modelViewTransform, waveSensor, container, dragBoundsProperty,
                           getWaveSensorToolboxPosition ) {

    this.getWaveSensorToolboxPosition = getWaveSensorToolboxPosition;

    var waveSensorNode = this;
    Node.call( this, { cursor: 'pointer' } );

    // Color taken from the image
    var darkProbeColor = new Color( 88, 89, 91 );
    var lightProbeColor = new Color( 147, 149, 152 );

    this.modelViewTransform = modelViewTransform; // @public
    this.waveSensor = waveSensor; // @public
    this.afterLightLayer2 = afterLightLayer2; // @private
    this.beforeLightLayer2 = beforeLightLayer2; // @private

    // Add body node
    var rectangleWidth = 135;
    var rectangleHeight = 100;

    // Adding outer rectangle
    var outerRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 5, 5, {
      stroke: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#2F9BCE' )
        .addColorStop( 1, '#00486A' ),
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#5EB4DE' )
        .addColorStop( 1, '#005B86' ),
      lineWidth: 2
    } );

    // Second rectangle
    var innerRectangle = new Rectangle( 0, 0, rectangleWidth - 5, rectangleHeight - 10, 0, 0, {
      fill: '#0078B0',
      stroke: '#0081BE',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );

    // Adding inner rectangle
    var innerMostRectangle = new ShadedRectangle( new Bounds2( 10, 0, rectangleWidth * 0.98, rectangleHeight * 0.63 ), {
      baseColor: 'white',
      lightSource: 'rightBottom',
      centerX: innerRectangle.centerX,
      centerY: rectangleHeight * 0.4,
      cornerRadius: 5
    } );
    // add up all the shapes to form a body node
    this.bodyNode = new Node( { children: [ outerRectangle, innerRectangle, innerMostRectangle ], scale: 0.93 } );

    // Add the "time" axis label at the bottom center of the chart
    var titleNode = new Text( timeString, { font: new PhetFont( 18 ), fill: 'white' } );
    if ( titleNode.width > rectangleWidth - 15 ) {
      titleNode.scale( (rectangleWidth - 15) / titleNode.width );
    }
    this.bodyNode.addChild( titleNode );
    titleNode.setTranslation( this.bodyNode.getCenterX() - titleNode.getWidth() / 2, this.bodyNode.height * 0.82 );

    // Add the chart inside the body, with one series for each of the dark and light probes
    this.chartNode = new ChartNode( innerMostRectangle.bounds.erode( 3 ),
      [ new Series( waveSensor.probe1.seriesProperty, darkProbeColor ),
        new Series( waveSensor.probe2.seriesProperty, lightProbeColor ) ] );
    this.bodyNode.addChild( this.chartNode );

    // Synchronize the body position with the model (centered on the model point)
    waveSensor.bodyPositionProperty.link( function( position ) {
      var waveSensorBodyPositionX = modelViewTransform.modelToViewX( position.x );
      var waveSensorBodyPositionY = modelViewTransform.modelToViewY( position.y );
      waveSensorNode.bodyNode.setTranslation( waveSensorBodyPositionX - waveSensorNode.bodyNode.getWidth() / 2,
        waveSensorBodyPositionY - waveSensorNode.bodyNode.getHeight() / 2 );
    } );

    // Create the probes
    this.probe1Node = new ProbeNode( this, waveSensor.probe1, darkProbeImage, modelViewTransform, container,
      dragBoundsProperty ); // @public
    this.probe2Node = new ProbeNode( this, waveSensor.probe2, lightProbeImage, modelViewTransform, container,
      dragBoundsProperty ); // @public

    // Rendering order, including wires
    this.addChild( new WireNode( this.probe1Node, this.bodyNode, darkProbeColor.toCSS() ) );
    this.addChild( new WireNode( this.probe2Node, this.bodyNode, lightProbeColor.toCSS() ) );
    this.addChild( this.bodyNode );
    this.addChild( this.probe1Node );
    this.addChild( this.probe2Node );
  }

  return inherit( Node, WaveSensorNode );
} );