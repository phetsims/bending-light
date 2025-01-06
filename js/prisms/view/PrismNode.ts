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

const knobHeight = 15;

export default class PrismNode extends Node {
  public readonly dragListener: DragListener | null = null;
  private readonly prismPathNode: Path;
  private readonly knobNode: Image;

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
  public constructor( public readonly prismsModel: PrismsModel,
                      public readonly modelViewTransform: ModelViewTransform2,
                      public readonly prism: Prism,
                      prismToolboxNode: Node,
                      public readonly prismLayer: Node,
                      dragBoundsProperty: Property<Bounds2>,
                      occlusionHandler: ( prismNode: PrismNode ) => void, isIcon: boolean ) {

    super( { cursor: 'pointer' } );

    // It looks like a box on the side of the prism
    this.knobNode = new Image( knob_png );
    if ( prism.shapeProperty.get().getReferencePoint() ) {
      this.addChild( this.knobNode );
    }
    this.addDisposable( this.knobNode );

    // Prism rotation with knob
    if ( !isIcon ) {

      let previousAngle: number;
      let prismCenterPoint;
      const knobDragListener = new DragListener( {
        start: ( event: SceneryEvent ) => {
          this.moveToFront();
          const start = this.knobNode.globalToParentPoint( event.pointer.point );
          prismCenterPoint = prism.getTranslatedShape().getRotationCenter();
          const startX = modelViewTransform.viewToModelX( start.x );// model values
          const startY = modelViewTransform.viewToModelY( start.y );// model values
          previousAngle = Math.atan2( ( prismCenterPoint.y - startY ), ( prismCenterPoint.x - startX ) );
        },
        drag: ( event: SceneryEvent ) => {
          const end = this.knobNode.globalToParentPoint( event.pointer.point );
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
      this.knobNode.addInputListener( knobDragListener, { disposer: this } );
      this.knobNode.touchArea = Shape.circle( 0, 10, 40 );

      this.addDisposable( knobDragListener );
    }

    this.prismPathNode = new Path( modelViewTransform.modelToViewShape( prism.getTranslatedShape().shape ), {
      stroke: 'gray'
    } );
    this.addChild( this.prismPathNode );

    // Keep within the drag bounds. For unknown reasons, this works but passing dragBoundsProperty directly does not.
    const keepInBounds = () => {
      const viewPosition = modelViewTransform.modelToViewPosition( prism.positionProperty.value );
      const newValue = modelViewTransform.viewToModelPosition( dragBoundsProperty.value.closestPointTo( viewPosition ) );

      // This algorithm is subject to roundoff error and hence only apply it if the position has changed significantly
      if ( prism.positionProperty.value.distance( newValue ) > 1E-12 ) {
        prism.positionProperty.value = newValue;
      }
    };

    const prismShapeListener = () => this.updatePrismShape();
    const prismColorListener = () => this.updatePrismColor();

    prism.addDisposable( this );

    // When the window reshapes, make sure no prism is left outside of the play area
    dragBoundsProperty.lazyLink( keepInBounds, { disposer: this } );

    if ( !isIcon ) {
      this.dragListener = new DragListener( {
        useParentOffset: true,
        positionProperty: prism.positionProperty,
        transform: modelViewTransform,
        drag: keepInBounds,
        end: () => {
          occlusionHandler( this );
          if ( prismToolboxNode.visibleBounds.containsCoordinates( this.getCenterX(), this.getCenterY() ) ) {
            if ( prismLayer.hasChild( this ) ) {
              prismsModel.removePrism( prism );
            }
            prismsModel.dirty = true;
          }
        }
      } );

      this.prismPathNode.addInputListener( this.dragListener, { disposer: this } );
      this.addDisposable( this.dragListener );
    }

    prism.shapeProperty.link( prismShapeListener, { disposer: this } );
    prism.positionProperty.link( prismShapeListener, { disposer: this } );

    prismsModel.mediumColorFactory.lightTypeProperty.link( prismColorListener, { disposer: this } );
    prismsModel.prismMediumProperty.link( prismColorListener, { disposer: this } );

    this.updatePrismShape();
  }

  public updatePrismShape(): void {
    if ( !this.knobNode ) {
      return;
    }

    const knobCenterPoint = new Vector2( -this.knobNode.getWidth() - 7, -this.knobNode.getHeight() / 2 - 8 );

    const delta = this.prism.positionProperty.value;
    this.prismPathNode.setShape( this.modelViewTransform.modelToViewShape( this.prism.shapeProperty.get().getTranslatedInstance( delta.x, delta.y ).shape ) );

    const prismReferencePoint = this.prism.getTranslatedShape().getReferencePoint();
    if ( prismReferencePoint ) {
      const prismShapeCenter = this.prism.getTranslatedShape().getRotationCenter();
      this.knobNode.resetTransform();

      this.knobNode.setScaleMagnitude( knobHeight / this.knobNode.height );

      const prismReferenceXPosition = this.modelViewTransform.modelToViewX( prismReferencePoint.x );
      const prismReferenceYPosition = this.modelViewTransform.modelToViewY( prismReferencePoint.y );
      const prismCenterX = this.modelViewTransform.modelToViewX( prismShapeCenter.x );
      const prismCenterY = this.modelViewTransform.modelToViewY( prismShapeCenter.y );

      // Calculate angle
      const angle = Math.atan2( ( prismCenterY - prismReferenceYPosition ), ( prismCenterX - prismReferenceXPosition ) );
      knobCenterPoint.x = -this.knobNode.getWidth() - 7;
      knobCenterPoint.y = -this.knobNode.getHeight() / 2 - 8;
      this.knobNode.rotateAround( knobCenterPoint, angle );
      this.knobNode.setTranslation( prismReferenceXPosition, prismReferenceYPosition );

      this.knobNode.translate( knobCenterPoint );
    }

    this.prismsModel.dirty = true;
  }

  public updatePrismColor(): void {
    const indexOfRefraction = this.prismsModel.prismMediumProperty.value.substance.indexOfRefractionForRedLight;

    this.prismPathNode.fill = this.prismsModel.mediumColorFactory.getColor( indexOfRefraction ).withAlpha( BendingLightConstants.PRISM_NODE_ALPHA );
  }

  /**
   * Called from the occlusion handler.  Translates the view by the specified amount by translating the corresponding
   * model
   */
  public translateViewXY( x: number, y: number ): void {
    const delta = this.modelViewTransform.viewToModelDeltaXY( x, y );
    this.prism.translate( delta.x, delta.y );
  }
}

bendingLight.register( 'PrismNode', PrismNode );