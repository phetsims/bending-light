// Copyright 2015, University of Colorado Boulder

/**
 * This CanvasNode renders the light rays for the non-white rays.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightRay = require( 'BENDING_LIGHT/common/model/LightRay' );

  // constants
  var lineDash = [];

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {number} stageWidth - width of the dev area
   * @param {number} stageHeight - height of the dev area
   * @param {ObservableArray.<LightRay>} rays -
   * @constructor
   */
  function SingleColorLightCanvasNode( modelViewTransform, stageWidth, stageHeight, rays ) {

    CanvasNode.call( this, {
      canvasBounds: new Bounds2( 0, 0, stageWidth, stageHeight )
    } );
    this.modelViewTransform = modelViewTransform; // @private

    this.rays = rays;
    this.invalidatePaint();

    this.strokeWidth = this.modelViewTransform.modelToViewDeltaX( LightRay.RAY_WIDTH );
  }

  bendingLight.register( 'SingleColorLightCanvasNode', SingleColorLightCanvasNode );
  
  return inherit( CanvasNode, SingleColorLightCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @protected
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {

      context.save();
      context.lineWidth = this.strokeWidth;

      // Sometimes dashes from other canvases leak over here, so we must clear the dash
      // until this leak is fixed. See #258
      context.setLineDash( lineDash );
      context.lineCap = 'round';

      for ( var i = 0; i < this.rays.length; i++ ) {
        var ray = this.rays.get( i );

        // iPad3 shows a opacity=0 ray as opacity=1 for unknown reasons, so we simply omit those rays
        if ( ray.powerFraction > 1E-6 ) {
          context.beginPath();

          context.strokeStyle = 'rgba(' +
                                ray.color.getRed() + ',' +
                                ray.color.getGreen() + ',' +
                                ray.color.getBlue() + ',' +
                                Math.sqrt( ray.powerFraction ) +
                                ')';

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
    },

    step: function() {
      this.invalidatePaint();
    }
  } );
} );