// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the wave sensor, which shows 2 sensor probes and a chart area (the body)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var WireNode = require( 'BENDING_LIGHT/common/view/WireNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ChartNode = require( 'BENDING_LIGHT/more-tools/view/ChartNode' );
  var Series = require( 'BENDING_LIGHT/more-tools/model/Series' );

  // strings
  var timeString = require( 'string!BENDING_LIGHT/time' );

  // images
  var darkProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_dark.png' );
  var lightProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_light.png' );

  /**
   * View for rendering a probe that can be used to sense wave values
   *
   * @param {Probe} probe - probe containing position and recorded data series
   * @param {string} probeImageName - name of the probe image
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @constructor
   */
  function ProbeNode( probe, probeImageName, modelViewTransform ) {

    var probeNode = this;
    Node.call( this, { cursor: 'pointer' } );

    // Add the probe
    this.addChild( new Image( probeImageName, { scale: 0.8 } ) );

    // Probe location
    probe.positionProperty.link( function( position ) {
      probeNode.center = modelViewTransform.modelToViewPosition( position );
    } );

    this.syncModelFromView = function() {
      probe.position = modelViewTransform.viewToModelPosition( probeNode.center );
    };
  }

  inherit( Node, ProbeNode );

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {WaveSensor} waveSensor - model for the wave sensor
   * @param {Object} [options]
   * @constructor
   */
  function WaveSensorNode( modelViewTransform, waveSensor, options ) {

    var waveSensorNode = this;
    Node.call( this, { cursor: 'pointer' } );

    // Color taken from the image
    var darkProbeColor = new Color( 88, 89, 91 );
    var lightProbeColor = new Color( 147, 149, 152 );

    this.modelViewTransform = modelViewTransform; // @public (read-only)
    this.waveSensor = waveSensor; // @public (read-only)

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
    this.chartNode = new ChartNode( innerMostRectangle.bounds.erode( 3 ), [
      new Series( waveSensor.probe1.seriesProperty, darkProbeColor ),
      new Series( waveSensor.probe2.seriesProperty, lightProbeColor )
    ] );
    this.bodyNode.addChild( this.chartNode );

    // Create the probes
    this.probe1Node = new ProbeNode( waveSensor.probe1, darkProbeImage, modelViewTransform ); // @public (read-only)
    this.probe2Node = new ProbeNode( waveSensor.probe2, lightProbeImage, modelViewTransform ); // @public (read-only)

    // Rendering order, including wires
    var wire1Node = new WireNode( this.probe1Node, this.bodyNode, darkProbeColor.toCSS() );
    this.addChild( wire1Node );
    var wire2Node = new WireNode( this.probe2Node, this.bodyNode, lightProbeColor.toCSS() );
    this.addChild( wire2Node );

    // Synchronize the body position with the model (centered on the model point)
    waveSensor.bodyPositionProperty.link( function( position ) {
      waveSensorNode.bodyNode.center = modelViewTransform.modelToViewPosition( position );
      wire1Node.updateWireShape();
      wire2Node.updateWireShape();
    } );

    waveSensor.probe1.positionProperty.link( function( position ) {
      waveSensorNode.probe1Node.center = modelViewTransform.modelToViewPosition( position );
      wire1Node.updateWireShape();
    } );
    waveSensor.probe2.positionProperty.link( function() {
      wire2Node.updateWireShape();
    } );

    this.syncModelFromView = function() {
      waveSensor.bodyPosition = modelViewTransform.viewToModelPosition( waveSensorNode.bodyNode.center );
      waveSensorNode.probe1Node.syncModelFromView();
      waveSensorNode.probe2Node.syncModelFromView();
    };

    this.addChild( this.bodyNode );
    this.addChild( this.probe1Node );
    this.addChild( this.probe2Node );

    this.resetRelativePositions();

    this.mutate( options );
  }

  return inherit( Node, WaveSensorNode, {
    resetRelativePositions: function() {
      this.bodyNode.center = this.probe1Node.center.plusXY( 180, 0 );
      this.probe2Node.center = this.probe1Node.center.plusXY( 60, 0 );
      this.syncModelFromView();
    }
  } );
} );