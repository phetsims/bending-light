// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the Velocity Sensor tool. Measures the velocity at the sensor's tip and shows it in the display box. Also
 * points a blue arrow along the direction of the velocity and the arrow length is proportional to the velocity.  The
 * origin of the node (0,0) in the node's coordinate frame is at the hot spot, the left side of the triangle, where
 * the velocity vector arrow appears.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Vector2 = require( 'DOT/Vector2' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var Util = require( 'DOT/Util' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var TweenUtil = require( 'BENDING_LIGHT/common/view/TweenUtil' );
  var Color = require( 'SCENERY/util/Color' );

  // strings
  var speedString = require( 'string!BENDING_LIGHT/speed' );
  var c_units = require( 'string!BENDING_LIGHT/c_units' );
  var velocityPattern = require( 'string!BENDING_LIGHT/velocityPattern' );

  // constants
  var SCALE_INSIDE_TOOLBOX = 0.7;
  var SCALE_OUTSIDE_TOOLBOX = 1;

  /**
   * @param {Node} beforeLightLayer2 - layer in which VelocitySensorNode is present when in toolbox
   * @param {Node} afterLightLayer2 - layer in which VelocitySensorNode is present when in play area
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {VelocitySensor} velocitySensor - model for the velocity sensor
   * @param {number} arrowScale - scale to be applied for the velocity value to display as arrow
   * @constructor
   */
  function VelocitySensorNode( beforeLightLayer2, afterLightLayer2, modelViewTransform, velocitySensor, arrowScale ) {

    var velocitySensorNode = this;
    Node.call( this, { cursor: 'pointer', pickable: true } );

    this.modelViewTransform = modelViewTransform; // @public
    this.velocitySensor = velocitySensor; // @public
    this.beforeLightLayer2 = beforeLightLayer2; // @private
    this.afterLightLayer2 = afterLightLayer2; // @private

    var rectangleWidth = 100;
    var rectangleHeight = 70;
    this.bodyNode = new Node(); // @private

    var triangleHeight = 30;
    var triangleWidth = 16;

    // Adding triangle shape
    var triangleShapeNode = new Path( new Shape()
      .moveTo( 0, 0 )
      .lineTo( triangleWidth, -triangleHeight / 2 )
      .lineTo( triangleWidth, +triangleHeight / 2 )
      .close(), {
      fill: '#CF8702',
      stroke: '#844702'
    } );
    this.bodyNode.addChild( triangleShapeNode );

    // Adding outer rectangle
    var bodyColor = new Color( '#CF8702' );
    var bodyRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 15, 15, {
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
    var titleText = new Text( speedString, {
      fill: 'black',
      font: new PhetFont( 18 )
    } );

    // TODO: use scenery maxWidth?
    if ( titleText.width > rectangleWidth - 15 ) {
      titleText.scale( (rectangleWidth - 15) / titleText.width );
    }
    titleText.centerX = bodyRectangle.centerX;
    titleText.bottom = bodyRectangle.bottom - 5;
    this.bodyNode.addChild( titleText );

    // Adding inner rectangle
    var whiteTextArea = new ShadedRectangle( new Bounds2( 0, 0, rectangleWidth - 30, rectangleHeight - 45 ), {
      baseColor: 'white',
      lightSource: 'rightBottom',
      cornerRadius: 5,
      centerX: bodyRectangle.centerX,
      top: bodyRectangle.top + 10
    } );
    this.bodyNode.addChild( whiteTextArea );

    // Adding velocity measure label
    var labelText = new Text( '', {
      fill: 'black',
      font: new PhetFont( 12 ),
      center: whiteTextArea.center
    } );
    this.bodyNode.addChild( labelText );

    this.addChild( this.bodyNode );

    // Arrow shape
    var arrowWidth = 6;
    this.arrowShape = new Path( null, {
      fill: 'blue'
    } );
    this.bodyNode.addChild( this.arrowShape );

    velocitySensor.valueProperty.link( function( velocity ) {

      var positionX = modelViewTransform.modelToViewDeltaX( velocity.x ) * arrowScale;
      var positionY = modelViewTransform.modelToViewDeltaY( velocity.y ) * arrowScale;

      // update the arrow shape when the velocity value changes
      velocitySensorNode.arrowShape.setShape( new ArrowShape( 0, 0, positionX, positionY, {
        tailWidth: arrowWidth,
        headWidth: 2 * arrowWidth,
        headHeight: 2 * arrowWidth
      } ) );
    } );

    velocitySensor.isArrowVisibleProperty.linkAttribute( this.arrowShape, 'visible' );

    // update the velocity node position
    velocitySensor.positionProperty.link( function( position ) {
      var velocitySensorXPosition = modelViewTransform.modelToViewX( position.x );
      var velocitySensorYPosition = modelViewTransform.modelToViewY( position.y );
      velocitySensorNode.setTranslation( velocitySensorXPosition, velocitySensorYPosition );
    } );

    // Update the text when the value or units changes.
    Property.multilink( [ velocitySensor.valueProperty, velocitySensor.positionProperty ],
      function( velocity ) {

        // add '?' for null velocity
        if ( velocity.magnitude() === 0 ) {
          labelText.text = '?';
        }
        else {
          var text = StringUtils.format( velocityPattern, Util.toFixed( velocity.magnitude() / BendingLightConstants.SPEED_OF_LIGHT, 2 ), c_units );
          labelText.setText( text );
        }
        labelText.center = whiteTextArea.center;
      } );
    this.bodyNode.setScaleMagnitude( SCALE_INSIDE_TOOLBOX );
  }

  return inherit( Node, VelocitySensorNode );
} );