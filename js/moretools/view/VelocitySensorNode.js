// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the Velocity Sensor tool. Measures the velocity at the sensor's tip and shows it in the display box.
 * Also points a blue arrow along the direction of the velocity and the arrow length is proportional to the velocity.
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Util = require( 'DOT/Util' );
  var ConstraintBounds = require( 'BENDING_LIGHT/common/ConstraintBounds' );

  // strings
  var speedString = require( 'string!BENDING_LIGHT/speed' );
  var c_units = require( 'string!BENDING_LIGHT/c_units' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform , Transform between model and view coordinate frames
   * @param {VelocitySensor} velocitySensor - model for the velocity sensor
   * @param arrowScale
   * @param {Rectangle} container
   * @param {Bounds2} dragBounds - bounds that define where the velocity sensor   may be dragged
   * @constructor
   */
  function VelocitySensorNode( modelViewTransform, velocitySensor, arrowScale, container, dragBounds ) {

    var velocitySensorNode = this;
    Node.call( this, { cursor: 'pointer', pickable: true } );
    this.modelViewTransform = modelViewTransform;
    this.velocitySensor = velocitySensor;

    var rectangleWidth = 100;
    var rectangleHeight = 70;

    // adding outer rectangle
    var outerRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 10, 10, {
      stroke: '#DC9E24',
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#E9AA35' )
        .addColorStop( 0.5, '#C88214' )
        .addColorStop( 1, '#C07D03' ),
      lineWidth: 1
    } );
    this.addChild( outerRectangle );

    //second rectangle
    var innerRectangle = new Rectangle( 0, 0, rectangleWidth - 8, rectangleHeight - 10, 10, 10, {
      fill: '#C98303',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );
    this.addChild( innerRectangle );

    // adding velocity meter title text
    var titleText = new Text( speedString,
      {
        fill: 'black',
        font: new PhetFont( 18 ),
        centerX: innerRectangle.centerX,
        top: innerRectangle.top + 2
      } );
    this.addChild( titleText );

    // adding inner rectangle
    var innerMostRectangle = new ShadedRectangle( new Bounds2( 10, 0, rectangleWidth - 20, rectangleHeight - 38 ),
      {
        baseColor: 'white',
        lightSource: 'rightBottom',
        centerX: innerRectangle.centerX,
        bottom: innerRectangle.bottom - 5
      } );
    this.addChild( innerMostRectangle );

    // adding velocity measure label
    var labelText = new Text( '',
      { fill: 'black', font: new PhetFont( 12 ), center: innerMostRectangle.center } );
    this.addChild( labelText );

    var triangleWidth = 30;
    var triangleHeight = 16;

    // adding triangle shape
    var triangleShapeNode = new Path( new Shape()
      .moveTo( innerRectangle.centerX - triangleWidth / 2, innerMostRectangle.y + 1 )
      .lineTo( innerRectangle.centerX, triangleHeight + innerMostRectangle.y + 1 )
      .lineTo( innerRectangle.centerX + triangleWidth / 2, innerMostRectangle.y + 1 ), {
      fill: '#C88203',
      stroke: '#937133',
      top: outerRectangle.bottom - 1
    } );
    this.addChild( triangleShapeNode );

    // arrow shape
    var arrowWidth = 6;
    this.arrowShape = new Path( new ArrowShape( 0, 0, modelViewTransform.modelToViewDeltaX( velocitySensor.value.x ),
      modelViewTransform.modelToViewDeltaY( velocitySensor.value.y ) ), { fill: 'blue' } );
    this.addChild( this.arrowShape );

    velocitySensor.valueProperty.link( function( velocity ) {
      var pos = modelViewTransform.modelToViewDelta( velocitySensor.value ).times( arrowScale );
      this.arrowShape.setShape( new ArrowShape( 0, 0, pos.x, pos.y,
        { tailWidth: arrowWidth, headWidth: 2 * arrowWidth, headHeight: 2 * arrowWidth } ) );

      // set the arrowShape path position so that the center of the tail coincides with the tip of the sensor
      if ( this.arrowShape.bounds.isFinite() ) {
        // if the velocity y component is positive then the arrow will face up,
        // so set the bottom of the arrow to the tip of the sensor
        if ( velocity.y >= 0 ) {
          this.arrowShape.bottom = triangleShapeNode.bottom +
                                   arrowWidth / 2 * Math.cos( Math.abs( velocity.angle() ) );
        }
        else {
          // if the velocity y component is negative then the arrow will face down,
          // so set the top of the arrow to the tip of the sensor
          this.arrowShape.top = triangleShapeNode.bottom -
                                arrowWidth / 2 * Math.cos( Math.abs( velocity.angle() ) );
        }

        // if the velocity x component is positive then the arrow will direct towards right
        // so set the left of the arrow to the tip of the sensor
        if ( velocity.x > 0 ) {
          this.arrowShape.left = outerRectangle.centerX - arrowWidth / 2 * Math.sin( Math.abs( velocity.angle() ) );
        }
        else if ( velocity.x === 0 ) {
          this.arrowShape.left = outerRectangle.centerX - arrowWidth;
        }
        else {
          this.arrowShape.right = outerRectangle.centerX + arrowWidth / 2 * Math.sin( Math.abs( velocity.angle() ) );
        }
      }
    }.bind( velocitySensorNode ) );

    velocitySensor.isArrowVisibleProperty.linkAttribute( this.arrowShape, 'visible' );

    // drag handler
    //TODO : use MovableDragHandler instead  of SimpleDragHandler
    var start;
    this.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = velocitySensorNode.globalToParentPoint( event.pointer.point );
        if ( container.bounds.intersectsBounds( velocitySensorNode.getBounds() ) ) {
          velocitySensorNode.setScaleAnimation( modelViewTransform.viewToModelPosition( start ), 1 );
        }
      },
      drag: function( event ) {
        var end = velocitySensorNode.globalToParentPoint( event.pointer.point );
        end = ConstraintBounds.constrainLocation( end, dragBounds );
        velocitySensorNode.dragAll( end.minus( start ) );
        start = end;
      },
      end: function() {
        if ( container.bounds.intersectsBounds( velocitySensorNode.getBounds() ) ) {
          velocitySensorNode.setScaleAnimation( velocitySensor.positionProperty.initialValue, 0.7 );
          velocitySensor.reset();
        }
      }
    } ) );

    velocitySensor.positionProperty.link( function( position ) {
      var viewPosition = modelViewTransform.modelToViewPosition( position );
      velocitySensorNode.setTranslation( viewPosition.x - rectangleWidth / 2 * velocitySensorNode.getScaleVector().x,
        viewPosition.y - ( rectangleHeight + triangleHeight ) * velocitySensorNode.getScaleVector().y );
    } );
    // Update the text when the value or units changes.
    Property.multilink( [ velocitySensor.valueProperty, velocitySensor.positionProperty ],
      function( velocity, position ) {
        if ( velocity.magnitude() === 0 ) {
          labelText.text = '?';
        }
        else {
          labelText.text = Util.toFixedNumber( velocity.magnitude() / 2.99792458E8, 2 ) + " " + c_units;
        }
        labelText.center = innerMostRectangle.center;
      } );
    velocitySensorNode.setScaleMagnitude( 0.7 );
    var viewPosition = modelViewTransform.modelToViewPosition( velocitySensor.position );
    velocitySensorNode.setTranslation( viewPosition.x - rectangleWidth / 2 * velocitySensorNode.getScaleVector().x,
      viewPosition.y - ( rectangleHeight + triangleHeight ) * velocitySensorNode.getScaleVector().y );

  }

  return inherit( Node, VelocitySensorNode, {
    setScaleAnimation: function( endPoint, scale ) {
      var startPoint = { x: this.velocitySensor.position.x, y: this.velocitySensor.position.y, scale: this.getScaleVector().x };
      var finalPosition = { x: endPoint.x, y: endPoint.y, scale: scale };
      this.init( startPoint, finalPosition );
      // this.velocitySensor.positionProperty.set( this.modelViewTransform.viewToModelPosition( endPoint ) );
    },
    init: function( initialPosition, finalPosition ) {
      var target = this;
      new TWEEN.Tween( initialPosition )
        .to( finalPosition, 100 )
        .easing( TWEEN.Easing.Linear.None )
        .onUpdate( function() {
          target.setScaleMagnitude( initialPosition.scale );
          target.velocitySensor.positionProperty.set( new Vector2( initialPosition.x, initialPosition.y ) );
        } ).start();
    },
    dragAll: function( delta ) {
      this.velocitySensor.translate( this.modelViewTransform.viewToModelDelta( delta ) );
    }
  } );
} );
