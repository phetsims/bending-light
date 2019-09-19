// Copyright 2015-2017, University of Colorado Boulder

/**
 * Graphically depicts a draggable prism.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const knobImage = require( 'image!BENDING_LIGHT/knob.png' );

  /**
   * @param {PrismsModel} prismsModel - main model
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {Prism} prism
   * @param {Node} prismToolboxNode
   * @param {Node} prismLayer - layer consisting of prisms in play area
   * @param {Property.<Bounds2>} dragBoundsProperty - bounds that define where the prism may be dragged
   * @param {function} occlusionHandler - function that takes a node and updates it if it would be occluded by a control
   *                                    - panel
   * @param {boolean} isIcon - true if the prism node is being created to be shown as an icon in the toolbox
   *                         - false if the prism node will be dragged in the play area
   * @constructor
   */
  function PrismNode( prismsModel, modelViewTransform, prism, prismToolboxNode, prismLayer, dragBoundsProperty,
                      occlusionHandler, isIcon ) {

    Node.call( this, { cursor: 'pointer' } );
    const self = this;
    const knobHeight = 15;

    // It looks like a box on the side of the prism
    const knobNode = new Image( knobImage );
    if ( prism.shapeProperty.get().getReferencePoint() ) {
      self.addChild( knobNode );
    }

    // Prism rotation with knob
    let previousAngle;
    let prismCenterPoint;
    if ( !isIcon ) {
      knobNode.addInputListener( new SimpleDragHandler( {
        start: function( event ) {
          self.moveToFront();
          const start = knobNode.globalToParentPoint( event.pointer.point );
          prismCenterPoint = prism.shapeProperty.get().getRotationCenter();
          const startX = modelViewTransform.viewToModelX( start.x );// model values
          const startY = modelViewTransform.viewToModelY( start.y );// model values
          previousAngle = Math.atan2( (prismCenterPoint.y - startY), ( prismCenterPoint.x - startX ) );
        },
        drag: function( event ) {
          const end = knobNode.globalToParentPoint( event.pointer.point );
          prismCenterPoint = prism.shapeProperty.get().getRotationCenter();
          const endX = modelViewTransform.viewToModelX( end.x );// model values
          const endY = modelViewTransform.viewToModelY( end.y );// model values
          const angle = Math.atan2( (prismCenterPoint.y - endY), ( prismCenterPoint.x - endX ) );
          prism.rotate( angle - previousAngle );
          previousAngle = angle;
        },

        // A Prism cannot be put back into the toolbox by rotating it.
        end: function() {}
      } ) );
      knobNode.touchArea = Shape.circle( 0, 10, 40 );
    }

    const prismPathNode = new Path( modelViewTransform.modelToViewShape( prism.shapeProperty.get().shape ), {
      stroke: 'gray'
    } );
    this.addChild( prismPathNode );

    // When the window reshapes, make sure no prism is left outside of the play area
    dragBoundsProperty.link( function( dragBounds ) {
      const center = prism.shapeProperty.get().centroid;
      const inBounds = modelViewTransform.viewToModelBounds( dragBounds ).getClosestPoint( center.x, center.y );
      prism.translate( inBounds.x - center.x, inBounds.y - center.y );
    } );

    // MovableDragHandler is nice, but it only works with Properties, so we much make a synthetic Property.<Vector2>
    const positionProperty = {
      get: function() {
        return prism.shapeProperty.get().getRotationCenter();
      },
      set: function( newPosition ) {
        const oldPosition = this.get();

        // Keep it in bounds
        // Couldn't get this figured out with MovableDragHandler, our case is a bit too out of the box since there is
        // really no Property representing the position of the Prism
        newPosition = modelViewTransform.viewToModelBounds( dragBoundsProperty.value ).closestPointTo( newPosition );
        const dx = newPosition.x - oldPosition.x;
        const dy = newPosition.y - oldPosition.y;

        prism.translate( dx, dy );
      }
    };
    this.movableDragHandler = new MovableDragHandler( positionProperty, {
      modelViewTransform: modelViewTransform,
      endDrag: function() {
        occlusionHandler( self );
        if ( prismToolboxNode.visibleBounds.containsCoordinates( self.getCenterX(), self.getCenterY() ) ) {
          if ( prismLayer.hasChild( self ) ) {
            prismsModel.removePrism( prism );
            prism.shapeProperty.unlink( self.updatePrismShape );
            prismsModel.prismMediumProperty.unlink( self.updatePrismColor );
            prismLayer.removeChild( self );
          }
          prismsModel.dirty = true;
        }
      }
    } );

    if ( !isIcon ) {
      prismPathNode.addInputListener( this.movableDragHandler );
    }

    const knobCenterPoint = new Vector2( -knobNode.getWidth() - 7, -knobNode.getHeight() / 2 - 8 );

    // @public - also used in PrismToolboxNode
    this.updatePrismShape = function() {
      prismsModel.clear();
      prismsModel.updateModel();
      prismsModel.dirty = true;
      prismPathNode.setShape( modelViewTransform.modelToViewShape( prism.shapeProperty.get().shape ) );

      const prismReferencePoint = prism.shapeProperty.get().getReferencePoint();
      if ( prismReferencePoint ) {
        const prismShapeCenter = prism.shapeProperty.get().getRotationCenter();
        knobNode.resetTransform();
        knobNode.setScaleMagnitude( knobHeight / knobNode.height );

        const prismReferenceXPosition = modelViewTransform.modelToViewX( prismReferencePoint.x );
        const prismReferenceYPosition = modelViewTransform.modelToViewY( prismReferencePoint.y );
        const prismCenterX = modelViewTransform.modelToViewX( prismShapeCenter.x );
        const prismCenterY = modelViewTransform.modelToViewY( prismShapeCenter.y );

        // Calculate angle
        const angle = Math.atan2( (prismCenterY - prismReferenceYPosition), ( prismCenterX - prismReferenceXPosition ) );
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
      const indexOfRefraction = prismsModel.prismMediumProperty.value.substance.indexOfRefractionForRedLight;
      prismPathNode.fill = prismsModel.mediumColorFactory.getColor( indexOfRefraction )
        .withAlpha( BendingLightConstants.PRISM_NODE_ALPHA );
    };

    prismsModel.mediumColorFactory.lightTypeProperty.link( this.updatePrismColor );
    prismsModel.prismMediumProperty.link( this.updatePrismColor );

    /**
     * Called from the occlusion handler.  Translates the view by the specified amount by translating the corresponding
     * model
     * @param {number} x
     * @param {number} y
     * @public
     */
    this.translateViewXY = function( x, y ) {
      const delta = modelViewTransform.viewToModelDeltaXY( x, y );
      prism.translate( delta.x, delta.y );
    };
  }

  bendingLight.register( 'PrismNode', PrismNode );
  
  return inherit( Node, PrismNode );
} );