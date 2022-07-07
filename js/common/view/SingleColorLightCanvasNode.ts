// Copyright 2015-2022, University of Colorado Boulder

/**
 * This CanvasNode renders the light rays for the non-white rays.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { CanvasNode } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import LightRay from '../model/LightRay.js';

// constants
const lineDash: number[] = [];

class SingleColorLightCanvasNode extends CanvasNode {
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly rays: LightRay[];
  private readonly strokeWidth: number;

  /**
   * @param modelViewTransform - converts between model and view co-ordinates
   * @param stageWidth - width of the dev area
   * @param stageHeight - height of the dev area
   * @param rays -
   */
  public constructor( modelViewTransform: ModelViewTransform2, stageWidth: number, stageHeight: number, rays: LightRay[] ) {

    super( {
      canvasBounds: new Bounds2( 0, 0, stageWidth, stageHeight )
    } );
    this.modelViewTransform = modelViewTransform;

    this.rays = rays;
    this.invalidatePaint();

    this.strokeWidth = this.modelViewTransform.modelToViewDeltaX( LightRay.RAY_WIDTH );
  }

  /**
   * Paints the particles on the canvas node.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {

    context.save();
    context.lineWidth = this.strokeWidth;

    // Sometimes dashes from other canvases leak over here, so we must clear the dash
    // until this leak is fixed. See #258
    context.setLineDash( lineDash );
    context.lineCap = 'round';

    for ( let i = 0; i < this.rays.length; i++ ) {
      const ray = this.rays[ i ];

      // iPad3 shows a opacity=0 ray as opacity=1 for unknown reasons, so we simply omit those rays
      if ( ray.powerFraction > 1E-6 ) {
        context.beginPath();

        context.strokeStyle = `rgba(${
          ray.color.getRed()},${
          ray.color.getGreen()},${
          ray.color.getBlue()},${
          Math.sqrt( ray.powerFraction )
        })`;

        context.moveTo(
          this.modelViewTransform.modelToViewX( ray.tail.x ),
          this.modelViewTransform.modelToViewY( ray.tail.y )
        );

        context.lineTo(
          this.modelViewTransform.modelToViewX( ray.tip.x ),
          this.modelViewTransform.modelToViewY( ray.tip.y )
        );
        context.stroke();
      }
    }
    context.restore();

    // This debug code shows the bounds
    // context.lineWidth = 10;
    // context.strokeStyle = 'blue';
    // context.strokeRect(
    //  this.canvasBounds.minX, this.canvasBounds.minY,
    //  this.canvasBounds.width, this.canvasBounds.height
    // );
  }

  public step(): void {
    this.invalidatePaint();
  }
}

bendingLight.register( 'SingleColorLightCanvasNode', SingleColorLightCanvasNode );

export default SingleColorLightCanvasNode;