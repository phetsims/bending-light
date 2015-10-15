// Copyright 2002-2015, University of Colorado Boulder

/**
 * Graphically depicts a draggable prism.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
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
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  // images
  var knobImage = require( 'image!BENDING_LIGHT/knob.png' );

  /**
   * @param {PrismsModel} prismsModel - main model
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {Prism} prism
   * @param {Node} prismToolboxNode
   * @param {Node} prismLayer - layer consisting of prisms in play area
   * @param {Property.<Bounds2>} dragBoundsProperty - bounds that define where the prism may be dragged
   * @param {function} occlusionHandler - function that takes a node and updates it if it would be occluded by a control
   *                                    - panel
   * @constructor
   */
  function PrismNode( prismsModel, modelViewTransform, prism, prismToolboxNode, prismLayer, dragBoundsProperty,
                      occlusionHandler ) {

    Node.call( this, { cursor: 'pointer' } );
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
        var startX = modelViewTransform.viewToModelX( start.x );// model values
        var startY = modelViewTransform.viewToModelY( start.y );// model values
        previousAngle = Math.atan2( (prismCenterPoint.y - startY), ( prismCenterPoint.x - startX ) );
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

      // A Prism cannot be put back into the toolbox by rotating it.
      end: function() {}
    } ) );
    knobNode.touchArea = Shape.circle( 0, 10, 40 );

    var prismPathNode = new Path( modelViewTransform.modelToViewShape( prism.shape.shape ), {
      stroke: 'gray'
    } );
    this.addChild( prismPathNode );

    // When the window reshapes, make sure no prism is left outside of the play area
    dragBoundsProperty.link( function( dragBounds ) {
      var center = prism.shape.centroid;
      var inBounds = modelViewTransform.viewToModelBounds( dragBounds ).getClosestPoint( center.x, center.y );
      prism.translate( inBounds.x - center.x, inBounds.y - center.y );
    } );

    // MovableDragHandler is nice, but it only works with Properties, so we much make a synthetic Property.<Vector2>
    var positionProperty = {
      get: function() {
        return prism.shape.getRotationCenter();
      },
      set: function( newPosition ) {
        var oldPosition = this.get();

        // Keep it in bounds
        // Couldn't get this figured out with MovableDragHandler, our case is a bit too out of the box since there is
        // really no Property representing the position of the Prism
        newPosition = modelViewTransform.viewToModelBounds( dragBoundsProperty.value ).closestPointTo( newPosition );
        var dx = newPosition.x - oldPosition.x;
        var dy = newPosition.y - oldPosition.y;

        prism.translate( dx, dy );
      }
    };
    this.movableDragHandler = new MovableDragHandler( positionProperty, {
      modelViewTransform: modelViewTransform,
      endDrag: function() {
        occlusionHandler( prismNode );
        if ( prismToolboxNode.visibleBounds.containsCoordinates( prismNode.getCenterX(), prismNode.getCenterY() ) ) {
          if ( prismLayer.isChild( prismNode ) ) {
            prismsModel.removePrism( prism );
            prism.shapeProperty.unlink( prismNode.updatePrismShape );
            prismsModel.prismMediumProperty.unlink( prismNode.updatePrismColor );
            prismLayer.removeChild( prismNode );
          }
          prismsModel.dirty = true;
        }
      }
    } );

    prismPathNode.addInputListener( this.movableDragHandler );

    var knobCenterPoint = new Vector2( -knobNode.getWidth() - 7, -knobNode.getHeight() / 2 - 8 );

    // @public - also used in PrismToolboxNode
    this.updatePrismShape = function() {
      prismsModel.clear();
      prismsModel.updateModel();
      prismsModel.dirty = true;
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

    // @public - used in PrismToolboxNode
    this.updatePrismColor = function() {
      var indexOfRefraction = prismsModel.prismMediumProperty.value.substance.getIndexOfRefractionForRedLight();
      prismPathNode.fill = MediumColorFactory.getColor( indexOfRefraction )
        .withAlpha( BendingLightConstants.PRISM_NODE_ALPHA );
    };

    MediumColorFactory.lightTypeProperty.link( this.updatePrismColor );
    prismsModel.prismMediumProperty.link( this.updatePrismColor );

    /**
     * Called from the occlusion handler.  Translates the view by the specified amount by translating the corresponding
     * model
     * @param {number} x
     * @param {number} y
     * @public
     */
    this.translateViewXY = function( x, y ) {
      var delta = modelViewTransform.viewToModelDeltaXY( x, y );
      prism.translate( delta.x, delta.y );
    };
  }

  return inherit( Node, PrismNode );
} );