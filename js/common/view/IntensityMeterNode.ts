// Copyright 2015-2023, University of Colorado Boulder

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
import { LinearGradient, Node, NodeOptions, Rectangle, Text } from '../../../../scenery/js/imports.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import IntensityMeter from '../model/IntensityMeter.js';

const intensityStringProperty = BendingLightStrings.intensityStringProperty;

// constants
const NORMAL_DISTANCE = 25;
const bodyNormalProperty = new Vector2Property( new Vector2( NORMAL_DISTANCE, 0 ) );
const sensorNormalProperty = new Vector2Property( new Vector2( 0, NORMAL_DISTANCE ) );

type IntensityMeterNodeOptions = NodeOptions;

class IntensityMeterNode extends Node {
  private modelViewTransform: ModelViewTransform2;
  public probeNode: ProbeNode;
  private intensityMeter: IntensityMeter;
  public bodyNode: Node;
  private wireNode: WireNode;
  public syncModelFromView: () => void;

  /**
   * @param modelViewTransform - Transform between model and view coordinate frames
   * @param intensityMeter - model for the intensity meter
   * @param [providedOptions]
   */
  public constructor( modelViewTransform: ModelViewTransform2, intensityMeter: IntensityMeter, providedOptions?: IntensityMeterNodeOptions ) {

    super();
    this.modelViewTransform = modelViewTransform; // (read-only)
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
    const titleNode = new Text( intensityStringProperty, {
      font: new PhetFont( 24 ),
      fill: 'white',
      maxWidth: rectangleWidth - 15
    } );

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

    titleNode.boundsProperty.link( bounds => {
      titleNode.centerX = outerRectangle.centerX;
    } );

    // displayed value
    intensityMeter.readingProperty.link( reading => {
      valueNode.setString( reading.getString() );
      valueNode.center = valueBackground.center;
    } );

    // Connect the sensor to the body with a gray wire
    const above = ( amount: number ) => ( position: Vector2 ) => position.plusXY( 0, -amount );

    const rightBottomProperty = new DerivedProperty( [ this.bodyNode.boundsProperty ], bounds => bounds.rightBottom );
    const centerBottomProperty = new DerivedProperty( [ this.probeNode.boundsProperty ], bounds => bounds.centerBottom );

    this.wireNode = new WireNode(
      new DerivedProperty( [ rightBottomProperty ], above( 12 ) ),
      bodyNormalProperty,
      centerBottomProperty,
      sensorNormalProperty, {
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
     * when the nodes are positioned by moving the node itself (for view layout), synchonize the model
     * Without this, when the body node is bumped out of the medium panels, it would have the wrong model position
     */
    this.syncModelFromView = () => {
      const sensorPosition = modelViewTransform.viewToModelPosition( this.probeNode.translation );
      const bodyPosition = modelViewTransform.viewToModelPosition( this.bodyNode.translation );

      intensityMeter.sensorPositionProperty.value = sensorPosition;
      intensityMeter.bodyPositionProperty.value = bodyPosition;
    };

    this.mutate( providedOptions );

    this.resetRelativePositions();
    this.syncModelFromView();
  }

  public resetRelativePositions(): void {
    this.probeNode.center = this.bodyNode.center.plusXY( 90, -10 );
  }
}

bendingLight.register( 'IntensityMeterNode', IntensityMeterNode );

export default IntensityMeterNode;