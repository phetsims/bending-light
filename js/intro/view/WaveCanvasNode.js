// Copyright 2002-2015, University of Colorado Boulder

/**
 * A Wave particle layer rendered on canvas
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   * @param {ObservableArray.<LightRay>} lightRays - the light rays from the model
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function WaveCanvasNode( lightRays, modelViewTransform, options ) {
    this.lightRays = lightRays;
    this.modelViewTransform = modelViewTransform; // @public
    CanvasNode.call( this, options );
  }

  return inherit( CanvasNode, WaveCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;

      // Render the incident ray last so that it will overlap the reflected ray completely
      for ( var k = this.lightRays.length; k >= 0; k-- ) {
        var ray = this.lightRays.get( k );

        // Each ray has its own clipping and rotation, so store the untransformed state before manipulation
        context.save();

        // Each ray has its own shape, which is used as a clipping region.
        context.beginPath();
        ray.waveShapeCommand( context, this.modelViewTransform );
        context.clip();

        if ( ray.particles.length > 0 ) {
          var particle = ray.particles.get( 0 );

          // Set the origin at the beginning of the particle
          context.translate(
            this.modelViewTransform.modelToViewX( particle.getX() ),
            this.modelViewTransform.modelToViewY( particle.getY() )
          );

          // Rotate to align with the beam, note that model space is inverted from view space so the angle is reversed
          context.rotate( -particle.angle );

          // Distance between wave crests
          var wavelength = this.modelViewTransform.modelToViewDeltaX( particle.height );

          // Fill the background with the dark color, in the entire clip area
          context.fillStyle = particle.particleGradientColor;
          context.fillRect( -1000, -1000, 2000, 2000 );

          // Set up the color for the wave crests
          context.fillStyle = particle.color;

          // Render each crest, but we don't need as many wavelengths for the incoming light
          var maxIndex = (k === 0 ? 50 : 150);
          for ( var i = -1; i < maxIndex; i++ ) {
            context.fillRect( wavelength * i, -100, wavelength / 2, 200 );
          }
        }

        // Undo the clipping and transformations above to get ready for the next ray
        context.restore();
      }
    },

    /**
     * @public
     */
    step: function() {
      this.invalidatePaint();
    }

  } );
} );