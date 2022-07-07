// Copyright 2015-2022, University of Colorado Boulder

/**
 * A Wave particle layer rendered on canvas.  On iPad3 using canvas (webgl=false), gradients are too expensive
 * to render, so we approximate the wave view by rendering the wave crests against a colored background.)
 * See #154
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { CanvasNode, NodeOptions } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import LightRay from '../../common/model/LightRay.js';

class WaveCanvasNode extends CanvasNode {
  private readonly lightRays: LightRay[];
  private readonly modelViewTransform: ModelViewTransform2;

  /**
   * @param lightRays - the light rays from the model
   * @param modelViewTransform - Transform between model and view coordinate frames
   * @param [providedOptions] - options that can be passed on to the underlying node
   */
  public constructor( lightRays: LightRay[], modelViewTransform: ModelViewTransform2, providedOptions?: NodeOptions ) {

    super( providedOptions );
    this.lightRays = lightRays;
    this.modelViewTransform = modelViewTransform; // (read-only)
  }

  /**
   * Paints the particles on the canvas node.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {

    // Render the incident ray last so that it will overlap the reflected ray completely
    for ( let k = this.lightRays.length - 1; k >= 0; k-- ) {
      const ray = this.lightRays[ k ];

      if ( ray.particles.length > 0 ) {

        // Each ray has its own clipping and rotation, so store the untransformed state before manipulation
        context.save();

        if ( ray.clipRegionCorners ) {

          // Each ray has its own shape, which is used as a clipping region.
          context.beginPath();
          context.moveTo(
            this.modelViewTransform.modelToViewX( ray.clipRegionCorners[ 0 ].x ),
            this.modelViewTransform.modelToViewY( ray.clipRegionCorners[ 0 ].y )
          );
          for ( let m = 1; m <= 3; m++ ) {
            context.lineTo(
              this.modelViewTransform.modelToViewX( ray.clipRegionCorners[ m ].x ),
              this.modelViewTransform.modelToViewY( ray.clipRegionCorners[ m ].y )
            );
          }
          context.clip();
        }

        const particle = ray.particles[ 0 ];

        // Set the origin at the beginning of the particle
        context.translate(
          this.modelViewTransform.modelToViewX( particle.getX() ),
          this.modelViewTransform.modelToViewY( particle.getY() )
        );

        // Rotate to align with the beam, note that model space is inverted from view space so the angle is reversed
        context.rotate( -particle.angle );

        // Distance between wave crests
        const wavelength = this.modelViewTransform.modelToViewDeltaX( particle.height );

        // Fill the background with the dark color, in the entire clip area
        context.fillStyle = particle.particleGradientColor;
        context.fillRect( -1000, -1000, 2000, 2000 );

        // Set up the color for the wave crests
        context.fillStyle = particle.color;

        // Render each crest, but we don't need as many wavelengths for the incoming light
        // The extreme case is violet light with a shallow angle and a tall screen.
        const maxIndex = ( k === 0 ? 50 : 150 );
        for ( let i = -1; i < maxIndex; i++ ) {
          context.fillRect( wavelength * i, -100, wavelength / 2, 200 );
        }

        // Undo the clipping and transformations above to get ready for the next ray
        context.restore();
      }
    }
  }

  /**
   */
  public step(): void {
    this.invalidatePaint();
  }
}

bendingLight.register( 'WaveCanvasNode', WaveCanvasNode );

export default WaveCanvasNode;