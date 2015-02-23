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
    this.modelViewTransform = modelViewTransform;
    this.intensityMeter = intensityMeter;
    intensityMeter.enabledProperty.link( function() {
      intensityMeterNode.setVisible( intensityMeter.enabled );
    } );
    intensityMeterNode.setScaleMagnitude( 0.3 );

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
      sensorNode.setTranslation( sensorViewPoint.x - sensorNode.getWidth() / 2, sensorViewPoint.y - sensorNode.getHeight() * 0.32 );
    } );

    // sensor node drag handler
    var start;
    var fromSensorPanel;
    var toSensorPanel;
    sensorNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        fromSensorPanel = false;
        toSensorPanel = false;
        start = sensorNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          intensityMeterNode.setScaleMagnitude( 1 );
          fromSensorPanel = true;
          var initialPosition = modelViewTransform.modelToViewPosition( intensityMeter.sensorPosition );
          intensityMeterNode.dragAll( start.minus( initialPosition ) );
        }
        else {
          fromSensorPanel = false;
        }
      },
      drag: function( event ) {
        var end = sensorNode.globalToParentPoint( event.pointer.point );
        if ( fromSensorPanel ) {
          intensityMeterNode.dragAll( end.minus( start ) );
        }
        else {
          intensityMeterNode.dragSensor( end.minus( start ) );
        }
        start = end;
      },
      end: function( event ) {
        // check intersection only with the outer rectangle.
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          toSensorPanel = true;
        }
        if ( toSensorPanel ) {
          intensityMeterNode.setScaleMagnitude( 0.3 );
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
      //Todo:set intensity meter  reading correctly
      //  valueNode.setText( intensityMeter.reading.getString() );
    } );

    intensityMeter.bodyPositionProperty.link( function( location ) {
      bodyNode.setTranslation( modelViewTransform.modelToViewPosition( location ) );
    } );

    // drag handler
    bodyNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        fromSensorPanel = false;
        toSensorPanel = false;
        start = bodyNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          intensityMeterNode.setScaleMagnitude( 1 );
          fromSensorPanel = true;
          var initialPosition = modelViewTransform.modelToViewPosition( intensityMeter.sensorPosition );
          intensityMeterNode.dragAll( start.minus( initialPosition ) );
        }
        else {
          fromSensorPanel = false;
        }
      },
      drag: function( event ) {
        var end = bodyNode.globalToParentPoint( event.pointer.point );
        if ( fromSensorPanel ) {
          intensityMeterNode.dragAll( end.minus( start ) );
        }
        else {
          intensityMeterNode.dragBody( end.minus( start ) );
        }
        start = end;
      },
      end: function( event ) {
        // check intersection only with the outer rectangle.
        if ( containerBounds.intersectsBounds( intensityMeterNode.getBounds() ) ) {
          toSensorPanel = true;
        }
        if ( toSensorPanel ) {
          intensityMeterNode.setScaleMagnitude( 0.3 );
          intensityMeterNode.intensityMeter.reset();
        }
      }
    } ) );
    //Connect the sensor to the body with a gray wire
    this.addChild( new WireNode( intensityMeter, sensorNode, bodyNode, 'gray' ) );
    this.addChild( sensorNode );
    this.addChild( bodyNode );
  }

  return inherit( Node, IntensityMeterNode, {

    /**
     * Drag all components, called when dragging from toolbox
     * @param delta
     */
    dragAll: function( delta ) {
      this.doTranslate( this.modelViewTransform.viewToModelDelta( delta ) );
    },
    /**
     *
     * @param delta
     */
    dragSensor: function( delta ) {
      this.intensityMeter.translateSensor( this.modelViewTransform.viewToModelDelta( delta ) );
    },
    /**
     *
     * @param delta
     */
    dragBody: function( delta ) {
      this.intensityMeter.translateBody( this.modelViewTransform.viewToModelDelta( delta ) );
    },
    /**
     *
     * @param delta
     */
    doTranslate: function( delta ) {
      this.intensityMeter.translateAll( delta );
    }

  } );

} );

