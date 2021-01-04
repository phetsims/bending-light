// Copyright 2015-2020, University of Colorado Boulder

/**
 * View for the wave sensor, which shows 2 sensor probes and a chart area (the body)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ProbeNode from '../../../../scenery-phet/js/ProbeNode.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import WireNode from '../../../../scenery-phet/js/WireNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import NodeProperty from '../../../../scenery/js/util/NodeProperty.js';
import bendingLightStrings from '../../bendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import Series from '../model/Series.js';
import ChartNode from './ChartNode.js';

const timeString = bendingLightStrings.time;

// constants
const NORMAL_DISTANCE = 25;
const bodyNormalProperty = new Vector2Property( new Vector2( NORMAL_DISTANCE, 0 ) );
const sensorNormalProperty = new Vector2Property( new Vector2( 0, NORMAL_DISTANCE ) );

class ProbeNodeWrapper extends Node {

  /**
   * View for rendering a probe that can be used to sense wave values
   *
   * @param {Probe} probe - probe containing position and recorded data series
   * @param {string} color
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   */
  constructor( probe, color, modelViewTransform ) {

    super( { cursor: 'pointer' } );

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

    // Probe position
    probe.positionProperty.link( position => {
      this.translation = modelViewTransform.modelToViewPosition( position );
    } );

    this.syncModelFromView = () => {
      probe.positionProperty.value = modelViewTransform.viewToModelPosition( this.translation );
    };
  }
}

class WaveSensorNode extends Node {

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {WaveSensor} waveSensor - model for the wave sensor
   * @param {Object} [options]
   */
  constructor( modelViewTransform, waveSensor, options ) {

    super( { cursor: 'pointer' } );

    // Color taken from the image
    const darkProbeColor = new Color( 88, 89, 91 );
    const lightProbeColor = new Color( 147, 149, 152 );

    this.modelViewTransform = modelViewTransform; // @public (read-only)
    this.waveSensor = waveSensor; // @public (read-only)

    // Add body node
    const rectangleWidth = 135;
    const rectangleHeight = 100;

    // Adding outer rectangle
    const outerRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 5, 5, {
      stroke: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#2F9BCE' )
        .addColorStop( 1, '#00486A' ),
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#5EB4DE' )
        .addColorStop( 1, '#005B86' ),
      lineWidth: 2
    } );

    // Second rectangle
    const innerRectangle = new Rectangle( 0, 0, rectangleWidth - 5, rectangleHeight - 10, 0, 0, {
      fill: '#0078B0',
      stroke: '#0081BE',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );

    // Adding inner rectangle
    const innerMostRectangle = new ShadedRectangle( new Bounds2( 10, 0, rectangleWidth * 0.98, rectangleHeight * 0.63 ), {
      baseColor: 'white',
      lightSource: 'rightBottom',
      centerX: innerRectangle.centerX,
      centerY: rectangleHeight * 0.4,
      cornerRadius: 5
    } );

    // Combine all the shapes to form the body node
    this.bodyNode = new Node( { children: [ outerRectangle, innerRectangle, innerMostRectangle ], scale: 0.93 } );

    // Add the "time" axis label at the bottom center of the chart
    const titleNode = new Text( timeString, { font: new PhetFont( 16 ), fill: 'white' } );
    if ( titleNode.width > rectangleWidth - 15 ) {
      titleNode.scale( ( rectangleWidth - 15 ) / titleNode.width );
    }
    this.bodyNode.addChild( titleNode );
    titleNode.centerX = outerRectangle.centerX;
    const fractionalVerticalDistanceToTitle = 0.82;
    titleNode.y = this.bodyNode.height * fractionalVerticalDistanceToTitle;

    // Add the chart inside the body, with one series for each of the dark and light probes
    this.chartNode = new ChartNode( innerMostRectangle.bounds.eroded( 3 ), [
      new Series( waveSensor.probe1.seriesProperty, darkProbeColor ),
      new Series( waveSensor.probe2.seriesProperty, lightProbeColor )
    ] );
    this.bodyNode.addChild( this.chartNode );

    // Create the probes
    this.probe1Node = new ProbeNodeWrapper( waveSensor.probe1, '#5c5d5f', modelViewTransform ); // @public (read-only)
    this.probe2Node = new ProbeNodeWrapper( waveSensor.probe2, '#ccced0', modelViewTransform ); // @public (read-only)

    // Connect the sensor to the body with a gray wire
    const above = amount => {

      // Nudge behind the body a so there is no gap
      return position => position.plusXY( -2, -amount );
    };

    const rightBottomProperty = new NodeProperty( this.bodyNode, this.bodyNode.boundsProperty, 'rightBottom' );

    // @private
    this.wire1Node = new WireNode(
      new DerivedProperty( [ rightBottomProperty ], above( ( 1 - fractionalVerticalDistanceToTitle ) * this.bodyNode.height ) ), bodyNormalProperty,
      new NodeProperty( this.probe1Node, this.probe1Node.boundsProperty, 'centerBottom' ), sensorNormalProperty, {
        lineWidth: 3,
        stroke: darkProbeColor.toCSS()
      }
    );

    this.wire2Node = new WireNode(
      new DerivedProperty( [ rightBottomProperty ], above( ( 1 - fractionalVerticalDistanceToTitle ) * this.bodyNode.height ) ), bodyNormalProperty,
      new NodeProperty( this.probe2Node, this.probe2Node.boundsProperty, 'centerBottom' ), sensorNormalProperty, {
        lineWidth: 3,
        stroke: lightProbeColor.toCSS()
      }
    );

    this.addChild( this.wire1Node );
    this.addChild( this.wire2Node );

    // Synchronize the body position with the model (centered on the model point)
    waveSensor.bodyPositionProperty.link( position => {
      this.bodyNode.center = modelViewTransform.modelToViewPosition( position );
    } );

    this.syncModelFromView = () => {
      waveSensor.bodyPositionProperty.value = modelViewTransform.viewToModelPosition( this.bodyNode.center );
      this.probe1Node.syncModelFromView();
      this.probe2Node.syncModelFromView();
    };

    this.addChild( this.bodyNode );
    this.addChild( this.probe1Node );
    this.addChild( this.probe2Node );

    this.resetRelativePositions();

    this.mutate( options );
  }

  /**
   * @public
   */
  resetRelativePositions() {
    this.probe1Node.center = this.bodyNode.center.plusXY( 110, 12 );
    this.probe2Node.center = this.probe1Node.center.plusXY( -25, -37 );
    this.syncModelFromView();
  }
}

bendingLight.register( 'WaveSensorNode', WaveSensorNode );

export default WaveSensorNode;