// Copyright 2002-2015, University of Colorado Boulder

/**
 * The protractor node is a circular device for measuring angles.
 * In this sim it is used for measuring the angle of the incident,
 * reflected and refracted light.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Shape = require( 'KITE/Shape' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );
  var TweenUtil = require( 'BENDING_LIGHT/common/view/TweenUtil' );

  // images
  var protractorImage = require( 'mipmap!BENDING_LIGHT/protractor.png' );

  // constants
  var DEFAULT_SCALE = 0.4;

  /**
   * @param {Node} afterLightLayer - layer in which ProtractorNode is present when in play area
   * @param {Node} beforeLightLayer2 - layer in which ProtractorNode is present when in toolbox
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view values
   * @param {Property.<boolean>} showProtractorProperty - controls the protractor visibility
   * @param {ProtractorModel} protractorModel - model of protractor
   * @param {function} translateShape - function that returns the part of the protractor that can be used for translating it
   * @param {function} rotateShape - function that returns the part of the protractor that can be used for rotating it
   * @param {number} protractorIconWidth - width of protractor icon to show in toolbox node
   * @param {Bounds2} containerBounds - bounds of container for all tools, needed to snap protractor to initial position when it in container
   * @param {Bounds2} dragBounds - bounds that define where the protractor may be dragged
   * @constructor
   */
  function ProtractorNode( afterLightLayer, beforeLightLayer2, modelViewTransform, showProtractorProperty, protractorModel,
                           translateShape, rotateShape, protractorIconWidth, containerBounds, dragBounds ) {

    var protractorNode = this;
    Node.call( protractorNode );

    this.modelViewTransform = modelViewTransform; // @public
    this.protractorModel = protractorModel; // @public
    this.multiScale = protractorIconWidth / protractorImage[ 0 ].width; // @public
    this.showProtractorProperty = showProtractorProperty; // @public
    this.afterLightLayer = afterLightLayer; // @private
    this.beforeLightLayer2 = beforeLightLayer2; // @private

    // true if the protractor has been made larger
    Property.addProperty( this, 'expanded', false );
    Property.addProperty( this, 'expandedButtonVisibility', false );

    // load and add the image
    this.protractorImageNode = new Image( protractorImage ); // @public
    protractorNode.setScaleMagnitude( this.multiScale );

    showProtractorProperty.linkAttribute( this, 'visible' );
    this.addChild( this.protractorImageNode );

    // Use nicknames for the protractor image width and height to make the layout code easier to understand
    var w = this.protractorImageNode.getWidth();
    var h = this.protractorImageNode.getHeight();

    // shape for the outer ring of the protractor
    var outerRimShape = new Shape()
      .moveTo( w, h / 2 )
      .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, true )
      .lineTo( w * 0.2, h / 2 )
      .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, false )
      .lineTo( w, h / 2 )
      .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, false )
      .lineTo( w * 0.2, h / 2 )
      .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, true );

    var fullShape = new Shape()
      .moveTo( w, h / 2 )
      .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, true )
      .lineTo( w * 0.2, h / 2 )
      .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, false )
      .lineTo( w, h / 2 )
      .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, false )
      .lineTo( w * 0.2, h / 2 )
      .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, true )
      .rect( w * 0.2, h / 2, w * 0.6, h * 0.15 );

    var innerBarShape = new Shape().rect( w * 0.2, h / 2, w * 0.6, h * 0.15 );

    // Add a mouse listener for dragging when the drag region
    // (entire body in all tabs, just the inner bar on prism screen) is dragged
    var translatePath = new Path( translateShape( fullShape, innerBarShape, outerRimShape ), {
      pickable: true,
      cursor: 'pointer'
    } );
    this.addChild( translatePath );

    var start;
    var centerEndLocation = new Vector2();

    // Add listener to translate protractor
    translatePath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = protractorNode.globalToParentPoint( event.pointer.point );
        protractorNode.expandedButtonVisibility = true;
      },
      drag: function( event ) {

        // compute the change in position based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );

        var startPositionX = modelViewTransform.modelToViewX( protractorModel.position.x );
        var startPositionY = modelViewTransform.modelToViewY( protractorModel.position.y );
        // location of final center point with out constraining to bounds
        centerEndLocation.setXY( startPositionX + end.x - start.x, startPositionY + end.y - start.y );

        // location of final center point with constraining to bounds
        var centerEndLocationInBounds = dragBounds.closestPointTo( centerEndLocation );
        protractorNode.dragAllXY( centerEndLocationInBounds.x - startPositionX, centerEndLocationInBounds.y - startPositionY );

        // Store the position of drag point after translating. Can be obtained by adding distance between center
        // point and drag point (end - centerEndLocation) to center point (centerEndLocationInBounds) after
        // translating.
        start.x = end.x + centerEndLocationInBounds.x - centerEndLocation.x;
        start.y = end.y + centerEndLocationInBounds.y - centerEndLocation.y;
      },
      end: function() {
        if ( containerBounds ) {
          // place back protractor into tool box with animation
          if ( containerBounds.containsCoordinates( protractorNode.getCenterX(), protractorNode.getCenterY() ) ) {
            var point2D = protractorNode.modelViewTransform.modelToViewPosition(
              protractorModel.positionProperty.initialValue );
            // Place back into tool box with animation
            protractorNode.setProtractorScaleAnimation( point2D, protractorNode.multiScale );
            protractorNode.expandedButtonVisibility = false;
            protractorNode.expanded = false;
            protractorNode.addToSensorPanel();
            protractorModel.enabled = false;
          }
        }
        else {
          protractorNode.expandedButtonVisibility = true;
        }
      }
    } ) );

    // add a mouse listener for rotating when the rotate shape (the outer ring in the 'prism' screen is dragged)
    var rotatePath = new Path( rotateShape( fullShape, innerBarShape, outerRimShape ), {
      pickable: true,
      cursor: 'pointer'
    } );
    this.addChild( rotatePath );

    // rotate listener
    rotatePath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = protractorNode.globalToParentPoint( event.pointer.point );
      },
      drag: function( event ) {

        // compute the change in angle based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );
        var centerX = protractorNode.getCenterX();
        var centerY = protractorNode.getCenterY();
        var startAngle = Math.atan2( centerY - start.y, centerX - start.x );
        var angle = Math.atan2( centerY - end.y, centerX - end.x );

        // rotate the protractor model
        protractorModel.angle += angle - startAngle;
        start = end;
      }
    } ) );

    // update the protractor angle
    protractorModel.angleProperty.link( function( angle ) {
      protractorNode.rotateAround( protractorNode.center, angle - protractorNode.getRotation() );
    } );
    // update the protractor position
    protractorModel.positionProperty.link( function( position ) {
      var protractorNodeScaleVector = protractorNode.getScaleVector();
      var protractorCenterX = protractorNode.modelViewTransform.modelToViewX( position.x );
      var protractorCenterY = protractorNode.modelViewTransform.modelToViewY( position.y );
      var point = new Vector2( -w * protractorNodeScaleVector.x / 2, -h * protractorNodeScaleVector.y / 2 );
      var newPoint = point.rotate( protractorNode.getRotation() );
      newPoint.x = newPoint.x + protractorCenterX;
      newPoint.y = newPoint.y + protractorCenterY;
      protractorNode.setTranslation( newPoint );
    } );

    // add pickable rectangle shape when in tool box
    this.shape = new Path( Shape.rectangle( 0, 0, this.getWidth() / this.multiScale, this.getHeight() / this.multiScale ), {
      pickable: true,
      cursor: 'pointer'
    } );
    this.addChild( this.shape );

    // add input listener to the shape when it is in tool box
    this.shape.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = protractorNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds ) {
          // animate to full size
          protractorNode.setProtractorScaleAnimation( start, DEFAULT_SCALE );
          protractorNode.addToBendingLightView();
          protractorModel.enabledProperty.set( true );
        }
        protractorNode.expandedButtonVisibility = true;
      },
      drag: function( event ) {

        // compute the change in angle based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );

        var startPositionX = modelViewTransform.modelToViewX( protractorModel.position.x );
        var startPositionY = modelViewTransform.modelToViewY( protractorModel.position.y );
        // location of final center point with out constraining to bounds
        centerEndLocation.setXY( startPositionX + end.x - start.x, startPositionY + end.y - start.y );

        // location of final center point with constraining to bounds
        var centerEndLocationInBounds = dragBounds.closestPointTo( centerEndLocation );
        protractorNode.dragAllXY( centerEndLocationInBounds.x - startPositionX, centerEndLocationInBounds.y - startPositionY );

        // Store the position of drag point after translating. Can be obtained by adding distance between center
        // point and drag point (end - centerEndLocation) to center point (centerEndLocationInBounds) after
        // translating.
        start.x = end.x + centerEndLocationInBounds.x - centerEndLocation.x;
        start.y = end.y + centerEndLocationInBounds.y - centerEndLocation.y;
      },
      end: function() {
        if ( containerBounds ) {
          // place back into tool box
          if ( containerBounds.containsCoordinates( protractorNode.getCenterX(), protractorNode.getCenterY() ) ) {
            var point2D = protractorNode.modelViewTransform.modelToViewPosition(
              protractorModel.positionProperty.initialValue );
            protractorNode.setProtractorScaleAnimation( point2D, protractorNode.multiScale );
            protractorNode.expandedButtonVisibility = false;
            protractorNode.expanded = false;
            protractorNode.addToSensorPanel();
            protractorModel.enabledProperty.set( false );
          }
        }
        else {
          protractorNode.expandedButtonVisibility = true;
        }
      }
    } ) );
    protractorModel.enabledProperty.link( function( enabled ) {
      protractorNode.shape.setVisible( !enabled && containerBounds !== null );
    } );
  }

  return inherit( Node, ProtractorNode, {

      /**
       * @public
       */
      reset: function() {
        this.expandedProperty.reset();
        this.expandedButtonVisibilityProperty.reset();
        this.setProtractorScale( this.multiScale );
        if ( this.afterLightLayer.isChild( this ) ) {
          this.addToSensorPanel();
        }
      },

      /**
       * Resize the protractor
       * @public
       * @param {number} scale - scale to be applied for the protractor
       */
      setProtractorScale: function( scale ) {
        this.setScaleMagnitude( scale );
        var protractorX = this.modelViewTransform.modelToViewX( this.protractorModel.position.x );
        var protractorY = this.modelViewTransform.modelToViewY( this.protractorModel.position.y );
        this.setTranslation( protractorX - (this.width / 2), protractorY - (this.height / 2 ) );
      },

      /**
       * Resize the protractor with Animation
       * @private
       * @param {Vector2} endPoint - position at final stage of animation
       * @param {number} scale - scale at final stage of animation
       */
      setProtractorScaleAnimation: function( endPoint, scale ) {
        var startPoint = { x: this.centerX, y: this.centerY, scale: this.getScaleVector().x };
        var finalPosition = { x: endPoint.x, y: endPoint.y, scale: scale };
        var target = this;
        // add tween
        TweenUtil.startTween( this, startPoint, finalPosition, function() {
          target.setScaleMagnitude( startPoint.scale );
          target.centerX = startPoint.x;
          target.centerY = startPoint.y;
        } );
        this.protractorModel.positionProperty.set( this.modelViewTransform.viewToModelPosition( endPoint ) );
      },

      /**
       * Adds ProtractorNode to play area and removes from tool box
       * @public
       */
      addToBendingLightView: function() {

        if ( this.beforeLightLayer2.isChild( this ) ) {
          this.beforeLightLayer2.removeChild( this );
        }
        if ( !this.afterLightLayer.isChild( this ) ) {
          this.afterLightLayer.addChild( this );
        }
        this.touchArea = null;
      },

      /**
       * Adds ProtractorNode to tool box and removes from play area
       * @public
       */
      addToSensorPanel: function() {

        if ( this.afterLightLayer.isChild( this ) ) {
          this.afterLightLayer.removeChild( this );
        }
        if ( !this.beforeLightLayer2.isChild( this ) ) {
          this.beforeLightLayer2.addChild( this );
        }
        this.touchArea = this.shape.bounds;
      },

      /**
       * Translate the protractor, this method is called when dragging out of the toolbox
       * @private
       * @param {number} deltaX - amount of space in x direction the protractor to be translated
       * @param {number} deltaY - amount of space in y direction the sensor to be translated
       */
      dragAllXY: function( deltaX, deltaY ) {
        this.protractorModel.translateXY(
          this.modelViewTransform.viewToModelDeltaX( deltaX ), this.modelViewTransform.viewToModelDeltaY( deltaY ) );
      }
    },

    // statics
    {
      DEFAULT_SCALE: DEFAULT_SCALE
    } );
} );