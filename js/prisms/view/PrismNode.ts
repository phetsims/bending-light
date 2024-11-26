// Copyright 2015-2024, University of Colorado Boulder

/**
 * Graphically depicts a draggable prism.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { DragListener, Image, Node, Path, SceneryEvent } from '../../../../scenery/js/imports.js';
import knob_png from '../../../images/knob_png.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import Prism from '../model/Prism.js';
import PrismsModel from '../model/PrismsModel.js';

export default class PrismNode extends Node {
  private readonly dragListener: DragListener;
  private readonly updatePrismShape: () => void;
  private readonly updatePrismColor: () => void;
  public readonly translateViewXY: ( x: number, y: number ) => void;

  /**
   * @param prismsModel - main model
   * @param modelViewTransform - converts between model and view co-ordinates
   * @param prism
   * @param prismToolboxNode
   * @param prismLayer - layer consisting of prisms in play area
   * @param dragBoundsProperty - bounds that define where the prism may be dragged
   * @param occlusionHandler - function that takes a node and updates it if it would be occluded by a control
   *                                    - panel
   * @param isIcon - true if the prism node is being created to be shown as an icon in the toolbox
   *                         - false if the prism node will be dragged in the play area
   */
  public constructor( prismsModel: PrismsModel, modelViewTransform: ModelViewTransform2, prism: Prism, prismToolboxNode: Node, prismLayer: Node, dragBoundsProperty: Property<Bounds2>,
                      occlusionHandler: ( prismNode: PrismNode ) => void, isIcon: boolean ) {

    super( { cursor: 'pointer' } );
    const knobHeight = 15;

    // It looks like a box on the side of the prism
    const knobNode = new Image( knob_png );
    if ( prism.shapeProperty.get().getReferencePoint() ) {
      this.addChild( knobNode );
    }

    // Prism rotation with knob
    let previousAngle: number;
    let prismCenterPoint;
    let knobDragListener: DragListener | null = null;
    if ( !isIcon ) {
      knobDragListener = new DragListener( {
        start: ( event: SceneryEvent ) => {
          this.moveToFront();
          const start = knobNode.globalToParentPoint( event.pointer.point );
          prismCenterPoint = prism.getTranslatedShape().getRotationCenter();
          const startX = modelViewTransform.viewToModelX( start.x );// model values
          const startY = modelViewTransform.viewToModelY( start.y );// model values
          previousAngle = Math.atan2( ( prismCenterPoint.y - startY ), ( prismCenterPoint.x - startX ) );
        },
        drag: ( event: SceneryEvent ) => {
          const end = knobNode.globalToParentPoint( event.pointer.point );
          prismCenterPoint = prism.getTranslatedShape().getRotationCenter();
          const endX = modelViewTransform.viewToModelX( end.x );// model values
          const endY = modelViewTransform.viewToModelY( end.y );// model values
          const angle = Math.atan2( ( prismCenterPoint.y - endY ), ( prismCenterPoint.x - endX ) );
          prism.rotate( angle - previousAngle );
          previousAngle = angle;
        },

        // A Prism cannot be put back into the toolbox by rotating it.
        end: _.noop
      } );
      knobNode.addInputListener( knobDragListener );
      knobNode.touchArea = Shape.circle( 0, 10, 40 );
    }

    const prismPathNode = new Path( modelViewTransform.modelToViewShape( prism.getTranslatedShape().shape ), {
      stroke: 'gray'
    } );
    this.addChild( prismPathNode );

    // Keep within the drag bounds. For unknown reasons, this works but passing dragBoundsProperty directly does not.
    const keepInBounds = () => {
      const viewPosition = modelViewTransform.modelToViewPosition( prism.positionProperty.value );
      prism.positionProperty.value = modelViewTransform.viewToModelPosition( dragBoundsProperty.value.closestPointTo( viewPosition ) );
    };

    this.dragListener = new DragListener( {
      useParentOffset: true,
      positionProperty: prism.positionProperty,
      transform: modelViewTransform,
      drag: keepInBounds,
      end: () => {
        occlusionHandler( this );
        if ( prismToolboxNode.visibleBounds.containsCoordinates( this.getCenterX(), this.getCenterY() ) ) {
          if ( prismLayer.hasChild( this ) ) {
            prism.dispose();
          }
          prismsModel.dirty = true;
        }
      }
    } );

    prism.disposeEmitter.addListener( () => {
      console.log( 'dispose callback' );

      prismsModel.removePrism( prism );
      prism.shapeProperty.unlink( this.updatePrismShape );
      prism.positionProperty.unlink( this.updatePrismShape );
      dragBoundsProperty.unlink( keepInBounds );
      prismsModel.prismMediumProperty.unlink( this.updatePrismColor );
      prismLayer.removeChild( this );

      prismPathNode.removeInputListener( this.dragListener );
      prismPathNode.dispose();

      this.dragListener.dispose();

      knobNode.removeInputListener( knobDragListener! );
      knobDragListener!.dispose();

      knobNode.dispose();
      this.dispose();

      prismsModel.mediumColorFactory.lightTypeProperty.unlink( this.updatePrismColor );
    } );

    // When the window reshapes, make sure no prism is left outside of the play area
    dragBoundsProperty.lazyLink( keepInBounds );

    if ( !isIcon ) {
      prismPathNode.addInputListener( this.dragListener );
    }

    const knobCenterPoint = new Vector2( -knobNode.getWidth() - 7, -knobNode.getHeight() / 2 - 8 );

    // also used in PrismToolboxNode
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

    // used in PrismToolboxNode
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
     */
    this.translateViewXY = ( x, y ) => {
      const delta = modelViewTransform.viewToModelDeltaXY( x, y );
      prism.translate( delta.x, delta.y );
    };
  }
}

bendingLight.register( 'PrismNode', PrismNode );