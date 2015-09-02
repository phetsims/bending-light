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

    this.scratchCanvas = document.createElement( 'canvas' );
    this.scratchCanvas.width = 100;
    this.scratchCanvas.hegiht = 100;
    var context = this.scratchCanvas.getContext( '2d' );
    context.fillStyle = 'blue';
    context.fillRect( 0, 0, 100, 30 );
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

        if ( ray.particles.length >= 2 ) {
          var firstParticle = ray.particles.get( 0 );
          var lastParticle = ray.particles.get( ray.particles.length - 1 );
          //context.beginPath();
          //context.moveTo(
          //  this.modelViewTransform.modelToViewX( firstParticle.getX() ),
          //  this.modelViewTransform.modelToViewY( firstParticle.getY() )
          //);
          //context.lineTo(
          //  this.modelViewTransform.modelToViewX( lastParticle.getX() ),
          //  this.modelViewTransform.modelToViewY( lastParticle.getY() )
          //);
          //context.strokeStyle = firstParticle.particleGradientColor;
          //var width = this.modelViewTransform.modelToViewDeltaX( firstParticle.width );
          //context.lineWidth = width;
          //context.stroke();

          //context.save();
          context.translate(
            this.modelViewTransform.modelToViewX( firstParticle.getX() ),
            this.modelViewTransform.modelToViewY( firstParticle.getY() )
          );
          context.rotate( -firstParticle.angle );

          context.fillStyle = firstParticle.particleGradientColor;
          context.fillRect( -1000, -1000, 2000, 2000 );

          context.fillStyle = firstParticle.color;
          for ( var i = 0; i < 50; i++ ) {
            context.fillRect( 20 * i, -100, 10, 200 );
          }
        }

        //for ( var i = 0; i < ray.particles.length; i++ ) {
        //  var particle = ray.particles.get( i );
        //  var particleWidth = this.modelViewTransform.modelToViewDeltaX( particle.width );
        //  var x = this.modelViewTransform.modelToViewX( particle.getX() );
        //  var y = this.modelViewTransform.modelToViewY( particle.getY() );
        //  var angle = particle.angle;
        //  var sinAngle = Math.sin( angle );
        //  var point1X = x + (particleWidth * sinAngle / 2);
        //  var cosAngle = Math.cos( angle );
        //  var point1Y = y + (particleWidth * cosAngle / 2);
        //  var point2X = x - (particleWidth * sinAngle / 2);
        //  var point2Y = y - (particleWidth * cosAngle / 2);
        //
        //  // wave particle height
        //  var lineWidth = this.modelViewTransform.modelToViewDeltaX( particle.height );
        //  var corner1Y = point1Y + lineWidth * sinAngle;
        //  var corner2Y = point2Y + lineWidth * sinAngle;
        //  var corner1X = point1X - lineWidth * cosAngle;
        //  var corner2X = point2X - lineWidth * cosAngle;
        //  if ( this.canvasBounds.containsCoordinates( point1X, point1Y ) ||
        //       this.canvasBounds.containsCoordinates( point1X, point1Y ) ||
        //       this.canvasBounds.containsCoordinates( corner1X, corner1Y ) ||
        //       this.canvasBounds.containsCoordinates( corner2X, corner2Y ) ) {
        //
        //    // apply gradient to wave particle
        //    //var gradient = context.createLinearGradient( x, y, x - lineWidth * cosAngle, y + lineWidth * sinAngle );
        //    //gradient.addColorStop( 0, particle.color );
        //    //gradient.addColorStop( 0.5, particle.particleGradientColor );
        //    //gradient.addColorStop( 1, particle.color );
        //
        //    // draw wave particle
        //    context.fillStyle = particle.color;
        //    context.fillRect( point2X, point2Y, 10, 10 );
        //    //context.beginPath();
        //    //context.moveTo( point2X, point2Y );
        //    //context.lineTo( point1X, point1Y );
        //    //context.lineTo( corner1X, corner1Y );
        //    //context.lineTo( corner2X, corner2Y );
        //    //context.closePath();
        //    //context.fillStyle = gradient;
        //    //context.fill();
        //  }
        //}
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