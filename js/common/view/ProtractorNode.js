// Copyright 2002-2015, University of Colorado Boulder

/**
 * The protractor node is a circular device for measuring angles.
 * In this sim it is used for measuring the angle of the incident,
 * reflected and refracted light.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni(Actual Concepts)
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
  var Bounds2 = require( 'DOT/Bounds2' );

  // images
  var protractorImage = require( 'image!BENDING_LIGHT/protractor.png' );

  // constants
  var DEFAULT_SCALE = 0.4;

  /**
   *
   * @param {BendingLightView} bendingLightView
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view values
   * @param {Property<boolean>} showProtractorProperty - controls the protractor visibility
   * @param {ProtractorModel} protractorModel - model of protractor
   * @param {function} translateShape - function that returns the part of the protractor that can be used for translating it
   * @param {function} rotateShape - function that returns the part of the protractor that can be used for rotating it
   * @param {number} protractorIconWidth
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
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, true )
      .close();

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
      protractorImageWidth * 0.6, protractorImageHeight * 0.15 )
      .close();

    var innerBarShape = new Shape().rect( protractorImageWidth * 0.2, protractorImageHeight / 2,
      protractorImageWidth * 0.6, protractorImageHeight * 0.15 );

    //  add a mouse listener for dragging when the drag region
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
        if ( containerBounds ) {
          if ( containerBounds.containsPoint( protractorNode.center ) ) {
            protractorNode.setProtractorScaleAnimation( start, DEFAULT_SCALE );
            protractorNode.addToBendingLightView();
          }
        }
        protractorNode.expandedButtonVisibilityProperty.value = true;
      },
      drag: function( event ) {

        // compute the change in angle based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );
        protractorNode.dragAllXY( end.x - start.x, end.y - start.y );
        var position = protractorDragBoundsInModelCoordinates.closestPointTo( protractorNode.protractorModel.position );
        protractorNode.protractorModel.positionProperty.set( position );
        start = end;
      },
      end: function() {
        if ( containerBounds ) {
          if ( containerBounds.containsPoint( protractorNode.center ) ) {
            var point2D = protractorNode.modelViewTransform.modelToViewPosition(
              protractorNode.protractorModel.positionProperty.initialValue );
            protractorNode.setProtractorScaleAnimation( point2D, protractorNode.multiScale );
            protractorNode.expandedButtonVisibilityProperty.value = false;
            protractorNode.expandedProperty.value = false;
            protractorNode.addToSensorPanel();
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
        var center = protractorNode.center;
        var startAngle = Math.atan2( center.y - start.y, center.x - start.x );
        var angle = Math.atan2( center.y - end.y, center.x - end.x );

        // rotate the protractor model
        protractorModel.angle += angle - startAngle;
        start = end;
      }
    } ) );

    this.protractorModel.angleProperty.link( function( angle ) {
      protractorNode.rotateAround( protractorNode.center, angle - protractorNode.getRotation() );
    } );
    this.protractorModel.positionProperty.link( function( position ) {
      var protractorNodeScaleVector = protractorNode.getScaleVector();
      var protractorCenterX = protractorNode.modelViewTransform.modelToViewX( position.x );
      var protractorCenterY = protractorNode.modelViewTransform.modelToViewY( position.y );
      var point = new Vector2( -( protractorImageWidth * protractorNodeScaleVector.x / 2 ),
        -( protractorImageHeight * protractorNodeScaleVector.y / 2 ) );
      var newPoint = point.rotate( protractorNode.getRotation() );
      newPoint.x = newPoint.x + protractorCenterX;
      newPoint.y = newPoint.y + protractorCenterY;
      protractorNode.setTranslation( newPoint );
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
       * @param {number} scale
       */
      setProtractorScale: function( scale ) {
        this.setScaleMagnitude( scale );
        var protractorX = this.modelViewTransform.modelToViewX( this.protractorModel.position.x );
        var protractorY = this.modelViewTransform.modelToViewY( this.protractorModel.position.y );
        this.setTranslation( protractorX - (this.width / 2), protractorY - (this.height / 2 ) );
      },

      /**
       * @private
       * @param {Vector2}endPoint
       * @param {number} scale
       */
      setProtractorScaleAnimation: function( endPoint, scale ) {
        var startPoint = { x: this.centerX, y: this.centerY, scale: this.getScaleVector().x };
        var finalPosition = { x: endPoint.x, y: endPoint.y, scale: scale };
        this.init( startPoint, finalPosition );
        this.protractorModel.positionProperty.set( this.modelViewTransform.viewToModelPosition( endPoint ) );
      },

      /**
       * @private
       * @param {Object} initialPosition
       * @param {Object} finalPosition
       */
      init: function( initialPosition, finalPosition ) {
        var target = this;
        new TWEEN.Tween( initialPosition )
          .to( finalPosition, 100 )
          .easing( TWEEN.Easing.Linear.None )
          .onUpdate( function() {
            target.setScaleMagnitude( initialPosition.scale );
            target.centerX = initialPosition.x;
            target.centerY = initialPosition.y;
          } ).start();
      },

      /**
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
       * @public
       */
      addToSensorPanel: function() {

        if ( this.bendingLightView.afterLightLayer.isChild( this ) ) {
          this.bendingLightView.afterLightLayer.removeChild( this );
        }
        if ( !this.bendingLightView.beforeLightLayer2.isChild( this ) ) {
          this.bendingLightView.beforeLightLayer2.addChild( this );
        }
        this.touchArea = new Bounds2(
          this.localBounds.minX - 100, this.localBounds.minY - 50,
          this.localBounds.maxX + 90, this.localBounds.maxY + 50 );
      },

      /**
       * Translate the protractor, this method is called when dragging out of the toolbox
       * @private
       * @param {number} deltaX
       * @param {number} deltaY
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