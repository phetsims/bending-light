// Copyright 2002-2015, University of Colorado Boulder

/**
 * Graphically depicts a draggable prism.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Image = require( 'SCENERY/nodes/Image' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Shape = require( 'KITE/Shape' );

  // images
  var knobImage = require( 'image!BENDING_LIGHT/knob.png' );

  /**
   * @param {PrismsScreenModel} prismBreakModel - main model
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {Prism} prism
   * @param {Node} prismToolboxNode
   * @param {Node} prismLayer - layer consisting of prisms in play area
   * @param {Bounds2} prismDragBounds - bounds that define where the prism may be dragged
   * @constructor
   */
  function PrismNode( prismBreakModel, modelViewTransform, prism, prismToolboxNode, prismLayer, prismDragBounds ) {

    Node.call( this, { cursor: 'pointer', cssTransform: true } );
    var prismNode = this;
    var knobHeight = 15;

    // It looks like a box on the side of the prism
    var knobNode = new Image( knobImage );
    if ( prism.shape.getReferencePoint() ) {
      prismNode.addChild( knobNode );
    }

    // Prism rotation with knob
    var previousAngle;
    var prismCenterPoint;
    knobNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        prismNode.moveToFront();
        var start = knobNode.globalToParentPoint( event.pointer.point );
        prismCenterPoint = prism.shape.getRotationCenter();
        var statX = modelViewTransform.viewToModelX( start.x );// model values
        var startY = modelViewTransform.viewToModelY( start.y );// model values
        previousAngle = Math.atan2( (prismCenterPoint.y - startY), ( prismCenterPoint.x - statX ) );
      },
      drag: function( event ) {
        var end = knobNode.globalToParentPoint( event.pointer.point );
        prismCenterPoint = prism.shape.getRotationCenter();
        var endX = modelViewTransform.viewToModelX( end.x );// model values
        var endY = modelViewTransform.viewToModelY( end.y );// model values
        var angle = Math.atan2( (prismCenterPoint.y - endY), ( prismCenterPoint.x - endX ) );
        prism.rotate( angle - previousAngle );
        previousAngle = angle;
      },
      end: function() {
        if ( prismToolboxNode.visibleBounds.containsCoordinates( prismNode.getCenterX(), prismNode.getCenterY() ) ) {
          if ( prismLayer.isChild( prismNode ) ) {
            prismBreakModel.removePrism( prism );
            prism.shapeProperty.unlink( prismNode.updatePrismShape );
            prismBreakModel.prismMediumProperty.unlink( prismNode.updatePrismColor );
            prismLayer.removeChild( prismNode );
          }
        }
      }
    } ) );
    knobNode.touchArea = Shape.circle( 0, 10, 40 );

    var prismDragBoundsInModelValues = modelViewTransform.viewToModelBounds( prismDragBounds );
    var prismPathNode = new Path( modelViewTransform.modelToViewShape( prism.shape.shape ), {
      fill: prismBreakModel.prismMedium.color,
      stroke: prismBreakModel.prismMedium.color.darkerColor( 0.9 )
    } );
    this.addChild( prismPathNode );

    var start;
    prismPathNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        prismNode.moveToFront();
        start = prismNode.globalToParentPoint( event.pointer.point );
      },
      drag: function( event ) {
        var end = prismNode.globalToParentPoint( event.pointer.point );
        var deltaX = end.x - start.x;
        var deltaY = end.y - start.y;
        prism.translate( modelViewTransform.viewToModelDeltaX( deltaX ), modelViewTransform.viewToModelDeltaY( deltaY ) );
        var prismCenter = prism.shape.getRotationCenter();
        var position = prismDragBoundsInModelValues.closestPointTo( prismCenter );
        prism.translate( position.x - prismCenter.x, position.y - prismCenter.y );
        start = end;
      },
      end: function() {
        if ( prismToolboxNode.visibleBounds.containsCoordinates( prismNode.getCenterX(), prismNode.getCenterY() ) ) {
          if ( prismLayer.isChild( prismNode ) ) {
            prismBreakModel.removePrism( prism );
            prism.shapeProperty.unlink( prismNode.updatePrismShape );
            prismBreakModel.prismMediumProperty.unlink( prismNode.updatePrismColor );
            prismLayer.removeChild( prismNode );
          }
          prismBreakModel.dirty = true;
        }
      }
    } ) );

    var knobCenterPoint = new Vector2( -knobNode.getWidth() - 7, -knobNode.getHeight() / 2 - 8 );
    this.updatePrismShape = function() {
      prismBreakModel.clear();
      prismBreakModel.updateModel();
      prismBreakModel.dirty = true;
      prismPathNode.setShape( modelViewTransform.modelToViewShape( prism.shape.shape ) );

      var prismReferencePoint = prism.shape.getReferencePoint();
      if ( prismReferencePoint ) {
        var prismShapeCenter = prism.shape.getRotationCenter();
        knobNode.resetTransform();
        knobNode.setScaleMagnitude( knobHeight / knobNode.height );

        var prismReferenceXPosition = modelViewTransform.modelToViewX( prismReferencePoint.x );
        var prismReferenceYPosition = modelViewTransform.modelToViewY( prismReferencePoint.y );
        var prismCenterX = modelViewTransform.modelToViewX( prismShapeCenter.x );
        var prismCenterY = modelViewTransform.modelToViewY( prismShapeCenter.y );

        // Calculate angle
        var angle = Math.atan2( (prismCenterY - prismReferenceYPosition), ( prismCenterX - prismReferenceXPosition ) );
        knobCenterPoint.x = -knobNode.getWidth() - 7;
        knobCenterPoint.y = -knobNode.getHeight() / 2 - 8;
        knobNode.rotateAround( knobCenterPoint, angle );
        knobNode.setTranslation( prismReferenceXPosition, prismReferenceYPosition );
        knobNode.translate( knobCenterPoint );
      }
    };
    prism.shapeProperty.link( this.updatePrismShape );

    this.updatePrismColor = function( prismMedium ) {
      var color = prismMedium.color;
      prismPathNode.fill = color;
      prismPathNode.stroke = color.darkerColor( 0.9 );
    };
    prismBreakModel.prismMediumProperty.link( this.updatePrismColor );
  }

  return inherit( Node, PrismNode );
} );