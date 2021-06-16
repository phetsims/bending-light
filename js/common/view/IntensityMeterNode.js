// Copyright 2015-2021, University of Colorado Boulder

/**
 * View for the intensity meter, including its movable sensor and readout region (called the body).
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
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import NodeProperty from '../../../../scenery/js/util/NodeProperty.js';
import bendingLightStrings from '../../bendingLightStrings.js';
import bendingLight from '../../bendingLight.js';

const intensityString = bendingLightStrings.intensity;

// constants
const NORMAL_DISTANCE = 25;
const bodyNormalProperty = new Vector2Property( new Vector2( NORMAL_DISTANCE, 0 ) );
const sensorNormalProperty = new Vector2Property( new Vector2( 0, NORMAL_DISTANCE ) );

class IntensityMeterNode extends Node {
  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {IntensityMeter} intensityMeter - model for the intensity meter
   * @param {Object} [options]
   */
  constructor( modelViewTransform, intensityMeter, options ) {

    super();
    this.modelViewTransform = modelViewTransform; // @public (read-only)
    this.intensityMeter = intensityMeter;

    this.probeNode = new ProbeNode( { cursor: 'pointer', scale: 0.6 } );

    // add body node
    const rectangleWidth = 150;
    const rectangleHeight = 95;

    // adding outer rectangle
    const outerRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 5, 5, {
      stroke: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#408260' )
        .addColorStop( 1, '#005127' ),
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#06974C' )
        .addColorStop( 0.6, '#00773A' ),
      lineWidth: 2
    } );

    // second rectangle
    const innerRectangle = new Rectangle( 2, 2, rectangleWidth - 10, rectangleHeight - 10, 5, 5, {
      fill: '#008541',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );

    // adding inner rectangle
    const valueBackground = new ShadedRectangle( new Bounds2( 0, 0, rectangleWidth * 0.8, rectangleHeight * 0.4 ), {
      baseColor: 'white',
      lightSource: 'rightBottom',
      centerX: innerRectangle.centerX,
      top: 10
    } );

    // Add a "Intensity" title to the body node
    const titleNode = new Text( intensityString, {
      font: new PhetFont( 24 ),
      fill: 'white'
    } );
    if ( titleNode.width > rectangleWidth - 15 ) {
      titleNode.scale( ( rectangleWidth - 15 ) / titleNode.width );
    }

    // Add the reading to the body node
    const valueNode = new Text( intensityMeter.readingProperty.get().getString(), {
      font: new PhetFont( 25 ),
      fill: 'black',
      maxWidth: valueBackground.width * 0.85
    } );

    // add up all the shapes to form a body node
    this.bodyNode = new Node( {
      children: [ outerRectangle, innerRectangle, valueBackground, titleNode, valueNode ],
      cursor: 'pointer',
      scale: 0.6
    } );
    titleNode.bottom = innerRectangle.bottom - 3;
    titleNode.centerX = outerRectangle.centerX;

    // displayed value
    intensityMeter.readingProperty.link( reading => {
      valueNode.setText( reading.getString() );
      valueNode.center = valueBackground.center;
    } );

    // Connect the sensor to the body with a gray wire
    const above = amount => position => position.plusXY( 0, -amount );

    const rightBottomProperty = new NodeProperty( this.bodyNode, this.bodyNode.boundsProperty, 'rightBottom' );

    // @private
    this.wireNode = new WireNode(
      new DerivedProperty( [ rightBottomProperty ], above( 12 ) ), bodyNormalProperty,
      new NodeProperty( this.probeNode, this.probeNode.boundsProperty, 'centerBottom' ), sensorNormalProperty, {
        lineWidth: 3,
        stroke: 'gray'
      }
    );

    intensityMeter.sensorPositionProperty.link( sensorPosition => {
      this.probeNode.translation = modelViewTransform.modelToViewPosition( sensorPosition );
    } );

    intensityMeter.bodyPositionProperty.link( bodyPosition => {
      this.bodyNode.translation = modelViewTransform.modelToViewPosition( bodyPosition );
    } );

    // add the components
    this.addChild( this.wireNode );
    this.addChild( this.probeNode );
    this.addChild( this.bodyNode );

    /**
     * @public - when the nodes are positioned by moving the node itself (for view layout), synchonize the model
     * Without this, when the body node is bumped out of the medium panels, it would have the wrong model position and
     * hence
     */
    this.syncModelFromView = () => {
      const sensorPosition = modelViewTransform.viewToModelPosition( this.probeNode.translation );
      const bodyPosition = modelViewTransform.viewToModelPosition( this.bodyNode.translation );

      intensityMeter.sensorPositionProperty.value = sensorPosition;
      intensityMeter.bodyPositionProperty.value = bodyPosition;
    };

    this.mutate( options );

    this.resetRelativePositions();
    this.syncModelFromView();
  }

  /**
   * @public
   */
  resetRelativePositions() {
    this.probeNode.center = this.bodyNode.center.plusXY( 90, -10 );
  }
}

bendingLight.register( 'IntensityMeterNode', IntensityMeterNode );

export default IntensityMeterNode;