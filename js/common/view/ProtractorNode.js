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

  // images
  var protractorImage = require( 'image!BENDING_LIGHT/protractor.png' );

  // constants
  var DEFAULT_SCALE = 0.4;

  /**
   * @param {BendingLightView} bendingLightView - view of the simulation
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
  function ProtractorNode( bendingLightView, modelViewTransform, showProtractorProperty, protractorModel,
                           translateShape, rotateShape, protractorIconWidth, containerBounds, dragBounds ) {

    var protractorNode = this;
    Node.call( protractorNode );

    this.bendingLightView = bendingLightView;
    this.modelViewTransform = modelViewTransform;
    this.protractorModel = protractorModel;
    this.multiScale = protractorIconWidth / protractorImage.width;
    this.showProtractorProperty = showProtractorProperty;

    // true if the protractor has been made larger
    this.expandedProperty = new Property( false );
    this.expandedButtonVisibilityProperty = new Property( false );

    // load and add the image
    this.protractorImageNode = new Image( protractorImage );
    protractorNode.setScaleMagnitude( this.multiScale );

    showProtractorProperty.linkAttribute( this, 'visible' );
    this.addChild( this.protractorImageNode );

    var protractorImageWidth = this.protractorImageNode.getWidth();
    var protractorImageHeight = this.protractorImageNode.getHeight();

    // shape for the outer ring of the protractor
    var outerRimShape = new Shape()
      .moveTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, true )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, false )
      .lineTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, false )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, true );

    var fullShape = new Shape()
      .moveTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, true )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, false )
      .lineTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, false )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, true )
      .rect( protractorImageWidth * 0.2, protractorImageHeight / 2,
      protractorImageWidth * 0.6, protractorImageHeight * 0.15 );
    var innerBarShape = new Shape().rect( protractorImageWidth * 0.2, protractorImageHeight / 2,
      protractorImageWidth * 0.6, protractorImageHeight * 0.15 );

    // add a mouse listener for dragging when the drag region
    // (entire body in all tabs, just the inner bar on prism break tab) is dragged
    var translatePath = new Path( translateShape( fullShape, innerBarShape, outerRimShape ), {
      pickable: true,
      cursor: 'pointer'
    } );
    this.addChild( translatePath );

    var start;
    var protractorDragBoundsInModelCoordinates = protractorNode.modelViewTransform.viewToModelBounds( dragBounds );

    translatePath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = protractorNode.globalToParentPoint( event.pointer.point );
        protractorNode.expandedButtonVisibilityProperty.value = true;
      },
      drag: function( event ) {

        // compute the change in angle based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );
        protractorNode.dragAllXY( end.x - start.x, end.y - start.y );
        var position = protractorDragBoundsInModelCoordinates.closestPointTo( protractorModel.position );
        protractorModel.positionProperty.set( position );
        start = end;
      },
      end: function() {
        if ( containerBounds ) {
          if ( containerBounds.containsCoordinates( protractorNode.getCenterX(), protractorNode.getCenterY() ) ) {
            var point2D = protractorNode.modelViewTransform.modelToViewPosition(
              protractorModel.positionProperty.initialValue );
            protractorNode.setProtractorScaleAnimation( point2D, protractorNode.multiScale );
            protractorNode.expandedButtonVisibilityProperty.value = false;
            protractorNode.expandedProperty.value = false;
            protractorNode.addToSensorPanel();
            protractorModel.enabledProperty.set( false );
          }
        }
        else {
          protractorNode.expandedButtonVisibilityProperty.value = true;
        }
      }
    } ) );

    // add a mouse listener for rotating when the rotate shape (the outer ring in the 'prism break' tab is dragged)
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

    protractorModel.angleProperty.link( function( angle ) {
      protractorNode.rotateAround( protractorNode.center, angle - protractorNode.getRotation() );
    } );
    protractorModel.positionProperty.link( function( position ) {
      var protractorNodeScaleVector = protractorNode.getScaleVector();
      var protractorCenterX = protractorNode.modelViewTransform.modelToViewX( position.x );
      var protractorCenterY = protractorNode.modelViewTransform.modelToViewY( position.y );
      var point = new Vector2(
        -protractorImageWidth * protractorNodeScaleVector.x / 2,
        -protractorImageHeight * protractorNodeScaleVector.y / 2
      );
      var newPoint = point.rotate( protractorNode.getRotation() );
      newPoint.x = newPoint.x + protractorCenterX;
      newPoint.y = newPoint.y + protractorCenterY;
      protractorNode.setTranslation( newPoint );
    } );

    this.shape = new Path( Shape.rectangle( 0, 0, this.getWidth() / this.multiScale, this.getHeight() / this.multiScale ), {
      pickable: true,
      cursor: 'pointer'
    } );

    this.addChild( this.shape );
    this.shape.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = protractorNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds ) {
          protractorNode.setProtractorScaleAnimation( start, DEFAULT_SCALE );
          protractorNode.addToBendingLightView();
          protractorModel.enabledProperty.set( true );
        }
        protractorNode.expandedButtonVisibilityProperty.value = true;
      },
      drag: function( event ) {

        // compute the change in angle based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );
        protractorNode.dragAllXY( end.x - start.x, end.y - start.y );
        var position = protractorDragBoundsInModelCoordinates.closestPointTo( protractorModel.position );
        protractorModel.positionProperty.set( position );
        start = end;
      },
      end: function() {
        if ( containerBounds ) {
          if ( containerBounds.containsCoordinates( protractorNode.getCenterX(), protractorNode.getCenterY() ) ) {
            var point2D = protractorNode.modelViewTransform.modelToViewPosition(
              protractorModel.positionProperty.initialValue );
            protractorNode.setProtractorScaleAnimation( point2D, protractorNode.multiScale );
            protractorNode.expandedButtonVisibilityProperty.value = false;
            protractorNode.expandedProperty.value = false;
            protractorNode.addToSensorPanel();
            protractorModel.enabledProperty.set( false );
          }
        }
        else {
          protractorNode.expandedButtonVisibilityProperty.value = true;
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
        if ( this.bendingLightView.afterLightLayer.isChild( this ) ) {
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
        new TWEEN.Tween( startPoint )
          .to( finalPosition, 100 )
          .easing( TWEEN.Easing.Linear.None )
          .onUpdate( function() {
            target.setScaleMagnitude( startPoint.scale );
            target.centerX = startPoint.x;
            target.centerY = startPoint.y;
          } ).start();
        this.protractorModel.positionProperty.set( this.modelViewTransform.viewToModelPosition( endPoint ) );
      },

      /**
       * Adds ProtractorNode to play area and removes from tool box
       * @public
       */
      addToBendingLightView: function() {

        if ( this.bendingLightView.beforeLightLayer2.isChild( this ) ) {
          this.bendingLightView.beforeLightLayer2.removeChild( this );
        }
        if ( !this.bendingLightView.afterLightLayer.isChild( this ) ) {
          this.bendingLightView.afterLightLayer.addChild( this );
        }
        this.touchArea = null;
      },

      /**
       * Adds ProtractorNode to tool box and removes from play area
       * @public
       */
      addToSensorPanel: function() {

        if ( this.bendingLightView.afterLightLayer.isChild( this ) ) {
          this.bendingLightView.afterLightLayer.removeChild( this );
        }
        if ( !this.bendingLightView.beforeLightLayer2.isChild( this ) ) {
          this.bendingLightView.beforeLightLayer2.addChild( this );
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