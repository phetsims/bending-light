// Copyright 2002-2011, University of Colorado
/**
 * Piccolo node for the intensity meter, including its movable sensor and readout region (called the body).
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


  // strings
  var intensityString = require( 'string!BENDING_LIGHT/intensity' );

  //images
  var probeImage = require( 'image!BENDING_LIGHT/intensity_meter_probe.png' );
  var intensityMeterBoxImage = require( 'image!BENDING_LIGHT/intensity_meter_box.png' );

  /**
   * Create the probe that can intercept the light
   *
   * @param intensityMeterNode
   * @param {IntensityMeter} intensityMeter
   * @param {ModelViewTransform2} modelViewTransform
   * @param containerBounds
   * @constructor
   */
  function SensorNode( intensityMeterNode, intensityMeter, modelViewTransform, containerBounds ) {

    var sensorNode = this;
    Node.call( sensorNode, { cursor: 'pointer' } );

    var probeNode = new Image( probeImage, { scale: 0.8 } );
    // sensor location
    intensityMeter.sensorPositionProperty.link( function( location ) {
      var sensorViewPoint = modelViewTransform.modelToViewPosition( location );
      sensorNode.setTranslation( sensorViewPoint.x - probeNode.getWidth() / 2, sensorViewPoint.y - probeNode.getHeight() * 0.32 );
    } );

    // drag handler
    this.addInputListener( new MovableDragHandler( {
        locationProperty: intensityMeter.sensorPositionProperty
      }, modelViewTransform,
      {
        startDrag: function() {
          if ( containerBounds.intersectsBounds( Bounds2.rect( modelViewTransform.modelToViewX( intensityMeter.sensorPosition.x ), modelViewTransform.modelToViewY( intensityMeter.sensorPosition.y ),
              sensorNode.height, sensorNode.width ) ) ) {
            //  intensityMeterNode.scale( 2 );
            intensityMeterNode.bodyNode.moveToFront();
            sensorNode.moveToFront();
          }
          else {
            sensorNode.moveToFront();
          }
        },
        endDrag: function() {
          // check intersection only with the outer rectangle.
          if ( containerBounds.intersectsBounds( Bounds2.rect( modelViewTransform.modelToViewX( intensityMeter.sensorPosition.x ), modelViewTransform.modelToViewY( intensityMeter.sensorPosition.y ),
              sensorNode.height, sensorNode.width ) ) ) {
            intensityMeter.sensorPosition.reset();
            intensityMeter.bodyPosition.reset();
            // intensityMeterNode.scale( 0.5 );
            sensorNode.moveToBack();
          }
        }
      } ) );
    sensorNode.addChild( probeNode );

  }

  inherit( Node, SensorNode );

  /**
   * Create the body that reads out the intercepted light
   *
   * @param intensityMeterNode
   * @param {IntensityMeter} intensityMeter
   * @param {ModelViewTransform2} modelViewTransform
   * @param containerBounds
   * @constructor
   */
  function BodyNode( intensityMeterNode, intensityMeter, modelViewTransform, containerBounds ) {

    var bodyNode = this;
    Node.call( bodyNode, {
      cursor: 'pointer'
    } );

    var intensityMeterBoxNode = new Image( intensityMeterBoxImage, { scale: 0.8 } );

    //Add a "Intensity" title to the body node
    var titleNode = new Text( intensityString,
      { font: new PhetFont( 12 ), fill: 'white' } );
    titleNode.setTranslation( intensityMeterBoxNode.getWidth() / 2 - titleNode.getWidth() / 2,
      intensityMeterBoxNode.getHeight() * 0.3 );

    //Add the reading to the body node
    var valueNode = new Text( intensityMeter.reading.getString(),
      { font: new PhetFont( 25 ), fill: 'black' } );
    valueNode.setTranslation( intensityMeterBoxNode.getWidth() / 2 - valueNode.getWidth() / 2,
      intensityMeterBoxNode.getHeight() * 0.64 );

    this.addChild( intensityMeterBoxNode );
    this.addChild( titleNode );
    this.addChild( valueNode );

    // displayed value
    intensityMeter.readingProperty.link( function() {
      //Todo:set intensity meter  reading correctly
      //  valueNode.setText( intensityMeter.reading.getString() );
    } );

    intensityMeter.bodyPositionProperty.link( function( location ) {
      bodyNode.setTranslation( modelViewTransform.modelToViewPosition( location ) );
    } );
    intensityMeterNode.scale( 0.4 );

    // drag handler
    this.addInputListener( new MovableDragHandler( {
        locationProperty: intensityMeter.bodyPositionProperty
      }, modelViewTransform,
      {
        startDrag: function() {
          if ( containerBounds.intersectsBounds( Bounds2.rect( modelViewTransform.modelToViewX( intensityMeter.bodyPosition.x ), modelViewTransform.modelToViewY( intensityMeter.bodyPosition.y ),
              bodyNode.height, bodyNode.width ) ) ) {
            intensityMeterNode.scale( 2 );
            bodyNode.moveToFront();
            intensityMeterNode.sensorNode.moveToFront();
          }
          else {
            bodyNode.moveToFront();
          }
        },
        endDrag: function() {
          // check intersection only with the outer rectangle.
          if ( containerBounds.intersectsBounds( Bounds2.rect( modelViewTransform.modelToViewX( intensityMeter.bodyPosition.x ), modelViewTransform.modelToViewY( intensityMeter.bodyPosition.y ),
              bodyNode.height, bodyNode.width ) ) ) {
            intensityMeter.bodyPosition.reset();
            intensityMeter.sensorPosition.reset();
            intensityMeterNode.scale( 0.5 );
            bodyNode.moveToBack();
          }
        }
      } ) );
  }

  inherit( Node, BodyNode );

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

    intensityMeter.enabledProperty.link( function() {
      intensityMeterNode.setVisible( intensityMeter.enabled );
    } );

    this.sensorNode = new SensorNode( this, intensityMeter, modelViewTransform, containerBounds );
    this.bodyNode = new BodyNode( this, intensityMeter, modelViewTransform, containerBounds );

    //Connect the sensor to the body with a gray wire
    this.addChild( new WireNode( intensityMeter, this.sensorNode, this.bodyNode, 'gray' ) );
    intensityMeterNode.addChild( this.bodyNode );
    intensityMeterNode.addChild( this.sensorNode );


  }

  return inherit( Node, IntensityMeterNode, {

    /**
     * Drag all components, called when dragging from toolbox
     * @param delta
     */
    dragAll: function( delta ) {
      this.doTranslate( transform.viewToModelDelta( delta ) );
    },
    /**
     * Get the components that could be dropped back in the toolbox
     * @returns {Node}
     */
    getDroppableComponents: function() {
      return new Node( { children: [ bodyNode, sensorNode ] } );
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

