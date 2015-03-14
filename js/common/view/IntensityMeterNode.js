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
    var intensityMeterScaleOutSideContainer = 1;
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
    var sensorNode = new Node( { children: [ sensorOuterShape, sensorInnerShape, sensorInnerCircle ] } );

    // sensor location
    intensityMeter.sensorPositionProperty.link( function( location ) {
      var sensorViewPoint = modelViewTransform.modelToViewPosition( location );
      sensorNode.setTranslation( sensorViewPoint.x - (sensorNode.getWidth() * sensorNode.getScaleVector().x / 2), sensorViewPoint.y - sensorNode.getHeight() * 0.32 * sensorNode.getScaleVector().y / 2 );
    } );

    // sensor node drag handler
    var start;
    var isFromSensorPanel;
    var isToSensorPanel;
    sensorNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        isFromSensorPanel = false;
        isToSensorPanel = false;
        start = intensityMeterNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          intensityMeterNode.setIntensityMeterScale( intensityMeterScaleOutSideContainer );
          isFromSensorPanel = true;
          var initialPosition = modelViewTransform.modelToViewPosition( intensityMeter.sensorPosition );
          intensityMeterNode.dragAll( start.minus( initialPosition ) );
          //start = modelViewTransform.modelToViewPosition( intensityMeter.sensorPosition );
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
          intensityMeterNode.setIntensityMeterScale( intensityMeterScaleInSideContainer );
          intensityMeterNode.intensityMeter.reset();
        }
      }
    } ) );

    // add body node
    var rectangleWidth = 150;
    var rectangleHeight = 110;

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

    var bodyNode = new Node( { children: [ outerRectangle, innerRectangle, innerMostRectangle, titleNode, valueNode ] } );
    titleNode.setTranslation( (bodyNode.getWidth() - titleNode.getWidth()) / 2,
      bodyNode.getHeight() * 0.25 );

    // displayed value
    intensityMeter.readingProperty.link( function() {
      valueNode.setText( intensityMeter.reading.getString() );
      valueNode.setTranslation( innerMostRectangle.centerX - valueNode.width / 2, innerMostRectangle.centerY + valueNode.height / 2 );
    } );

    intensityMeter.bodyPositionProperty.link( function( location ) {
      bodyNode.setTranslation( modelViewTransform.modelToViewPosition( location ) );
    } );

    // drag handler
    bodyNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        isFromSensorPanel = false;
        isToSensorPanel = false;
        start = intensityMeterNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          intensityMeterNode.setIntensityMeterScale( intensityMeterScaleOutSideContainer );
          isFromSensorPanel = true;
          var initialPosition = modelViewTransform.modelToViewPosition( intensityMeter.bodyPosition );
          intensityMeterNode.dragAll( start.minus( initialPosition ) );
          //start = modelViewTransform.modelToViewPosition( intensityMeter.bodyPosition );
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
          intensityMeterNode.setIntensityMeterScale( intensityMeterScaleInSideContainer );
          intensityMeterNode.intensityMeter.reset();
        }
      }
    } ) );
    this.sensorNode = sensorNode;
    this.bodyNode = bodyNode;
    intensityMeterNode.setIntensityMeterScale( intensityMeterScaleInSideContainer );
    //Connect the sensor to the body with a gray wire
    this.wireNode = new WireNode( intensityMeter.sensorPositionProperty, intensityMeter.bodyPositionProperty, sensorNode, bodyNode, 'gray' );
    this.addChild( this.wireNode );
    this.addChild( sensorNode );
    this.addChild( bodyNode );
  }

  return inherit( Node, IntensityMeterNode, {
    setIntensityMeterScale: function( scale ) {
      this.bodyNode.setScaleMagnitude( scale );
      this.sensorNode.setScaleMagnitude( scale );
      var sensorViewPoint = this.modelViewTransform.modelToViewPosition( this.intensityMeter.sensorPosition );
      this.sensorNode.setTranslation( sensorViewPoint.x - (this.sensorNode.getWidth() * this.sensorNode.getScaleVector().x / 2),
        sensorViewPoint.y - (this.sensorNode.getHeight() * 0.32 * this.sensorNode.getScaleVector().x) );
      this.bodyNode.setTranslation( this.modelViewTransform.modelToViewPosition( this.intensityMeter.bodyPosition ) );
    },
    /**
     * Drag all components, called when dragging from toolbox
     * @param {Vector2}delta
     */
    dragAll: function( delta ) {
      this.doTranslate( this.modelViewTransform.viewToModelDelta( delta ) );
    },
    /**
     *
     * @param {Vector2}delta
     */
    dragSensor: function( delta ) {
      this.intensityMeter.translateSensor( this.modelViewTransform.viewToModelDelta( delta ) );
    },
    /**
     *
     * @param {Vector2}delta
     */
    dragBody: function( delta ) {
      this.intensityMeter.translateBody( this.modelViewTransform.viewToModelDelta( delta ) );
    },
    /**
     *
     * @param {Vector2}delta
     */
    doTranslate: function( delta ) {
      this.intensityMeter.translateAll( delta );
    }

  } );

} );

