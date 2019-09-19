// Copyright 2015-2019, University of Colorado Boulder

/**
 * View for the wave sensor, which shows 2 sensor probes and a chart area (the body)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const ChartNode = require( 'BENDING_LIGHT/more-tools/view/ChartNode' );
  const Color = require( 'SCENERY/util/Color' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NodeProperty = require( 'SCENERY/util/NodeProperty' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const ProbeNode = require( 'SCENERY_PHET/ProbeNode' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Series = require( 'BENDING_LIGHT/more-tools/model/Series' );
  const ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );
  const WireNode = require( 'SCENERY_PHET/WireNode' );

  // strings
  const timeString = require( 'string!BENDING_LIGHT/time' );

  // constants
  var NORMAL_DISTANCE = 25;
  var bodyNormalProperty = new Vector2Property( new Vector2( NORMAL_DISTANCE, 0 ) );
  var sensorNormalProperty = new Vector2Property( new Vector2( 0, NORMAL_DISTANCE ) );

  /**
   * View for rendering a probe that can be used to sense wave values
   *
   * @param {Probe} probe - probe containing position and recorded data series
   * @param {string} color
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @constructor
   */
  function ProbeNodeWrapper( probe, color, modelViewTransform ) {

    var self = this;
    Node.call( this, { cursor: 'pointer' } );

    // Add the probe
    this.addChild( new ProbeNode( {
      radius: 43,
      innerRadius: 32,
      handleWidth: 40,
      handleHeight: 30,
      handleCornerRadius: 9,

      color: color, // {Color|string} darkish green

      // The circular part of the ProbeNode is called the sensor, where it receives light or has crosshairs, etc.
      // or null for an empty region
      sensorTypeFunction: ProbeNode.crosshairs(),
      scale: 0.35
    } ) );

    // Probe location
    probe.positionProperty.link( function( position ) {
      self.translation = modelViewTransform.modelToViewPosition( position );
    } );

    this.syncModelFromView = function() {
      probe.positionProperty.value = modelViewTransform.viewToModelPosition( self.translation );
    };
  }

  inherit( Node, ProbeNodeWrapper );

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {WaveSensor} waveSensor - model for the wave sensor
   * @param {Object} [options]
   * @constructor
   */
  function WaveSensorNode( modelViewTransform, waveSensor, options ) {

    var self = this;
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

    // Combine all the shapes to form the body node
    this.bodyNode = new Node( { children: [ outerRectangle, innerRectangle, innerMostRectangle ], scale: 0.93 } );

    // Add the "time" axis label at the bottom center of the chart
    var titleNode = new Text( timeString, { font: new PhetFont( 16 ), fill: 'white' } );
    if ( titleNode.width > rectangleWidth - 15 ) {
      titleNode.scale( ( rectangleWidth - 15 ) / titleNode.width );
    }
    this.bodyNode.addChild( titleNode );
    titleNode.centerX = outerRectangle.centerX;
    var fractionalVerticalDistanceToTitle = 0.82;
    titleNode.y = this.bodyNode.height * fractionalVerticalDistanceToTitle;

    // Add the chart inside the body, with one series for each of the dark and light probes
    this.chartNode = new ChartNode( innerMostRectangle.bounds.erode( 3 ), [
      new Series( waveSensor.probe1.seriesProperty, darkProbeColor ),
      new Series( waveSensor.probe2.seriesProperty, lightProbeColor )
    ] );
    this.bodyNode.addChild( this.chartNode );

    // Create the probes
    this.probe1Node = new ProbeNodeWrapper( waveSensor.probe1, '#5c5d5f', modelViewTransform ); // @public (read-only)
    this.probe2Node = new ProbeNodeWrapper( waveSensor.probe2, '#ccced0', modelViewTransform ); // @public (read-only)

    // Connect the sensor to the body with a gray wire
    var above = function( amount ) {

      // Nudge behind the body a so there is no gap
      return function( position ) {return position.plusXY( -2, -amount );};
    };

    var rightBottomProperty = new NodeProperty( this.bodyNode, 'bounds', 'rightBottom' );

    // @private
    this.wire1Node = new WireNode(
      new DerivedProperty( [ rightBottomProperty ], above( ( 1 - fractionalVerticalDistanceToTitle ) * this.bodyNode.height ) ), bodyNormalProperty,
      new NodeProperty( this.probe1Node, 'bounds', 'centerBottom' ), sensorNormalProperty, {
        lineWidth: 3,
        stroke: darkProbeColor.toCSS()
      }
    );

    this.wire2Node = new WireNode(
      new DerivedProperty( [ rightBottomProperty ], above( ( 1 - fractionalVerticalDistanceToTitle ) * this.bodyNode.height ) ), bodyNormalProperty,
      new NodeProperty( this.probe2Node, 'bounds', 'centerBottom' ), sensorNormalProperty, {
        lineWidth: 3,
        stroke: lightProbeColor.toCSS()
      }
    );

    this.addChild( this.wire1Node );
    this.addChild( this.wire2Node );

    // Synchronize the body position with the model (centered on the model point)
    waveSensor.bodyPositionProperty.link( function( position ) {
      self.bodyNode.center = modelViewTransform.modelToViewPosition( position );
    } );

    this.syncModelFromView = function() {
      waveSensor.bodyPositionProperty.value = modelViewTransform.viewToModelPosition( self.bodyNode.center );
      self.probe1Node.syncModelFromView();
      self.probe2Node.syncModelFromView();
    };

    this.addChild( this.bodyNode );
    this.addChild( this.probe1Node );
    this.addChild( this.probe2Node );

    this.resetRelativePositions();

    this.mutate( options );
  }

  bendingLight.register( 'WaveSensorNode', WaveSensorNode );

  return inherit( Node, WaveSensorNode, {
    resetRelativePositions: function() {
      this.probe1Node.center = this.bodyNode.center.plusXY( 110, 12 );
      this.probe2Node.center = this.probe1Node.center.plusXY( -25, -37 );
      this.syncModelFromView();
    }
  } );
} );