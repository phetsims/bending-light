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
  var ChartNode = require( 'BENDING_LIGHT/more-tools/view/ChartNode' );
  var Series = require( 'BENDING_LIGHT/more-tools/model/Series' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );

  // strings
  var timeString = require( 'string!BENDING_LIGHT/time' );

  // images
  var darkProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_dark.png' );
  var lightProbeImage = require( 'image!BENDING_LIGHT/wave_detector_probe_light.png' );

  // constants
  var waveSensorNodeScaleInSideContainer = 0.33;
  var waveSensorNodeScaleOutSideContainer = 1;

  /**
   * View for rendering a probe that can be used to sense wave values
   *
   * @param {WaveSensorNode} waveSensorNode
   * @param {Probe} probe
   * @param {string} probeImageName
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Rectangle} container
   * @param {Bounds2} dragBounds - bounds that define where the probe may be dragged
   * @constructor
   */
  function ProbeNode( waveSensorNode, probe, probeImageName, modelViewTransform, container, dragBounds ) {

    var probeNode = this;
    Node.call( this, { cursor: 'pointer' } );

    // Add the probe
    this.addChild( new Image( probeImageName, { scale: 0.8 } ) );

    var probeDragBounds = modelViewTransform.viewToModelBounds( dragBounds ); // in model co-ordinates

    // Interaction: Translates when dragged, but keep it bounded within the play area
    var start;
    var position;
    probeNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = waveSensorNode.globalToParentPoint( event.pointer.point );
      },
      drag: function( event ) {
        var end = waveSensorNode.globalToParentPoint( event.pointer.point );
        probe.translateXY( modelViewTransform.viewToModelDeltaX( end.x - start.x ),
          modelViewTransform.viewToModelDeltaY( end.y - start.y ) );
        position = probeDragBounds.closestPointTo( probe.position );
        probe.positionProperty.set( position );
        start = end;
      },
      end: function() {
        // Check intersection only with the outer rectangle.
        if ( container.bounds.containsPoint( probeNode.center ) ) {
          var probeInitialPosition = waveSensorNode.waveSensor.probe1.positionProperty.initialValue;
          waveSensorNode.setWaveSensorNodeScaleAnimation(
            probeInitialPosition.x, probeInitialPosition.y, waveSensorNodeScaleInSideContainer );
          waveSensorNode.reset();
          waveSensorNode.waveSensor.visibleProperty.set( false );
          waveSensorNode.addToSensorPanel();
        }
      }
    } ) );

    // Probe location
    probe.positionProperty.link( function( position ) {
      var probePositionX = modelViewTransform.modelToViewX( position.x );
      var probePositionY = modelViewTransform.modelToViewY( position.y );
      probeNode.setTranslation( probePositionX - probeNode.getWidth() / 2, probePositionY - probeNode.getHeight() / 2 );
    } );
  }

  inherit( Node, ProbeNode );

  /**
   *
   * @param {MoreToolsView} moreToolsView
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {WaveSensor} waveSensor - model for the wave sensor
   * @param {Rectangle} container
   * @param {Bounds2} dragBounds - bounds that define where the waves sensor  may be dragged
   * @constructor
   */
  function WaveSensorNode( moreToolsView, modelViewTransform, waveSensor, container, dragBounds ) {

    var waveSensorNode = this;
    Node.call( this, { cursor: 'pointer' } );

    // Color taken from the image
    var darkProbeColor = new Color( 88, 89, 91 );
    var lightProbeColor = new Color( 147, 149, 152 );

    this.modelViewTransform = modelViewTransform;
    this.waveSensor = waveSensor;
    this.moreToolsView = moreToolsView;
    var waveSensorDragBounds = modelViewTransform.viewToModelBounds( dragBounds ); // in model co-ordinates
    // Add body node
    var rectangleWidth = 135;
    var rectangleHeight = 100;

    // Adding outer rectangle
    var outerRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 5, 5, {
      stroke: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#2F9BCE' )
        .addColorStop( 1, '#00486A' ),
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#5EB4DE' )
        .addColorStop( 1, '#005B86' ),
      lineWidth: 2
    } );

    // Second rectangle
    var innerRectangle = new Rectangle( 0, 0, rectangleWidth - 5, rectangleHeight - 10, 0, 0, {
      fill: '#0078B0',
      stroke: '#0081BE',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );
    // Adding inner rectangle
    var innerMostRectangle = new ShadedRectangle( new Bounds2( 10, 0, rectangleWidth * 0.98, rectangleHeight * 0.63 ),
      {
        baseColor: 'white',
        lightSource: 'rightBottom',
        centerX: innerRectangle.centerX,
        centerY: rectangleHeight * 0.4,
        cornerRadius: 5
      } );
    this.bodyNode = new Node( { children: [ outerRectangle, innerRectangle, innerMostRectangle ], scale: 0.93 } );

    // Add the "time" axis label at the bottom center of the chart
    var titleNode = new Text( timeString, { font: new PhetFont( 18 ), fill: 'white' } );
    if ( titleNode.width > rectangleWidth - 15 ) {
      titleNode.scale( (rectangleWidth - 15) / titleNode.width );
    }
    this.bodyNode.addChild( titleNode );
    titleNode.setTranslation( this.bodyNode.getCenterX() - titleNode.getWidth() / 2, this.bodyNode.height * 0.82 );

    // Add the chart inside the body, with one series for each of the dark and light probes
    this.chartNode = new ChartNode( innerMostRectangle.bounds.erode( 3 ),
      [ new Series( waveSensor.probe1.seriesProperty, darkProbeColor ),
        new Series( waveSensor.probe2.seriesProperty, lightProbeColor ) ] );
    this.bodyNode.addChild( this.chartNode );

    //Synchronize the body position with the model (centered on the model point)
    waveSensor.bodyPositionProperty.link( function( position ) {
      var waveSensorBodyPositionX = modelViewTransform.modelToViewX( position.x );
      var waveSensorBodyPositionY = modelViewTransform.modelToViewY( position.y );
      waveSensorNode.bodyNode.setTranslation( waveSensorBodyPositionX - waveSensorNode.bodyNode.getWidth() / 2,
        waveSensorBodyPositionY - waveSensorNode.bodyNode.getHeight() / 2 );
    } );

    // Add interaction, the body is draggable, but keep it constrained to stay in the play area
    var start;
    var position;
    this.bodyNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = waveSensorNode.globalToParentPoint( event.pointer.point );
      },
      drag: function( event ) {
        var end = waveSensorNode.globalToParentPoint( event.pointer.point );
        waveSensorNode.dragBodyXY( end.x - start.x, end.y - start.y );
        position = waveSensorDragBounds.closestPointTo( waveSensor.bodyPositionProperty.get() );
        waveSensor.bodyPositionProperty.set( position );
        start = end;
      },
      end: function() {
        // Check intersection only with the outer rectangle.
        if ( container.bounds.containsCoordinates(
            waveSensorNode.bodyNode.getCenterX(), waveSensorNode.bodyNode.getCenterY() ) ) {
          var probeInitialPosition = waveSensor.probe1.positionProperty.initialValue;
          waveSensorNode.setWaveSensorNodeScaleAnimation(
            probeInitialPosition.x, probeInitialPosition.y, waveSensorNodeScaleInSideContainer );
          waveSensorNode.reset();
          waveSensor.visibleProperty.set( false );
          waveSensorNode.addToSensorPanel();
        }
      }
    } ) );

    // Create the probes
    this.probe1Node = new ProbeNode( this, waveSensor.probe1, darkProbeImage, modelViewTransform, container,
      dragBounds );
    this.probe2Node = new ProbeNode( this, waveSensor.probe2, lightProbeImage, modelViewTransform, container,
      dragBounds );

    this.setWaveSensorScale( waveSensorNodeScaleInSideContainer );

    // Rendering order, including wires
    this.addChild( new WireNode( waveSensor.probe1.positionProperty, waveSensor.bodyPositionProperty,
      this.probe1Node, this.bodyNode, darkProbeColor.toCSS() ) );
    this.addChild( new WireNode( waveSensor.probe2.positionProperty, waveSensor.bodyPositionProperty,
      this.probe2Node, this.bodyNode, lightProbeColor.toCSS() ) );
    this.addChild( this.bodyNode );
    this.addChild( this.probe1Node );
    this.addChild( this.probe2Node );
    this.waveSensorBodyNewPosition = new Vector2();
    this.probe2NewPosition = new Vector2();


    this.shape = new Path( Shape.rectangle( 20, 335, 85, 45 ), {
      pickable: true,
      cursor: 'pointer'
    } );
    this.addChild( this.shape );

    this.shape.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = waveSensorNode.globalToParentPoint( event.pointer.point );
        waveSensorNode.setWaveSensorNodeScaleAnimation( modelViewTransform.viewToModelX( start.x ),
          modelViewTransform.viewToModelY( start.y ), waveSensorNodeScaleOutSideContainer );
        waveSensor.visibleProperty.set( true );
        waveSensorNode.addMoreToolsView();
      },
      drag: function( event ) {
        var end = waveSensorNode.globalToParentPoint( event.pointer.point );
        waveSensorNode.dragAllXY( end.x - start.x, end.y - start.y );
        var probe1Position = waveSensorNode.waveSensor.probe1.position;
        position = waveSensorDragBounds.closestPointTo( probe1Position );
        waveSensorNode.waveSensor.translateAllXY( position.x - probe1Position.x, position.y - probe1Position.y );
        var probe2Position = waveSensorNode.waveSensor.probe2.position;
        position = waveSensorDragBounds.closestPointTo( probe2Position );
        waveSensorNode.waveSensor.translateAllXY( position.x - probe2Position.x, position.y - probe2Position.y );
        var bodyPosition = waveSensorNode.waveSensor.bodyPositionProperty.get();
        position = waveSensorDragBounds.closestPointTo( bodyPosition );
        waveSensorNode.waveSensor.translateAllXY( position.x - bodyPosition.x, position.y - bodyPosition.y );
        start = end;
      },
      end: function() {
        // Check intersection only with the outer rectangle.
        if ( container.bounds.containsCoordinates( waveSensorNode.bodyNode.getCenterX(), waveSensorNode.bodyNode.getCenterY() ) ||
             container.bounds.containsCoordinates( waveSensorNode.probe1Node.getCenterX(), waveSensorNode.probe1Node.getCenterY() ) ||
             container.bounds.containsCoordinates( waveSensorNode.probe2Node.getCenterX(), waveSensorNode.probe2Node.getCenterY() ) ) {
          var probeInitialPosition = waveSensor.probe1.positionProperty.initialValue;
          waveSensorNode.setWaveSensorNodeScaleAnimation(
            probeInitialPosition.x, probeInitialPosition.y, waveSensorNodeScaleInSideContainer );
          waveSensorNode.reset();
          waveSensor.visibleProperty.set( false );
          waveSensorNode.addToSensorPanel();
        }
      }
    } ) );
    waveSensor.visibleProperty.link( function( visible ) {
      waveSensorNode.shape.setVisible( !visible );
    } );
  }

  return inherit( Node, WaveSensorNode, {

    /**
     * @public
     * @param {number} scale
     */
    setWaveSensorScale: function( scale ) {
      //Scaling all components and translating
      this.bodyNode.setScaleMagnitude( scale );
      this.probe1Node.setScaleMagnitude( scale );
      this.probe2Node.setScaleMagnitude( scale );

      this.bodyNode.setTranslation(
        this.modelViewTransform.modelToViewX( this.waveSensor.bodyPositionProperty.get().x ) - this.bodyNode.width / 2,
        this.modelViewTransform.modelToViewY( this.waveSensor.bodyPositionProperty.get().y ) - this.bodyNode.height / 2 );

      this.probe1Node.setTranslation(
        this.modelViewTransform.modelToViewX( this.waveSensor.probe1.position.x ) - this.probe1Node.getWidth() / 2,
        this.modelViewTransform.modelToViewY( this.waveSensor.probe1.position.y ) - this.probe1Node.getHeight() / 2 );

      this.probe2Node.setTranslation(
        this.modelViewTransform.modelToViewX( this.waveSensor.probe2.position.x ) - this.probe2Node.getWidth() / 2,
        this.modelViewTransform.modelToViewY( this.waveSensor.probe2.position.y ) - this.probe2Node.getHeight() / 2 );
    },

    /**
     * Resize the WaveSensorNode
     * @public
     * @param {number} endPositionX
     * @param {number} endPositionY
     * @param {number} scale
     */
    setWaveSensorNodeScale: function( endPositionX, endPositionY, scale ) {

      // Previous scale for scaling the distance among probeNodes and bodyNode
      var prevScale = this.bodyNode.getScaleVector().x;

      // Scaling all components
      this.bodyNode.setScaleMagnitude( scale );
      this.probe1Node.setScaleMagnitude( scale );
      this.probe2Node.setScaleMagnitude( scale );

      var delta1X = this.waveSensor.probe1.position.x * ( 1 - scale / prevScale ) +
                    this.waveSensor.bodyPositionProperty.get().x * scale / prevScale;
      var delta1Y = this.waveSensor.probe1.position.y * ( 1 - scale / prevScale ) +
                    this.waveSensor.bodyPositionProperty.get().y * scale / prevScale;
      this.waveSensorBodyNewPosition.setXY( delta1X, delta1Y );
      this.waveSensor.bodyPositionProperty.set( this.waveSensorBodyNewPosition );
      this.waveSensor.bodyPositionProperty._notifyObservers();

      var delta2X = this.waveSensor.probe1.position.x * ( 1 - scale / prevScale ) +
                    this.waveSensor.probe2.position.x * scale / prevScale;
      var delta2Y = this.waveSensor.probe1.position.y * ( 1 - scale / prevScale ) +
                    this.waveSensor.probe2.position.y * scale / prevScale;
      this.probe2NewPosition.setXY( delta2X, delta2Y );
      this.waveSensor.probe2.positionProperty.set( this.probe2NewPosition );
      this.waveSensor.probe2.positionProperty._notifyObservers();

      this.waveSensor.translateAllXY( endPositionX - this.waveSensor.probe1.position.x,
        endPositionY - this.waveSensor.probe1.position.y );
    },

    /**
     * Resize the WaveSensorNode with Animation
     * @private
     * @param {number} endPositionX
     * @param {number} endPositionY
     * @param {number} scale
     */
    setWaveSensorNodeScaleAnimation: function( endPositionX, endPositionY, scale ) {
      var prevScale = this.bodyNode.getScaleVector().x;
      var startPoint = {
        x: this.waveSensor.probe1.position.x, y: this.waveSensor.probe1.position.y,
        scale: prevScale
      };
      var endPoint = { x: endPositionX, y: endPositionY, scale: scale };
      this.init( startPoint, endPoint );
    },

    /**
     * @private
     * @param {Object} startPoint
     * @param {Object} endPoint
     */
    init: function( startPoint, endPoint ) {
      var target = this;
      new TWEEN.Tween( startPoint )
        .to( endPoint, 100 )
        .easing( TWEEN.Easing.Linear.None )
        .onUpdate( function() {
          target.setWaveSensorNodeScale( startPoint.x, startPoint.y, startPoint.scale );
        } ).start();
    },

    /**
     * @public
     */
    addMoreToolsView: function() {

      if ( this.moreToolsView.beforeLightLayer2.isChild( this ) ) {
        this.moreToolsView.beforeLightLayer2.removeChild( this );
      }

      if ( !this.moreToolsView.afterLightLayer2.isChild( this ) ) {
        this.moreToolsView.afterLightLayer2.addChild( this );
      }
      this.touchArea = null;
      this.probe1Node.touchArea = this.probe1Node.localBounds;
      this.probe2Node.touchArea = this.probe2Node.localBounds;
      this.bodyNode.touchArea = this.bodyNode.localBounds;
    },

    /**
     * @public
     */
    addToSensorPanel: function() {

      if ( this.moreToolsView.afterLightLayer2.isChild( this ) ) {
        this.moreToolsView.afterLightLayer2.removeChild( this );
      }
      if ( !this.moreToolsView.beforeLightLayer2.isChild( this ) ) {
        this.moreToolsView.beforeLightLayer2.addChild( this );
      }
      this.touchArea = this.shape.bounds;
      this.probe1Node.touchArea = null;
      this.probe2Node.touchArea = null;
      this.bodyNode.touchArea = null;
    },

    /**
     * Called when dragged out of the toolbox, drags all parts together (including body and probes)
     * @private
     * @param {number} deltaX
     * @param {number} deltaY
     */
    dragAllXY: function( deltaX, deltaY ) {
      this.waveSensor.translateAllXY( this.modelViewTransform.viewToModelDeltaX( deltaX ),
        this.modelViewTransform.viewToModelDeltaY( deltaY ) );
    },

    /**
     * Drag bodyNode
     * @private
     * @param {number} deltaX
     * @param {number} deltaY
     */
    dragBodyXY: function( deltaX, deltaY ) {
      this.waveSensor.translateBodyXY( this.modelViewTransform.viewToModelDeltaX( deltaX ),
        this.modelViewTransform.viewToModelDeltaY( deltaY ) );
    },

    /**
     * @public
     */
    reset: function() {
      this.setWaveSensorScale( waveSensorNodeScaleInSideContainer );
      this.chartNode.gridPoints.clear();
      if ( this.moreToolsView.afterLightLayer2.isChild( this ) ) {
        this.addToSensorPanel();
      }
      this.waveSensor.reset();
    }
  } );
} );