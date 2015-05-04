// Copyright 2002-2015, University of Colorado Boulder
/**
 * View for the wave sensor, which shows 2 sensor probes and a chart area (the body)
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni (Actual Concepts)
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
  var Vector2 = require( 'DOT/Vector2' );
  var ChartNode = require( 'BENDING_LIGHT/moretools/view/ChartNode' );
  var Series = require( 'BENDING_LIGHT/moretools/model/Series' );
  var ConstraintBounds = require( 'BENDING_LIGHT/common/ConstraintBounds' );

  // strings
  var timeString = require( 'string!BENDING_LIGHT/time' );

  //images
  var darkProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_dark.png' );
  var lightProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_light.png' );

  var waveSensorNodeScaleInSideContainer = 0.33;

  /**
   * View for rendering a probe that can be used to sense wave values
   *
   * @param {WaveSensorNode} waveSensorNode
   * @param probe
   * @param {string} imageName
   * @param {ModelViewTransform2} modelViewTransform , Transform between model and view coordinate frames
   * @param {Rectangle} container
   * @param {Bounds2} dragBounds - bounds that define where the probe   may be dragged
   * @constructor
   */
  function ProbeNode( waveSensorNode, probe, imageName, modelViewTransform, container, dragBounds ) {

    var probeNode = this;
    Node.call( this, { cursor: 'pointer' } );

    // add the probe
    this.addChild( new Image( imageName, { scale: 0.8 } ) );

    // interaction: translates when dragged, but keep it bounded within the play area
    var start;
    var fromSensorPanel;
    var toSensorPanel;
    var position;
    probeNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        fromSensorPanel = false;
        toSensorPanel = false;
        start = waveSensorNode.globalToParentPoint( event.pointer.point );
        if ( container.bounds.containsPoint( probeNode.center ) ) {
          fromSensorPanel = true;
          waveSensorNode.setWaveSensorNodeScaleAnimation( modelViewTransform.viewToModelPosition( start ), 1 );
          waveSensorNode.setWaveSensorNodeScale( modelViewTransform.viewToModelPosition( start ), 1 );
          waveSensorNode.waveSensor.visibleProperty.set( true );
          waveSensorNode.addMoreToolsView();
        }
        else {
          fromSensorPanel = false;
        }
      },
      drag: function( event ) {
        var end = waveSensorNode.globalToParentPoint( event.pointer.point );
        if ( fromSensorPanel ) {
          waveSensorNode.dragAll( end.minus( start ) );
          position = ConstraintBounds.constrainLocation( waveSensorNode.waveSensor.probe1.position,
            modelViewTransform.viewToModelBounds( dragBounds ) );
          waveSensorNode.waveSensor.translateAll( position.minus( waveSensorNode.waveSensor.probe1.position ) );
        }
        else {
          probe.translate( modelViewTransform.viewToModelDelta( end.minus( start ) ) );
          position = ConstraintBounds.constrainLocation( probe.position,
            modelViewTransform.viewToModelBounds( dragBounds ) );
          probe.positionProperty.set( position );
        }
        start = end;
      },
      end: function() {
        // check intersection only with the outer rectangle.
        if ( container.bounds.containsPoint( probeNode.center ) ) {
          toSensorPanel = true;
          waveSensorNode.waveSensor.visibleProperty.set( false );
          waveSensorNode.addToSensorPanel();
        }
        if ( toSensorPanel ) {
          waveSensorNode.setWaveSensorNodeScaleAnimation(
            waveSensorNode.waveSensor.probe1.positionProperty.initialValue, waveSensorNodeScaleInSideContainer );
          waveSensorNode.setWaveSensorNodeScale( waveSensorNode.waveSensor.probe1.positionProperty.initialValue, waveSensorNodeScaleInSideContainer );
          waveSensorNode.reset();
        }
      }
    } ) );

    // probe location
    probe.positionProperty.link( function( position ) {
      var viewPoint = modelViewTransform.modelToViewPosition( position );
      probeNode.setTranslation( viewPoint.x - probeNode.getWidth() / 2, viewPoint.y - probeNode.getHeight() / 2 );
    } );
    this.touchArea = this.localBounds;
  }

  inherit( Node, ProbeNode, {} );

  /**
   *
   * @param {MoreToolsView} moreToolsView
   * @param {ModelViewTransform2} modelViewTransform , Transform between model and view coordinate frames
   * @param {WaveSensor} waveSensor  - model for the wave sensor
   * @param {Rectangle} container
   * @param {Bounds2} dragBounds - bounds that define where the waves sensor  may be dragged
   * @constructor
   */
  function WaveSensorNode( moreToolsView, modelViewTransform, waveSensor, container, dragBounds ) {

    var waveSensorNode = this;
    Node.call( this, { cursor: 'pointer' } );

    //color taken from the image
    var darkProbeColor = new Color( 88, 89, 91 );
    var lightProbeColor = new Color( 147, 149, 152 );

    this.modelViewTransform = modelViewTransform;
    this.waveSensor = waveSensor;
    this.moreToolsView = moreToolsView;

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

    // second rectangle
    var innerRectangle = new Rectangle( 0, 0, rectangleWidth - 5, rectangleHeight - 10, 0, 0, {
      fill: '#0078B0',
      stroke: '#0081BE',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );
    // adding inner rectangle
    var innerMostRectangle = new ShadedRectangle(
      new Bounds2( 10, 0, rectangleWidth * 0.98, rectangleHeight * 0.63 ),
      {
        baseColor: 'white',
        lightSource: 'rightBottom',
        centerX: innerRectangle.centerX,
        centerY: rectangleHeight * 0.4,
        cornerRadius: 5
      } );
    this.bodyNode = new Node( { children: [ outerRectangle, innerRectangle, innerMostRectangle ], scale: 0.93 } );

    // add the "time" axis label at the bottom center of the chart
    var titleNode = new Text( timeString, {
      font: new PhetFont( 18 ),
      fill: 'white'
    } );
    this.bodyNode.touchArea = this.bodyNode.localBounds;
    this.bodyNode.addChild( titleNode );
    titleNode.setTranslation( this.bodyNode.getCenterX() - titleNode.getWidth() / 2, this.bodyNode.height * 0.82 );

    // add the chart inside the body, with one series for each of the dark and light probes
    this.chartNode = new ChartNode( innerMostRectangle.bounds.erode( 3 ),
      [ new Series( waveSensor.probe1.seriesProperty, darkProbeColor ),
        new Series( waveSensor.probe2.seriesProperty, lightProbeColor ) ] );
    this.bodyNode.addChild( this.chartNode );
    //Synchronize the body position with the model (centered on the model point)
    waveSensor.bodyPositionProperty.link( function( position ) {
      var viewPoint = modelViewTransform.modelToViewPosition( position );
      waveSensorNode.bodyNode.setTranslation( viewPoint.x - waveSensorNode.bodyNode.getWidth() / 2,
        viewPoint.y - waveSensorNode.bodyNode.getHeight() );
    } );

    // add interaction, the body is draggable, but keep it constrained to stay in the play area
    var start;
    var fromSensorPanel;
    var toSensorPanel;
    var position;
    this.bodyNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        fromSensorPanel = false;
        toSensorPanel = false;
        start = waveSensorNode.globalToParentPoint( event.pointer.point );
        if ( container.bounds.containsPoint( waveSensorNode.bodyNode.center ) ) {
          fromSensorPanel = true;
          waveSensorNode.setWaveSensorNodeScaleAnimation( modelViewTransform.viewToModelPosition( start ), 1 );
          waveSensorNode.setWaveSensorNodeScale( modelViewTransform.viewToModelPosition( start ), 1 );
          waveSensor.visibleProperty.set( true );
          waveSensorNode.addMoreToolsView();
        }
        else {
          fromSensorPanel = false;
        }
      },
      drag: function( event ) {
        var end = waveSensorNode.globalToParentPoint( event.pointer.point );
        if ( fromSensorPanel ) {
          waveSensorNode.dragAll( end.minus( start ) );
          position = ConstraintBounds.constrainLocation( waveSensor.probe1.position,
            modelViewTransform.viewToModelBounds( dragBounds ) );
          waveSensor.translateAll( position.minus( waveSensorNode.waveSensor.probe1.position ) );
        }
        else {
          waveSensorNode.dragBody( end.minus( start ) );
          position = ConstraintBounds.constrainLocation( waveSensor.bodyPositionProperty.get(),
            modelViewTransform.viewToModelBounds( dragBounds ) );
          waveSensor.bodyPositionProperty.set( position );
        }
        start = end;
      },
      end: function() {
        // check intersection only with the outer rectangle.
        if ( container.bounds.containsPoint( waveSensorNode.bodyNode.center ) ||
             container.bounds.containsPoint( waveSensorNode.probe1Node.center ) ||
             container.bounds.containsPoint( waveSensorNode.probe2Node.center ) ) {
          toSensorPanel = true;
          waveSensor.visibleProperty.set( false );
          waveSensorNode.addToSensorPanel();
        }
        if ( toSensorPanel ) {
          waveSensorNode.setWaveSensorNodeScaleAnimation( waveSensor.probe1.positionProperty.initialValue, waveSensorNodeScaleInSideContainer );
          waveSensorNode.setWaveSensorNodeScale( waveSensor.probe1.positionProperty.initialValue, waveSensorNodeScaleInSideContainer );
          waveSensorNode.reset();
        }
      }
    } ) );

    // create the probes
    this.probe1Node = new ProbeNode( this, waveSensor.probe1, darkProbeImage, modelViewTransform, container, dragBounds );
    this.probe2Node = new ProbeNode( this, waveSensor.probe2, lightProbeImage, modelViewTransform, container, dragBounds );

    this.setWaveSensorScale( waveSensorNodeScaleInSideContainer );

    // rendering order, including wires
    this.addChild( new WireNode( waveSensor.probe1.positionProperty, waveSensor.bodyPositionProperty,
      this.probe1Node, this.bodyNode, darkProbeColor ) );
    this.addChild( new WireNode( waveSensor.probe2.positionProperty, waveSensor.bodyPositionProperty,
      this.probe2Node, this.bodyNode, lightProbeColor ) );
    this.addChild( this.bodyNode );
    this.addChild( this.probe1Node );
    this.addChild( this.probe2Node );
  }

  return inherit( Node, WaveSensorNode, {

    /**
     *
     * @param {number} scale
     */
    setWaveSensorScale: function( scale ) {
      //scaling all components and translating
      this.bodyNode.setScaleMagnitude( scale );
      this.probe1Node.setScaleMagnitude( scale );
      this.probe2Node.setScaleMagnitude( scale );
      this.bodyNode.setTranslation(
        this.modelViewTransform.modelToViewPosition( this.waveSensor.bodyPositionProperty.get() ).x - this.bodyNode.width / 2,
        this.modelViewTransform.modelToViewPosition( this.waveSensor.bodyPositionProperty.get() ).y - this.bodyNode.height );
      this.probe1Node.setTranslation(
        this.modelViewTransform.modelToViewPosition( this.waveSensor.probe1.position ).x - this.probe1Node.getWidth() / 2,
        this.modelViewTransform.modelToViewPosition( this.waveSensor.probe1.position ).y - this.probe1Node.getHeight() / 2 );
      this.probe2Node.setTranslation(
        this.modelViewTransform.modelToViewPosition( this.waveSensor.probe2.position ).x - this.probe2Node.getWidth() / 2,
        this.modelViewTransform.modelToViewPosition( this.waveSensor.probe2.position ).y - this.probe2Node.getHeight() / 2 );

    },

    /**
     * resize the WaveSensorNode
     *
     * @param {Vector2} endPosition
     * @param {number} scale
     */
    setWaveSensorNodeScale: function( endPosition, scale ) {

      // previous scale for scaling the distance among probeNodes and bodyNode
      var prevScale = this.bodyNode.getScaleVector().x;

      // scaling all components
      this.bodyNode.setScaleMagnitude( scale );
      this.probe1Node.setScaleMagnitude( scale );
      this.probe2Node.setScaleMagnitude( scale );

      var delta1 = this.waveSensor.bodyPositionProperty.get().minus(
        this.waveSensor.probe1.position ).multiply( scale / prevScale );
      this.waveSensor.bodyPositionProperty.set( new Vector2(
        this.waveSensor.probe1.position.x + delta1.x, this.waveSensor.probe1.position.y + delta1.y ) );

      var delta2 = this.waveSensor.probe2.position.minus(
        this.waveSensor.probe1.position ).multiply( scale / prevScale );
      this.waveSensor.probe2.positionProperty.set( new Vector2(
        this.waveSensor.probe1.position.x + delta2.x, this.waveSensor.probe1.position.y + delta2.y ) );

      this.waveSensor.translateAll( endPosition.minus( this.waveSensor.probe1.position ) );
    },

    /**
     * resize the WaveSensorNode with Animation
     *
     * @param {Vector2} endPosition
     * @param {number} scale
     */
    setWaveSensorNodeScaleAnimation: function( endPosition, scale ) {
      var prevScale = this.bodyNode.getScaleVector().x;
      var startPoint = {
        x: this.waveSensor.probe1.position.x, y: this.waveSensor.probe1.position.y,
        scale: prevScale
      };
      var endPoint = { x: endPosition.x, y: endPosition.y, scale: scale };
      this.init( startPoint, endPoint );
    },

    /**
     *
     * @param {Object} startPoint
     * @param {Object} endPoint
     */
    init: function( startPoint, endPoint ) {
      var target = this;
      new TWEEN.Tween( startPoint )
        .to( endPoint, 100 )
        .easing( TWEEN.Easing.Linear.None )
        .onUpdate( function() {
          target.setWaveSensorNodeScale( new Vector2( startPoint.x, startPoint.y ), startPoint.scale );
        } ).start();
    },

    /**
     * @public
     */
    addMoreToolsView: function() {
      this.moreToolsView.beforeLightLayer2.removeChild( this );
      this.moreToolsView.afterLightLayer2.addChild( this );
    },

    addToSensorPanel: function() {
      this.moreToolsView.afterLightLayer2.removeChild( this );
      this.moreToolsView.beforeLightLayer2.addChild( this );
    },

    /**
     * called when dragged out of the toolbox, drags all parts together (including body and probes)
     *
     * @param {Vector2} delta
     */
    dragAll: function( delta ) {
      this.waveSensor.translateAll( this.modelViewTransform.viewToModelDelta( delta ) );
    },

    /**
     *  drag bodyNode
     *
     * @param {Vector2} delta
     */
    dragBody: function( delta ) {
      this.waveSensor.translateBody( this.modelViewTransform.viewToModelDelta( delta ) );
    },

    /**
     * @public
     */
    reset: function() {
      this.setWaveSensorScale( waveSensorNodeScaleInSideContainer );
      this.waveSensor.reset();
      this.waveSensor.visibleProperty.set( false );
      this.chartNode.gridPoints.clear();
      if ( this.moreToolsView.afterLightLayer2.isChild( this ) ) {
        this.addToSensorPanel();
      }
    }
  } );
} );
