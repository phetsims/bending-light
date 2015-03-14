// Copyright 2002-2015, University of Colorado
/**
 * PNode for the wave sensor, which shows 2 sensor probes and a chart area (the body)
 *
 * @author Sam Reid
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var WireNode = require( 'BENDING_LIGHT/common/view/WireNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // strings
  var TIME = require( 'string!BENDING_LIGHT/time' );

  //images
  var darkProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_dark.png' );
  var lightProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_light.png' );

  /**
   * Class for rendering a probe that can be used to sense wave values
   *
   * @param waveSensorNode
   * @param probe
   * @param imageName
   * @param {ModelViewTransform2} modelViewTransform
   * @param containerBounds
   * @constructor
   */
  function ProbeNode( waveSensorNode, probe, imageName, modelViewTransform, containerBounds ) {

    var probeNode = this;
    Node.call( this );

    //add the probe
    this.addChild( new Image( imageName, { scale: 0.8 } ) );

    //Interaction: translates when dragged, but keep it bounded within the play area
    var start;
    var fromSensorPanel;
    var toSensorPanel;
    probeNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        fromSensorPanel = false;
        toSensorPanel = false;
        start = waveSensorNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds.bounds.intersectsBounds( waveSensorNode.getBounds() ) ) {
          fromSensorPanel = true;
          var initialPosition = modelViewTransform.modelToViewPosition( waveSensorNode.waveSensor.probe1.positionProperty.get() );
          waveSensorNode.dragAll( start.minus( initialPosition ) );
        }
        else {
          fromSensorPanel = false;
        }
      },
      drag: function( event ) {
        var end = waveSensorNode.globalToParentPoint( event.pointer.point );
        if ( fromSensorPanel ) {
          waveSensorNode.dragAll( end.minus( start ) );
        }
        else {
          probe.translate( modelViewTransform.viewToModelDelta( end.minus( start ) ) );
        }
        start = end;
      },
      end: function() {
        // check intersection only with the outer rectangle.
        if ( containerBounds.bounds.intersectsBounds( waveSensorNode.getBounds() ) ) {
          toSensorPanel = true;
        }
        if ( toSensorPanel ) {
          waveSensorNode.waveSensor.reset();
        }
      }
    } ) );

    probe.positionProperty.link( function( position ) {
      var viewPoint = modelViewTransform.modelToViewPosition( position );
      probeNode.setTranslation( viewPoint.x - probeNode.getWidth() / 2, viewPoint.y - probeNode.getHeight() / 2 );
    } );
  }

  inherit( Node, ProbeNode, {} );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param waveSensor
   * @param containerBounds
   * @constructor
   */

  function WaveSensorNode( modelViewTransform, waveSensor, containerBounds ) {

    var waveSensorNode = this;
    Node.call( this );

    //color taken from the image
    var darkProbeColor = new Color( 88, 89, 91 );
    var lightProbeColor = new Color( 147, 149, 152 );

    this.modelViewTransform = modelViewTransform;
    this.waveSensor = waveSensor;
    this.containerBounds = containerBounds;

    //Bounds are based on the provided images, and will need to be updated if the image changes
    //var chartArea = new Rectangle( 15, 15, 131, 68 );

    //Create the body where the chart is shown
    // add body node
    var rectangleWidth = 135;
    var rectangleHeight = 100;
    // adding outer rectangle
    var outerRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 5, 5, {
      stroke: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#2F9BCE' )
        .addColorStop( 1, '#00486A' ),
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#5EB4DE' )
        .addColorStop( 1, '#005B86' ),
      lineWidth: 2
    } );
    //second rectangle
    var innerRectangle = new Rectangle( 0, 0, rectangleWidth - 5, rectangleHeight - 10, 0, 0, {
      fill: '#0078B0',
      stroke: '#0081BE',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );
    // adding inner rectangle
    var innerMostRectangle = new ShadedRectangle( new Bounds2( 10, 0, rectangleWidth * 0.98, rectangleHeight * 0.63 ),
      {
        baseColor: 'white',
        lightSource: 'rightBottom',
        centerX: innerRectangle.centerX,
        centerY: rectangleHeight * 0.4,
        cornerRadius: 5
      } );
    var bodyNode = new Node( { children: [ outerRectangle, innerRectangle, innerMostRectangle ], scale: 0.93 } );

    //Add the "time" axis label at the bottom center of the chart
    var titleNode = new Text( TIME, {
      font: new PhetFont( 18 ),
      fill: 'white'
    } );
    bodyNode.addChild( titleNode );
    titleNode.setTranslation( bodyNode.getCenterX() - titleNode.getWidth() / 2, bodyNode.height * 0.82 );

    //this.setScaleDown( 0.5 );

    //Add the chart inside the body, with one series for each of the dark and light probes
    /*    this.addChild( new ChartNode( waveSensor.clock, chartArea, [ new Series( waveSensor.probe1.series, darkProbeColor ),
     new Series( waveSensor.probe2.series, lightProbeColor ) ] ) );*/
    //Synchronize the body position with the model (centered on the model point)
    waveSensor.bodyPosition.link( function( position ) {
      var viewPoint = modelViewTransform.modelToViewPosition( position );
      bodyNode.setTranslation( viewPoint.x - bodyNode.getWidth() / 2, viewPoint.y - bodyNode.getHeight() );
    } );
    //Add interaction, the body is draggable, but keep it constrained to stay in the play area
    var start;
    var fromSensorPanel;
    var toSensorPanel;
    bodyNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        fromSensorPanel = false;
        toSensorPanel = false;
        start = waveSensorNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds.bounds.intersectsBounds( waveSensorNode.getBounds() ) ) {
          fromSensorPanel = true;
          var initialPosition = modelViewTransform.modelToViewPosition( waveSensorNode.waveSensor.probe1.positionProperty.get() );
          waveSensorNode.dragAll( start.minus( initialPosition ) );
        }
        else {
          fromSensorPanel = false;
        }
      },
      drag: function( event ) {
        var end = waveSensorNode.globalToParentPoint( event.pointer.point );
        if ( fromSensorPanel ) {
          waveSensorNode.dragAll( end.minus( start ) );
        }
        else {
          waveSensorNode.dragBody( end.minus( start ) );
        }
        start = end;
      },
      end: function() {
        // check intersection only with the outer rectangle.
        if ( containerBounds.bounds.intersectsBounds( waveSensorNode.getBounds() ) ) {
          toSensorPanel = true;
        }
        if ( toSensorPanel ) {
          waveSensor.reset();
        }
      }
    } ) );

    //Create the probes
    var probe1Node = new ProbeNode( this, waveSensor.probe1, darkProbeImage, modelViewTransform, containerBounds );
    var probe2Node = new ProbeNode( this, waveSensor.probe2, lightProbeImage, modelViewTransform, containerBounds );

    //Rendering order, including wires
    this.addChild( new WireNode( waveSensor.probe1.positionProperty, waveSensor.bodyPosition, probe1Node, bodyNode, darkProbeColor ) );
    this.addChild( new WireNode( waveSensor.probe2.positionProperty, waveSensor.bodyPosition, probe2Node, bodyNode, lightProbeColor ) );
    this.addChild( bodyNode );
    this.addChild( probe1Node );
    this.addChild( probe2Node );
  }

  return inherit( Node, WaveSensorNode, {
    /**
     * Called when dragged out of the toolbox, drags all parts together (including body and probes)
     * @param delta
     */
    dragAll: function( delta ) {
      this.waveSensor.translateAll( this.modelViewTransform.viewToModelDelta( delta ) );
    },
    /**
     *
     * @param delta
     */
    dragBody: function( delta ) {
      this.waveSensor.translateBody( this.modelViewTransform.viewToModelDelta( delta ) );
    }
  } );
} );
