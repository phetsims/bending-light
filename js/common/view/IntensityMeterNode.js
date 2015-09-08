// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the intensity meter, including its movable sensor and readout region (called the body).
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
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
  var Vector2 = require( 'DOT/Vector2' );
  var TweenUtil = require( 'BENDING_LIGHT/common/view/TweenUtil' );
  var LightSensorNode = require( 'SCENERY_PHET/LightSensorNode' );

  // strings
  var intensityString = require( 'string!BENDING_LIGHT/intensity' );

  // constants
  var INTENSITY_METER_SCALE_INSIDE_TOOLBOX = 0.25;
  var INTENSITY_METER_SCALE_OUTSIDE_TOOLBOX = 0.85;

  /**
   * Drag handler for the body node and sensor node
   * @param {IntensityMeterNode} intensityMeterNode - intensity meter node
   * @param {Property.<Bounds2>} dragBoundsProperty - bounds that define where the intensity meter may be dragged
   * @param {function} getContainerBounds - bounds of container for intensity meter
   * @param {Node} draggableNode - node that has to be dragged
   * @param {Property.<Vector2>} modelPositionProperty - position of draggableNode in model coordinates
   * @param {function} dragSelfFunction - function for translating the draggableNode
   * @param {function} dragBothFunction - function for translating both the body and sensor together, used when dragged
   *                                    - out of the toolbox
   * @param {function} moveIntensityMeterToToolbox - function that puts the intensity meter in the correct place in the
   *                                               - toolbox (which can move when the screen aspect ratio changes)
   * @constructor
   */
  function DragHandler( intensityMeterNode, dragBoundsProperty, getContainerBounds, draggableNode,
                        modelPositionProperty, dragSelfFunction, dragBothFunction, moveIntensityMeterToToolbox ) {
    var start;
    var intensityMeter = intensityMeterNode.intensityMeter;
    var modelViewTransform = intensityMeterNode.modelViewTransform;
    var centerEndLocation = new Vector2();
    var travelingTogether = false;

    var options = {

      start: function( event ) {
        start = draggableNode.globalToParentPoint( event.pointer.point );

        if ( !intensityMeter.enabled ) {
          var sensorStartPositionX = modelViewTransform.viewToModelX( start.x );
          var sensorStartPositionY = modelViewTransform.viewToModelY( start.y );

          // Animate intensity meter to full size
          intensityMeterNode.setIntensityMeterScaleAnimation(
            sensorStartPositionX, sensorStartPositionY, INTENSITY_METER_SCALE_OUTSIDE_TOOLBOX );
          intensityMeterNode.setIntensityMeterScale(
            sensorStartPositionX, sensorStartPositionY, INTENSITY_METER_SCALE_OUTSIDE_TOOLBOX );

          // remove it from sensor panel and add it to play area
          intensityMeterNode.addToBendingLightView();
          intensityMeter.enabled = true;
          travelingTogether = true;
        }
      },
      drag: function( event ) {
        var end = draggableNode.globalToParentPoint( event.pointer.point );
        var startPositionX = modelViewTransform.modelToViewX( modelPositionProperty.get().x );
        var startPositionY = modelViewTransform.modelToViewY( modelPositionProperty.get().y );

        // location of final center point with out constraining to bounds
        centerEndLocation.setXY( startPositionX + end.x - start.x, startPositionY + end.y - start.y );

        // location of final center point with constraining to bounds
        var centerEndLocationInBounds = dragBoundsProperty.value.closestPointTo( centerEndLocation );
        if ( travelingTogether ) {
          dragBothFunction( intensityMeter, modelViewTransform, centerEndLocationInBounds.x - startPositionX, centerEndLocationInBounds.y - startPositionY );
        }
        else {
          dragSelfFunction( intensityMeter, modelViewTransform, centerEndLocationInBounds.x - startPositionX, centerEndLocationInBounds.y - startPositionY );
        }

        // Store the position of drag point after translating. Can be obtained by adding distance between center
        // point and drag point (end - centerEndLocation) to center point (centerEndLocationInBounds) after
        // translating.
        start.x = end.x + centerEndLocationInBounds.x - centerEndLocation.x;
        start.y = end.y + centerEndLocationInBounds.y - centerEndLocation.y;
      },
      end: function() {

        // check intersection only with the outer rectangle.
        if ( getContainerBounds().containsCoordinates( draggableNode.getCenterX(), draggableNode.getCenterY() ) ) {

          intensityMeter.reset();

          intensityMeterNode.setIntensityMeterScale(
            0, 0, INTENSITY_METER_SCALE_INSIDE_TOOLBOX
          );

          moveIntensityMeterToToolbox();

          // remove intensity meter from play area and add it to the sensor panel
          intensityMeterNode.addToToolBox();
        }
        travelingTogether = false;
      }
    };
    SimpleDragHandler.call( this, options );

    // adapters so the same drag functions can be used when dragging out of the toolbox
    this.start = function( event ) {
      options.start( event );
    };
    this.drag = function( event ) {
      options.drag( event );
    };
    this.end = function() {
      options.end();
    };
  }

  // Inherit from base class.
  inherit( SimpleDragHandler, DragHandler );

  /**
   * @param {Node} beforeLightLayer - layer in which intensity meter is present when in play area
   * @param {Node} beforeLightLayer2 - layer in which intensity meter is present when in toolbox
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {IntensityMeter} intensityMeter - model for the intensity meter
   * @param {function} getContainerBounds - bounds of container for intensity meter.  The panel floats around so
   *                                      - this must be a function.
   * @param {Property.<Bounds2>} dragBoundsProperty - bounds that define where the intensity meter may be dragged
   * @param {function} moveIntensityMeterToToolbox - function that puts the intensity meter in the correct place in the
   *                                               - toolbox (which can move when the screen aspect ratio changes)
   * @constructor
   */
  function IntensityMeterNode( beforeLightLayer, beforeLightLayer2, modelViewTransform, intensityMeter, getContainerBounds,
                               dragBoundsProperty, moveIntensityMeterToToolbox ) {

    var intensityMeterNode = this;
    Node.call( intensityMeterNode );
    this.modelViewTransform = modelViewTransform; // @public
    this.intensityMeter = intensityMeter;
    this.beforeLightLayer = beforeLightLayer; // @private
    this.beforeLightLayer2 = beforeLightLayer2; // @private

    this.sensorNode = new LightSensorNode( { cursor: 'pointer' } );

    // sensor location
    intensityMeter.sensorPositionProperty.link( function( location ) {
      var sensorPositionX = modelViewTransform.modelToViewX( location.x );
      var sensorPositionY = modelViewTransform.modelToViewY( location.y );
      intensityMeterNode.sensorNode.setTranslation( sensorPositionX, sensorPositionY );
    } );

    // sensor node drag handler
    var sensorNodeDragHandler = new DragHandler( this, dragBoundsProperty, getContainerBounds,
      this.sensorNode, intensityMeter.sensorPositionProperty, this.dragSensorXY, this.dragBothXY.bind( this ),
      moveIntensityMeterToToolbox
    );
    this.sensorNode.addInputListener( sensorNodeDragHandler );

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

    // second rectangle
    var innerRectangle = new Rectangle( 2, 2, rectangleWidth - 10, rectangleHeight - 10, 5, 5, {
      fill: '#008541',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );

    // adding inner rectangle
    var innerMostRectangle = new ShadedRectangle( new Bounds2( 10, 0, rectangleWidth * 0.8, rectangleHeight * 0.5 ), {
      baseColor: 'white',
      lightSource: 'rightBottom',
      centerX: innerRectangle.centerX,
      centerY: rectangleHeight * 0.6
    } );

    // Add a "Intensity" title to the body node
    var titleNode = new Text( intensityString, { font: new PhetFont( 20 ), fill: 'white' } );
    if ( titleNode.width > rectangleWidth - 15 ) {
      titleNode.scale( (rectangleWidth - 15) / titleNode.width );
    }

    // Add the reading to the body node
    var valueNode = new Text( intensityMeter.reading.getString(),
      { font: new PhetFont( 25 ), fill: 'black' } );

    // add up all the shapes to form a body node
    this.bodyNode = new Node( {
      children: [ outerRectangle, innerRectangle, innerMostRectangle, titleNode, valueNode ],
      cursor: 'pointer'
    } );
    titleNode.setTranslation( (this.bodyNode.getWidth() - titleNode.getWidth()) / 2,
      this.bodyNode.getHeight() * 0.23 );

    // displayed value
    intensityMeter.readingProperty.link( function() {
      valueNode.setText( intensityMeter.reading.getString() );
      valueNode.setTranslation( innerMostRectangle.centerX - valueNode.width / 2,
        innerMostRectangle.centerY + valueNode.height / 2 );
    } );

    // body location
    intensityMeter.bodyPositionProperty.link( function( location ) {
      var bodyPositionX = modelViewTransform.modelToViewX( location.x );
      var bodyPositionY = modelViewTransform.modelToViewY( location.y );
      intensityMeterNode.bodyNode.setTranslation( bodyPositionX - intensityMeterNode.bodyNode.getWidth() / 2,
        bodyPositionY - intensityMeterNode.bodyNode.getHeight() / 2 );
    } );

    // body drag handler
    var bodyDragHandler = new DragHandler( this, dragBoundsProperty, getContainerBounds,
      this.bodyNode, intensityMeter.bodyPositionProperty, this.dragBodyXY, this.dragBothXY.bind( this ),
      moveIntensityMeterToToolbox );
    this.bodyNode.addInputListener( bodyDragHandler );

    // scale sensorNode and bodyNode and translating
    this.bodyNode.setScaleMagnitude( INTENSITY_METER_SCALE_INSIDE_TOOLBOX );
    this.sensorNode.setScaleMagnitude( INTENSITY_METER_SCALE_INSIDE_TOOLBOX );
    this.sensorNode.setTranslation(
      modelViewTransform.modelToViewX( intensityMeter.sensorPosition.x ) - (this.sensorNode.getWidth() / 2),
      modelViewTransform.modelToViewY( intensityMeter.sensorPosition.y ) - (this.sensorNode.getHeight() * 0.32) );
    this.bodyNode.setTranslation(
      modelViewTransform.modelToViewX( intensityMeter.bodyPosition.x ) - this.bodyNode.getWidth() / 2,
      modelViewTransform.modelToViewY( intensityMeter.bodyPosition.y ) - this.bodyNode.getHeight() / 2 );

    // Connect the sensor to the body with a gray wire
    var wireNode = new WireNode( intensityMeter.sensorPositionProperty, intensityMeter.bodyPositionProperty,
      this.sensorNode, this.bodyNode, 'gray' );

    // add the components
    this.addChild( wireNode );
    this.addChild( this.sensorNode );
    this.addChild( this.bodyNode );

    // If the drag bounds changes, make sure the sensor didn't go out of bounds
    dragBoundsProperty.link( function( dragBounds ) {
      var modelBounds = modelViewTransform.viewToModelBounds( dragBounds );
      intensityMeter.bodyPosition = modelBounds.getClosestPoint( intensityMeter.bodyPosition.x, intensityMeter.bodyPosition.y );
      intensityMeter.sensorPosition = modelBounds.getClosestPoint( intensityMeter.sensorPosition.x, intensityMeter.sensorPosition.y );
    } );
  }

  return inherit( Node, IntensityMeterNode, {

    /**
     * Resize the intensityMeterNode
     * @public
     * @param {number} endPositionX - x coordinate of end point
     * @param {number} endPositionY - y coordinate of end point
     * @param {number} scale - scale to be applied to intensity meter
     */
    setIntensityMeterScale: function( endPositionX, endPositionY, scale ) {

      // previous scale for scaling the distance between the sensorNode and bodyNode
      var prevScale = this.sensorNode.getScaleVector().x;

      // scale all components
      this.bodyNode.setScaleMagnitude( scale );
      this.sensorNode.setScaleMagnitude( scale );

      // position the body node according to the scale
      var sensorPosition = this.intensityMeter.sensorPosition;
      this.intensityMeter.bodyPosition = new Vector2(
        sensorPosition.x + (this.intensityMeter.bodyPosition.x - sensorPosition.x ) * scale / prevScale,
        sensorPosition.y + (this.intensityMeter.bodyPosition.y - sensorPosition.y ) * scale / prevScale
      );
      this.intensityMeter.translateAllXY( endPositionX - sensorPosition.x, endPositionY - sensorPosition.y );
    },

    /**
     * Resize the intensityMeterNode with Animation
     * @private
     * @param {number} endPositionX - x coordinate of end point
     * @param {number} endPositionY - y coordinate of end point
     * @param {number} scale - scale to be applied to intensity meter
     */
    setIntensityMeterScaleAnimation: function( endPositionX, endPositionY, scale ) {

      // get the previous scale to scale from there
      var prevScale = this.sensorNode.getScaleVector().x;
      var startPoint = {
        x: this.intensityMeter.sensorPosition.x,
        y: this.intensityMeter.sensorPosition.y,
        scale: prevScale
      };
      var endPoint = { x: endPositionX, y: endPositionY, scale: scale };
      var target = this;
      // add tween
      TweenUtil.startTween( this, startPoint, endPoint, function() {
        target.setIntensityMeterScale( startPoint.x, startPoint.y, startPoint.scale );
      } );
    },

    /**
     * Adds IntensityMeterNode to play area and removes from tool box
     * @public
     */
    addToBendingLightView: function() {

      if ( this.beforeLightLayer2.isChild( this ) ) {
        this.beforeLightLayer2.removeChild( this );
      }
      if ( !this.beforeLightLayer.isChild( this ) ) {
        this.beforeLightLayer.addChild( this );
      }
      this.touchArea = null;
      this.sensorNode.touchArea = this.sensorNode.localBounds;
      this.bodyNode.touchArea = this.bodyNode.localBounds;
    },

    /**
     * Adds IntensityMeterNode to tool box and removes from play area
     * @public
     */
    addToToolBox: function() {

      if ( this.beforeLightLayer.isChild( this ) ) {
        this.beforeLightLayer.removeChild( this );
      }

      if ( !this.beforeLightLayer2.isChild( this ) ) {
        this.beforeLightLayer2.addChild( this );
      }
    },

    /**
     * Drag sensorNode
     * @private
     * @param {IntensityMeter} intensityMeter - model for the intensity meter
     * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
     * @param {number} deltaX - amount of space in x direction the sensor to be translated
     * @param {number} deltaY - amount of space in y direction the sensor to be translated
     */
    dragSensorXY: function( intensityMeter, modelViewTransform, deltaX, deltaY ) {
      intensityMeter.translateSensorXY(
        modelViewTransform.viewToModelDeltaX( deltaX ),
        modelViewTransform.viewToModelDeltaY( deltaY ) );
    },

    /**
     * Drag bodyNode
     * @private
     * @param {IntensityMeter} intensityMeter - model for the intensity meter
     * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
     * @param {number} deltaX - amount of space in x direction the body to be translated
     * @param {number} deltaY - amount of space in y direction the body to be translated
     */
    dragBodyXY: function( intensityMeter, modelViewTransform, deltaX, deltaY ) {
      intensityMeter.translateBodyXY(
        modelViewTransform.viewToModelDeltaX( deltaX ),
        modelViewTransform.viewToModelDeltaY( deltaY ) );
    },

    /**
     * Drag bodyNode
     * @private
     * @param {IntensityMeter} intensityMeter - model for the intensity meter
     * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
     * @param {number} deltaX - amount of space in x direction the body to be translated
     * @param {number} deltaY - amount of space in y direction the body to be translated
     */
    dragBothXY: function( intensityMeter, modelViewTransform, deltaX, deltaY ) {
      this.dragSensorXY( intensityMeter, modelViewTransform, deltaX, deltaY );
      this.dragBodyXY( intensityMeter, modelViewTransform, deltaX, deltaY );
    },

    /**
     * @public
     */
    reset: function() {
      var sensorInitialPosition = this.intensityMeter.sensorPositionProperty.initialValue;
      this.setIntensityMeterScale(
        sensorInitialPosition.x, sensorInitialPosition.y, INTENSITY_METER_SCALE_INSIDE_TOOLBOX );
      if ( this.beforeLightLayer.isChild( this ) ) {
        this.addToToolBox();
      }
    }
  } );
} );