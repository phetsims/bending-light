// Copyright 2002-2015, University of Colorado Boulder

/**
 * A Wave particle layer rendered on canvas
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   * @param {ObservableArray<WaveParticle>} waveParticles - model of wave particles contains position, color etc
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function WaveCanvasNode( introView, modelViewTransform, options ) {
    this.introView = introView;
    this.modelViewTransform = modelViewTransform; // @public
    CanvasNode.call( this, options );
    this.invalidatePaint();
  }

  return inherit( CanvasNode, WaveCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;

      var model = this.introView.bendingLightModel;

      // Render the incident ray last so that it will overlap the reflected ray completely
      var order = [ 2, 1, 0 ];
      for ( var k = 0; k < model.rays.length; k++ ) {
        var ray = model.rays.get( order[ k ] );
        context.save();

        context.beginPath();
        ray.waveShapeCommand( context, this.modelViewTransform );
        context.clip();

        for ( var i = 0; i < ray.particles.length; i++ ) {
          var particle = ray.particles.get( i );
          var particleWidth = this.modelViewTransform.modelToViewDeltaX( particle.width );
          var x = this.modelViewTransform.modelToViewX( particle.getX() );
          var y = this.modelViewTransform.modelToViewY( particle.getY() );
          var angle = particle.angle;
          var sinAngle = Math.sin( angle );
          var point1X = x + (particleWidth * sinAngle / 2);
          var cosAngle = Math.cos( angle );
          var point1Y = y + (particleWidth * cosAngle / 2);
          var point2X = x - (particleWidth * sinAngle / 2);
          var point2Y = y - (particleWidth * cosAngle / 2);

          // wave particle height
          var lineWidth = this.modelViewTransform.modelToViewDeltaX( particle.height );
          var corner1Y = point1Y + lineWidth * sinAngle;
          var corner2Y = point2Y + lineWidth * sinAngle;
          var corner1X = point1X - lineWidth * cosAngle;
          var corner2X = point2X - lineWidth * cosAngle;
          if ( this.canvasBounds.containsCoordinates( point1X, point1Y ) ||
               this.canvasBounds.containsCoordinates( point1X, point1Y ) ||
               this.canvasBounds.containsCoordinates( corner1X, corner1Y ) ||
               this.canvasBounds.containsCoordinates( corner2X, corner2Y ) ) {

            // apply gradient to wave particle
            var gradient = context.createLinearGradient( x, y, x - lineWidth * cosAngle, y + lineWidth * sinAngle );
            gradient.addColorStop( 0, particle.color );
            gradient.addColorStop( 0.5, particle.particleGradientColor );
            gradient.addColorStop( 1, particle.color );

            // draw wave particle
            context.beginPath();
            context.moveTo( point2X, point2Y );
            context.lineTo( point1X, point1Y );
            context.lineTo( corner1X, corner1Y );
            context.lineTo( corner2X, corner2Y );
            context.closePath();
            context.fillStyle = gradient;
            context.fill();
          }
        }
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