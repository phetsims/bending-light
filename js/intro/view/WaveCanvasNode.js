// Copyright 2002-2015, University of Colorado Boulder
/**
 *  * A  Wave particle layer rendered on canvas
 *  * @author Chandrashekar Bemagoni  (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   *
   * @param waveParticles
   * @param modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function WaveCanvasNode( waveParticles, modelViewTransform, options ) {
    this.modelViewTransform = modelViewTransform;
    this.waveParticles = waveParticles;
    CanvasNode.call( this, options );
    this.invalidatePaint();
  }

  return inherit( CanvasNode, WaveCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var particle;
      var x;
      var y;
      var angle;
      var point1X;
      var point1Y;
      var point2X;
      var point2Y;
      var particleWidth;
      for ( var i = 0; i < this.waveParticles.length; i++ ) {
        particle = this.waveParticles.get( i );
        particleWidth = this.modelViewTransform.modelToViewDeltaX( particle.width );
        x = this.modelViewTransform.modelToViewX( particle.position.x );
        y = this.modelViewTransform.modelToViewY( particle.position.y );
        angle = particle.angle;
        point1X = x + (particleWidth * Math.sin( angle ) / 2);
        point1Y = y + (particleWidth * Math.cos( angle ) / 2);
        point2X = x - (particleWidth * Math.sin( angle ) / 2);
        point2Y = y - (particleWidth * Math.cos( angle ) / 2);
        var lineWidth = this.modelViewTransform.modelToViewDeltaX( particle.height );
        var gradient = context.createLinearGradient( x, y, x - lineWidth * Math.cos( angle ), y + lineWidth * Math.sin( angle ) );
        gradient.addColorStop( 0, particle.color );
        gradient.addColorStop( 0.5, particle.particleGradientColor );
        gradient.addColorStop( 1, particle.color );
        context.beginPath();
        context.moveTo( point2X, point2Y );
        context.lineTo( point1X, point1Y );
        context.lineTo( point1X - lineWidth * Math.cos( angle ), point1Y + lineWidth * Math.sin( angle ) );
        context.lineTo( point2X - lineWidth * Math.cos( angle ), point2Y + lineWidth * Math.sin( angle ) );
        context.closePath();
        context.fillStyle = gradient;
        context.fill();
      }
    },

    step: function() {
      this.invalidatePaint();
    }

  } );
} );