// Copyright 2015-2021, University of Colorado Boulder

/**
 * Graphically depicts a draggable prism.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import knobImage from '../../../images/knob_png.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';

class PrismNode extends Node {

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
   */
  constructor( prismsModel, modelViewTransform, prism, prismToolboxNode, prismLayer, dragBoundsProperty,
               occlusionHandler, isIcon ) {

    super( { cursor: 'pointer' } );
    const knobHeight = 15;

    // It looks like a box on the side of the prism
    const knobNode = new Image( knobImage );
    if ( prism.shapeProperty.get().getReferencePoint() ) {
      this.addChild( knobNode );
    }

    // Prism rotation with knob
    let previousAngle;
    let prismCenterPoint;
    if ( !isIcon ) {
      knobNode.addInputListener( new SimpleDragHandler( {
        start: event => {
          this.moveToFront();
          const start = knobNode.globalToParentPoint( event.pointer.point );
          prismCenterPoint = prism.getTranslatedShape().getRotationCenter();
          const startX = modelViewTransform.viewToModelX( start.x );// model values
          const startY = modelViewTransform.viewToModelY( start.y );// model values
          previousAngle = Math.atan2( ( prismCenterPoint.y - startY ), ( prismCenterPoint.x - startX ) );
        },
        drag: event => {
          const end = knobNode.globalToParentPoint( event.pointer.point );
          prismCenterPoint = prism.getTranslatedShape().getRotationCenter();
          const endX = modelViewTransform.viewToModelX( end.x );// model values
          const endY = modelViewTransform.viewToModelY( end.y );// model values
          const angle = Math.atan2( ( prismCenterPoint.y - endY ), ( prismCenterPoint.x - endX ) );
          prism.rotate( angle - previousAngle );
          previousAngle = angle;
        },

        // A Prism cannot be put back into the toolbox by rotating it.
        end: () => {}
      } ) );
      knobNode.touchArea = Shape.circle( 0, 10, 40 );
    }

    const prismPathNode = new Path( modelViewTransform.modelToViewShape( prism.getTranslatedShape().shape ), {
      stroke: 'gray'
    } );
    this.addChild( prismPathNode );

    // When the window reshapes, make sure no prism is left outside of the play area
    // TODO: Broken, see https://github.com/phetsims/bending-light/issues/372
    dragBoundsProperty.link( dragBounds => {
      const center = prism.shapeProperty.get().centroid;
      const inBounds = modelViewTransform.viewToModelBounds( dragBounds ).getClosestPoint( center.x, center.y );
      prism.translate( inBounds.x - center.x, inBounds.y - center.y );
    } );

    this.movableDragHandler = new DragListener( { // TODO: Rename, see https://github.com/phetsims/bending-light/issues/372
      useParentOffset: true,
      positionProperty: prism.positionProperty,

      // TODO: Was previously //     newPosition = modelViewTransform.viewToModelBounds( dragBoundsProperty.value ).closestPointTo( newPosition );
      // TODO: Do we need to transform the bounds?
      // dragBoundsProperty: dragBoundsProperty, // TODO: get this working, see https://github.com/phetsims/bending-light/issues/372
      transform: modelViewTransform,
      end: () => {
        occlusionHandler( this );
        if ( prismToolboxNode.visibleBounds.containsCoordinates( this.getCenterX(), this.getCenterY() ) ) {
          if ( prismLayer.hasChild( this ) ) {
            prismsModel.removePrism( prism );
            prism.shapeProperty.unlink( this.updatePrismShape );
            prismsModel.prismMediumProperty.unlink( this.updatePrismColor );
            prismLayer.removeChild( this );
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
    this.updatePrismShape = () => {
      prismsModel.clear();
      prismsModel.updateModel();
      prismsModel.dirty = true;
      const delta = prism.positionProperty.value;
      prismPathNode.setShape( modelViewTransform.modelToViewShape( prism.shapeProperty.get().getTranslatedInstance( delta.x, delta.y ).shape ) );

      const prismReferencePoint = prism.getTranslatedShape().getReferencePoint();
      if ( prismReferencePoint ) {
        const prismShapeCenter = prism.getTranslatedShape().getRotationCenter();
        knobNode.resetTransform();
        knobNode.setScaleMagnitude( knobHeight / knobNode.height );

        const prismReferenceXPosition = modelViewTransform.modelToViewX( prismReferencePoint.x );
        const prismReferenceYPosition = modelViewTransform.modelToViewY( prismReferencePoint.y );
        const prismCenterX = modelViewTransform.modelToViewX( prismShapeCenter.x );
        const prismCenterY = modelViewTransform.modelToViewY( prismShapeCenter.y );

        // Calculate angle
        const angle = Math.atan2( ( prismCenterY - prismReferenceYPosition ), ( prismCenterX - prismReferenceXPosition ) );
        knobCenterPoint.x = -knobNode.getWidth() - 7;
        knobCenterPoint.y = -knobNode.getHeight() / 2 - 8;
        knobNode.rotateAround( knobCenterPoint, angle );
        knobNode.setTranslation( prismReferenceXPosition, prismReferenceYPosition );
        knobNode.translate( knobCenterPoint );
      }
    };
    prism.shapeProperty.link( this.updatePrismShape );
    prism.positionProperty.link( this.updatePrismShape );

    // @public - used in PrismToolboxNode
    this.updatePrismColor = () => {
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
    this.translateViewXY = ( x, y ) => {
      const delta = modelViewTransform.viewToModelDeltaXY( x, y );
      prism.translate( delta.x, delta.y );
    };
  }
}

bendingLight.register( 'PrismNode', PrismNode );

export default PrismNode;