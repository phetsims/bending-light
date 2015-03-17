// Copyright 2002-2015, University of Colorado
/**
 * View for the intensity meter, including its movable sensor
 * and readout region (called the body).
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var WireNode = require( 'BENDING_LIGHT/common/view/WireNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Vector2 = require( 'DOT/Vector2' );


  // strings
  var intensityString = require( 'string!BENDING_LIGHT/intensity' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param {IntensityMeter} intensityMeter
   * @param containerBounds
   * @constructor
   */
  function IntensityMeterNode( modelViewTransform, intensityMeter, containerBounds ) {

    var intensityMeterNode = this;
    Node.call( intensityMeterNode );
    var intensityMeterScaleInSideContainer = 0.3;
    var intensityMeterScaleOutSideContainer = 0.85;
    this.modelViewTransform = modelViewTransform;
    this.intensityMeter = intensityMeter;
    intensityMeter.enabledProperty.link( function() {
      intensityMeterNode.setVisible( intensityMeter.enabled );
    } );

    // add sensor node
    var sensorShape = new Shape()
      .ellipticalArc( 50, 50, 50, 50, 0, Math.PI * 0.8, Math.PI * 0.2, false )
      .quadraticCurveTo( 84, 87, 82, 100 )
      .quadraticCurveTo( 81, 115, 80, 130 )
      .quadraticCurveTo( 80, 151, 65, 151 )
      .quadraticCurveTo( 50, 151, 35, 151 )
      .quadraticCurveTo( 20, 151, 20, 130 )
      .quadraticCurveTo( 19, 115, 18, 100 )
      .quadraticCurveTo( 16, 87, 11, 82 )
      .close();
    var sensorOuterShape = new Path( sensorShape, {
      stroke: new LinearGradient( 0, 0, 0, 151 )
        .addColorStop( 0, '#408260' )
        .addColorStop( 1, '#005D2D' ),
      fill: new LinearGradient( 0, 0, 0, 151 )
        .addColorStop( 0, '#7CCAA2' )
        .addColorStop( 0.3, '#009348' )
        .addColorStop( 1, '#008B44' ),
      lineWidth: 2
    } );

    var sensorInnerShape = new Path( sensorShape, {
      fill: '#008541',
      lineWidth: 2,
      scale: new Vector2( 0.9, 0.93 ),
      centerX: sensorOuterShape.centerX,
      y: 5
    } );
    var sensorInnerCircle = new Path( new Shape().circle( 50, 50, 35 ), {
      fill: new RadialGradient( 35, 17.5, 0, 35, 70, 60 )
        .addColorStop( 0, 'white' )
        .addColorStop( 0.4, '#E6F5FF' )
        .addColorStop( 1, '#C2E7FF' ),
      centerX: sensorInnerShape.centerX,
      centerY: 50
    } );
    this.sensorNode = new Node( { children: [ sensorOuterShape, sensorInnerShape, sensorInnerCircle ], cursor: 'pointer' } );
    this.sensorHeight = this.sensorNode.height;
    this.sensorWidth = this.sensorNode.width;

    // sensor location
    intensityMeter.sensorPositionProperty.link( function( location ) {
      var sensorViewPoint = modelViewTransform.modelToViewPosition( location );
      intensityMeterNode.sensorNode.setTranslation(
        sensorViewPoint.x - (intensityMeterNode.sensorWidth * intensityMeterNode.sensorNode.getScaleVector().x / 2),
        sensorViewPoint.y - intensityMeterNode.sensorHeight * 0.32 * intensityMeterNode.sensorNode.getScaleVector().y );
    } );

    // sensor node drag handler
    var start;
    var isFromSensorPanel;
    var isToSensorPanel;
    this.sensorNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        isFromSensorPanel = false;
        isToSensorPanel = false;
        start = intensityMeterNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          intensityMeterNode.setIntensityMeterScaleAnimation( modelViewTransform.viewToModelPosition( start ), intensityMeterScaleOutSideContainer );
          intensityMeterNode.setIntensityMeterScale( modelViewTransform.viewToModelPosition( start ), intensityMeterScaleOutSideContainer );
          isFromSensorPanel = true;
        }
        else {
          isFromSensorPanel = false;
        }
      },
      drag: function( event ) {
        var end = intensityMeterNode.globalToParentPoint( event.pointer.point );
        if ( isFromSensorPanel ) {
          intensityMeterNode.dragAll( end.minus( start ) );
        }
        else {
          intensityMeterNode.dragSensor( end.minus( start ) );
        }
        start = end;
      },
      end: function() {
        // check intersection only with the outer rectangle.
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          isToSensorPanel = true;
        }
        if ( isToSensorPanel ) {
          intensityMeterNode.setIntensityMeterScaleAnimation( intensityMeter.sensorPositionProperty.initialValue, intensityMeterScaleInSideContainer );
          intensityMeterNode.setIntensityMeterScale( intensityMeter.sensorPositionProperty.initialValue, intensityMeterScaleInSideContainer );
          intensityMeterNode.intensityMeter.reset();
        }
      }
    } ) );

    // add body node
    var rectangleWidth = 150;
    var rectangleHeight = 105;

    // adding outer rectangle
    var outerRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 5, 5, {
      stroke: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#408260' )
        .addColorStop( 1, '#005127' ),
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#06974C' )
        .addColorStop( 0.6, '#00773A' ),
      lineWidth: 2
    } );

    //second rectangle
    var innerRectangle = new Rectangle( 2, 2, rectangleWidth - 10, rectangleHeight - 10, 5, 5, {
      fill: '#008541',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY

    } );

    // adding inner rectangle
    var innerMostRectangle = new ShadedRectangle( new Bounds2( 10, 0, rectangleWidth * 0.8, rectangleHeight * 0.5 ),
      {
        baseColor: 'white',
        lightSource: 'rightBottom',
        centerX: innerRectangle.centerX,
        centerY: rectangleHeight * 0.6
      } );

    //Add a "Intensity" title to the body node
    var titleNode = new Text( intensityString,
      { font: new PhetFont( 16 ), fill: 'white' } );
    //Add the reading to the body node
    var valueNode = new Text( intensityMeter.reading.getString(),
      { font: new PhetFont( 25 ), fill: 'black' } );

    this.bodyNode = new Node( { children: [ outerRectangle, innerRectangle, innerMostRectangle, titleNode, valueNode ], cursor: 'pointer' } );
    titleNode.setTranslation( (this.bodyNode.getWidth() - titleNode.getWidth()) / 2,
      this.bodyNode.getHeight() * 0.25 );

    // displayed value
    intensityMeter.readingProperty.link( function() {
      valueNode.setText( intensityMeter.reading.getString() );
      valueNode.setTranslation( innerMostRectangle.centerX - valueNode.width / 2, innerMostRectangle.centerY + valueNode.height / 2 );
    } );

    //body location
    intensityMeter.bodyPositionProperty.link( function( location ) {
      intensityMeterNode.bodyNode.setTranslation( modelViewTransform.modelToViewPosition( location ) );
    } );

    // body drag handler
    this.bodyNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        isFromSensorPanel = false;
        isToSensorPanel = false;
        start = intensityMeterNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          intensityMeterNode.setIntensityMeterScaleAnimation( modelViewTransform.viewToModelPosition( start ), intensityMeterScaleOutSideContainer );
          intensityMeterNode.setIntensityMeterScale( modelViewTransform.viewToModelPosition( start ), intensityMeterScaleOutSideContainer );
          isFromSensorPanel = true;
        }
        else {
          isFromSensorPanel = false;
        }
      },
      drag: function( event ) {
        var end = intensityMeterNode.globalToParentPoint( event.pointer.point );
        if ( isFromSensorPanel ) {
          intensityMeterNode.dragAll( end.minus( start ) );
        }
        else {
          intensityMeterNode.dragBody( end.minus( start ) );
        }
        start = end;
      },
      end: function() {
        // check intersection only with the outer rectangle.
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          isToSensorPanel = true;
        }
        if ( isToSensorPanel ) {
          intensityMeterNode.setIntensityMeterScaleAnimation( intensityMeter.sensorPositionProperty.initialValue, intensityMeterScaleInSideContainer );
          intensityMeterNode.setIntensityMeterScale( intensityMeter.sensorPositionProperty.initialValue, intensityMeterScaleInSideContainer );
          intensityMeterNode.intensityMeter.reset();
        }
      }
    } ) );
    //scale sensorNode and bodyNode and translating
    this.bodyNode.setScaleMagnitude( intensityMeterScaleInSideContainer );
    this.sensorNode.setScaleMagnitude( intensityMeterScaleInSideContainer );
    var sensorViewPoint = this.modelViewTransform.modelToViewPosition( this.intensityMeter.sensorPosition );
    this.sensorNode.setTranslation( sensorViewPoint.x - (this.sensorWidth * this.sensorNode.getScaleVector().x / 2),
      sensorViewPoint.y - (this.sensorHeight * 0.32 * this.sensorNode.getScaleVector().x) );
    this.bodyNode.setTranslation( this.modelViewTransform.modelToViewPosition( this.intensityMeter.bodyPosition ) );

    //Connect the sensor to the body with a gray wire
    this.wireNode = new WireNode( intensityMeter.sensorPositionProperty, intensityMeter.bodyPositionProperty, this.sensorNode, this.bodyNode, 'gray' );

    //add the components
    this.addChild( this.wireNode );
    this.addChild( this.sensorNode );
    this.addChild( this.bodyNode );
  }

  return inherit( Node, IntensityMeterNode, {
    /**
     * Resize the intensityMeterNode
     * @param endPosition
     * @param scale
     */
    setIntensityMeterScale: function( endPosition, scale ) {
      //previous scale for scaling the distance between the sensorNode and bodyNode
      var prevScale = this.sensorNode.getScaleVector().x;
      this.bodyNode.setScaleMagnitude( scale );
      this.sensorNode.setScaleMagnitude( scale );
      this.intensityMeter.bodyPositionProperty.set( new Vector2(
        this.intensityMeter.sensorPosition.x + this.intensityMeter.bodyPosition.minus(
          this.intensityMeter.sensorPosition ).x * scale / prevScale, this.intensityMeter.sensorPosition.y ) );
      this.intensityMeter.translateAll( endPosition.minus( this.intensityMeter.sensorPosition ) );

    },
    /**
     * Resize the intensityMeterNode with Animation
     * @param endPosition
     * @param scale
     */
    setIntensityMeterScaleAnimation: function( endPosition, scale ) {
      var prevScale = this.sensorNode.getScaleVector().x;
      var startPoint = { x: this.intensityMeter.sensorPosition.x, y: this.intensityMeter.sensorPosition.y, scale: prevScale };
      var endPoint = { x: endPosition.x, y: endPosition.y, scale: scale };
      this.init( startPoint, endPoint );
    },
    /**
     *
     * @param startPoint
     * @param endPoint
     */
    init: function( startPoint, endPoint ) {
      var target = this;
      new TWEEN.Tween( startPoint )
        .to( endPoint, 100 )
        .easing( TWEEN.Easing.Quadratic.InOut )
        .onUpdate( function() {
          target.setIntensityMeterScale( new Vector2( startPoint.x, startPoint.y ), startPoint.scale );
        } ).start();
    },
    /**
     * Drag all components, called when dragging from toolbox
     * @param {Vector2}delta
     */
    dragAll: function( delta ) {
      this.intensityMeter.translateAll( this.modelViewTransform.viewToModelDelta( delta ) );
    },
    /**
     * Drag sensorNode
     * @param {Vector2}delta
     */
    dragSensor: function( delta ) {
      this.intensityMeter.translateSensor( this.modelViewTransform.viewToModelDelta( delta ) );
    },
    /**
     * Drag bodyNode
     * @param {Vector2}delta
     */
    dragBody: function( delta ) {
      this.intensityMeter.translateBody( this.modelViewTransform.viewToModelDelta( delta ) );
    }
  } );

} );
