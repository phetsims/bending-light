// Copyright 2015-2019, University of Colorado Boulder

/**
 * A Wave particle layer rendered on canvas.  On iPad3 using canvas (webgl=false), gradients are too expensive
 * to render, so we approximate the wave view by rendering the wave crests against a colored background.)
 * See #154
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import bendingLight from '../../bendingLight.js';

/**
 * @param {ObservableArray.<LightRay>} lightRays - the light rays from the model
 * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
 * @param {Object} [options] - options that can be passed on to the underlying node
 * @constructor
 */
function WaveCanvasNode( lightRays, modelViewTransform, options ) {
  this.lightRays = lightRays;
  this.modelViewTransform = modelViewTransform; // @public (read-only)
  CanvasNode.call( this, options );
}

bendingLight.register( 'WaveCanvasNode', WaveCanvasNode );

export default inherit( CanvasNode, WaveCanvasNode, {

  /**
   * Paints the particles on the canvas node.
   * @protected
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas: function( context ) {

    // Render the incident ray last so that it will overlap the reflected ray completely
    for ( let k = this.lightRays.length - 1; k >= 0; k-- ) {
      const ray = this.lightRays.get( k );

      if ( ray.particles.length > 0 ) {

        // Each ray has its own clipping and rotation, so store the untransformed state before manipulation
        context.save();

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

        const particle = ray.particles.get( 0 );

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
  },

  /**
   * @public
   */
  step: function() {
    this.invalidatePaint();
  }
} );