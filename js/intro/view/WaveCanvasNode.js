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
  function WaveCanvasNode( waveParticles, modelViewTransform, options ) {
    this.modelViewTransform = modelViewTransform; // @public
    this.waveParticles = waveParticles; // @private
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
      for ( var i = 0; i < this.waveParticles.length; i++ ) {
        var particle = this.waveParticles.get( i );
        var particleWidth = this.modelViewTransform.modelToViewDeltaX( particle.width );
        var x = this.modelViewTransform.modelToViewX( particle.getX() );
        var y = this.modelViewTransform.modelToViewY( particle.getY() );
        var angle = particle.angle;
        var point1X = x + (particleWidth * Math.sin( angle ) / 2);
        var point1Y = y + (particleWidth * Math.cos( angle ) / 2);
        var point2X = x - (particleWidth * Math.sin( angle ) / 2);
        var point2Y = y - (particleWidth * Math.cos( angle ) / 2);
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

    /**
     * @public
     */
    step: function() {
      this.invalidatePaint();
    }

  } );
} );