// Copyright 2015-2021, University of Colorado Boulder

/**
 * View for the Velocity Sensor tool. Measures the velocity at the sensor's tip and shows it in the display box. Also
 * points a blue arrow along the direction of the velocity and the arrow length is proportional to the velocity.  The
 * origin of the node (0,0) in the node's coordinate frame is at the hot spot, the left side of the triangle, where
 * the velocity vector arrow appears.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import bendingLightStrings from '../../bendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import VelocitySensor from '../model/VelocitySensor.js';
import Vector2 from '../../../../dot/js/Vector2.js';

const speedString = bendingLightStrings.speed;
const unknownVelocityString = bendingLightStrings.unknownVelocity;
const velocityPatternString = bendingLightStrings.velocityPattern;

class VelocitySensorNode extends Node {
  modelViewTransform: ModelViewTransform2;
  velocitySensor: VelocitySensor;
  bodyNode: Node;
  arrowShape: Path;

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {VelocitySensor} velocitySensor - model for the velocity sensor
   * @param {number} arrowScale - scale to be applied for the velocity value to display as arrow
   * @param {Object} [options]
   */
  constructor( modelViewTransform: ModelViewTransform2, velocitySensor: VelocitySensor, arrowScale: number, options?: Partial<NodeOptions> ) {

    super( {
      cursor: 'pointer',
      pickable: true
    } );

    this.modelViewTransform = modelViewTransform; // @public (read-only)
    this.velocitySensor = velocitySensor; // @public (read-only)

    const rectangleWidth = 54;
    const rectangleHeight = 37;
    this.bodyNode = new Node(); // @private

    const triangleHeight = 15;
    const triangleWidth = 8;

    // Adding triangle shape
    const triangleShapeNode = new Path( new Shape()
      .moveTo( 0, 0 )
      .lineTo( triangleWidth, -triangleHeight / 2 )
      .lineTo( triangleWidth, +triangleHeight / 2 )
      .close(), {
      fill: '#CF8702',
      stroke: '#844702'
    } );
    this.bodyNode.addChild( triangleShapeNode );

    // Adding outer rectangle
    const bodyColor = new Color( '#CF8702' );
    const arc = 7.5;
    const bodyRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, arc, arc, {
      stroke: '#844702',
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )

        // Highlights on top
        .addColorStop( 0.0, bodyColor.colorUtilsBrightness( +0.4 ) )
        .addColorStop( 0.1, bodyColor.colorUtilsBrightness( +0.1 ) )
        .addColorStop( 0.6, bodyColor.colorUtilsBrightness( +0.0 ) )

        // Shadows on bottom
        .addColorStop( 0.9, bodyColor.colorUtilsBrightness( -0.1 ) )
        .addColorStop( 1.0, bodyColor.colorUtilsBrightness( -0.3 ) ),
      lineWidth: 1,
      left: triangleShapeNode.right - 2,
      centerY: triangleShapeNode.centerY
    } );
    this.bodyNode.addChild( bodyRectangle );

    // Adding velocity meter title text
    const titleText = new Text( speedString, {
      fill: 'black',
      font: new PhetFont( 10 ),
      maxWidth: rectangleWidth - 7.5,
      centerX: bodyRectangle.centerX,
      bottom: bodyRectangle.bottom - 5
    } );

    this.bodyNode.addChild( titleText );

    // Adding inner rectangle
    const whiteTextArea = new ShadedRectangle( new Bounds2( 0, 0, rectangleWidth - 15, rectangleHeight - 22.5 ), {
      baseColor: 'white',
      lightSource: 'rightBottom',
      cornerRadius: 3,
      centerX: bodyRectangle.centerX,
      top: bodyRectangle.top + 3
    } );
    this.bodyNode.addChild( whiteTextArea );

    // Adding velocity measure label
    const labelText = new Text( '', {
      fill: 'black',
      font: new PhetFont( 10 ),
      center: whiteTextArea.center
    } );
    this.bodyNode.addChild( labelText );

    this.addChild( this.bodyNode );

    // Arrow shape
    const arrowWidth = 6;
    this.arrowShape = new Path( null, {
      fill: 'blue',
      opacity: 0.6
    } );
    this.bodyNode.addChild( this.arrowShape );

    velocitySensor.valueProperty.link( ( velocity: Vector2) => {

      const positionX = modelViewTransform.modelToViewDeltaX( velocity.x ) * arrowScale;
      const positionY = modelViewTransform.modelToViewDeltaY( velocity.y ) * arrowScale;

      // update the arrow shape when the velocity value changes
      this.arrowShape.setShape( new ArrowShape( 0, 0, positionX, positionY, {
        tailWidth: arrowWidth,
        headWidth: 2 * arrowWidth,
        headHeight: 2 * arrowWidth
      } ) );
    } );

    velocitySensor.isArrowVisibleProperty.linkAttribute( this.arrowShape, 'visible' );

    // update the velocity node position
    velocitySensor.positionProperty.link( ( position: Vector2) => {
      const velocitySensorXPosition = modelViewTransform.modelToViewX( position.x );
      const velocitySensorYPosition = modelViewTransform.modelToViewY( position.y );
      this.setTranslation( velocitySensorXPosition, velocitySensorYPosition );
    } );

    // Update the text when the value or units changes.
    Property.multilink( [ velocitySensor.valueProperty, velocitySensor.positionProperty ],
      ( velocity: Vector2 ) => {

        // add '?' for null velocity
        if ( velocity.magnitude === 0 ) {
          labelText.text = unknownVelocityString;
        }
        else {
          const stringNumber = Utils.toFixed( velocity.magnitude / BendingLightConstants.SPEED_OF_LIGHT, 2 );
          const text = StringUtils.format( velocityPatternString, stringNumber );
          labelText.setText( text );
        }
        labelText.center = whiteTextArea.center;
      } );

    // Overall scaling, vestigial
    // @ts-ignore
    this.bodyNode.setScaleMagnitude( 0.7 );

    this.mutate( options );
  }
}

bendingLight.register( 'VelocitySensorNode', VelocitySensorNode );

export default VelocitySensorNode;