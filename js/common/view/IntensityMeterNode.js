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
  var Image = require( 'SCENERY/nodes/Image' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var WireNode = require( 'BENDING_LIGHT/common/view/WireNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );


  // strings
  var intensityString = require( 'string!BENDING_LIGHT/intensity' );

  //images
  var probeImage = require( 'image!BENDING_LIGHT/intensity_meter_probe.png' );

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
    intensityMeter.enabledProperty.link( function() {
      intensityMeterNode.setVisible( intensityMeter.enabled );
    } );

    // add sensor node
    var sensorNode = new Image( probeImage, { scale: 0.8 } );
    // sensor location
    intensityMeter.sensorPositionProperty.link( function( location ) {
      var sensorViewPoint = modelViewTransform.modelToViewPosition( location );
      sensorNode.setTranslation( sensorViewPoint.x - sensorNode.getWidth() / 2, sensorViewPoint.y - sensorNode.getHeight() * 0.32 );
    } );

    // sensor node drag handler
    sensorNode.addInputListener( new MovableDragHandler( intensityMeter.sensorPositionProperty,
      {
        modelViewTransform: modelViewTransform,
        startDrag: function() {
          if ( containerBounds.intersectsBounds( Bounds2.rect(
              modelViewTransform.modelToViewX( intensityMeter.sensorPosition.x ),
              modelViewTransform.modelToViewY( intensityMeter.sensorPosition.y ),
              sensorNode.height, sensorNode.width ) ) ) {
            bodyNode.moveToFront();
            sensorNode.moveToFront();
          }
          else {
            sensorNode.moveToFront();
          }
        },
        endDrag: function() {
          // check intersection only with the outer rectangle.
          if ( containerBounds.intersectsBounds( Bounds2.rect(
              modelViewTransform.modelToViewX( intensityMeter.sensorPosition.x ),
              modelViewTransform.modelToViewY( intensityMeter.sensorPosition.y ),
              sensorNode.height, sensorNode.width ) ) ) {
            intensityMeter.resetAll();
            sensorNode.moveToBack();
          }
        }
      } ) );
    this.addChild( sensorNode );

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

    var bodyNode = new Node( { children: [ outerRectangle, innerRectangle, innerMostRectangle, titleNode, valueNode ], scale: 0.8 } );
    this.addChild( bodyNode );
    titleNode.setTranslation( bodyNode.getWidth() / 2 - titleNode.getWidth() / 2,
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
    bodyNode.addInputListener( new MovableDragHandler( intensityMeter.bodyPositionProperty,
      {
        modelViewTransform: modelViewTransform,
        startDrag: function() {
          if ( containerBounds.intersectsBounds( Bounds2.rect( modelViewTransform.modelToViewX( intensityMeter.bodyPosition.x ), modelViewTransform.modelToViewY( intensityMeter.bodyPosition.y ),
              bodyNode.height, bodyNode.width ) ) ) {
            bodyNode.moveToFront();
            sensorNode.moveToFront();
          }
          else {
            bodyNode.moveToFront();
          }
        },
        endDrag: function() {
          // check intersection only with the outer rectangle.
          if ( containerBounds.intersectsBounds( Bounds2.rect( modelViewTransform.modelToViewX( intensityMeter.bodyPosition.x ), modelViewTransform.modelToViewY( intensityMeter.bodyPosition.y ),
              bodyNode.height, bodyNode.width ) ) ) {
            intensityMeter.resetAll();
            bodyNode.moveToBack();
          }
        }
      } ) );

    //Connect the sensor to the body with a gray wire
    this.addChild( new WireNode( intensityMeter, sensorNode, bodyNode, 'gray' ) );


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
     * Get the components that could be dropped back in the toolbox
     * @returns {Node}
     */
    getDroppableComponents: function() {
      // return new Node( { children: [ bodyNode, sensorNode ] } );
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

