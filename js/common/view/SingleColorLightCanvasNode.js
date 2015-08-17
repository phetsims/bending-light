// Copyright 2002-2015, University of Colorado Boulder

/**
 * This CanvasNode renders the light rays for the non-white rays.  It is used only when WebGL is not available.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var LightRay = require( 'BENDING_LIGHT/common/model/LightRay' );

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
    this.stageHeight = stageHeight; // @private
    this.stageWidth = stageWidth; // @private

    this.rays = rays;
    this.invalidatePaint();

    this.strokeWidth = this.modelViewTransform.modelToViewDeltaX( LightRay.RAY_WIDTH );
  }

  return inherit( CanvasNode, SingleColorLightCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;

      // The overall translation offset of the canvas.  We must subtract this off of ray coordinates to compensate
      var dx = this.dx;
      var dy = this.dy;

      context.lineWidth = this.strokeWidth;
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
            this.modelViewTransform.modelToViewX( ray.tail.x ) - dx,
            this.modelViewTransform.modelToViewY( ray.tail.y ) - dy
          );

          context.lineTo(
            this.modelViewTransform.modelToViewX( ray.tip.x ) - dx,
            this.modelViewTransform.modelToViewY( ray.tip.y ) - dy
          );
          context.stroke();
        }
      }

      // This debug code shows the bounds 
      //context.lineWidth = 10;
      //context.strokeStyle = 'blue';
      //context.strokeRect(
      //  0, 0,
      //  this.canvasBounds.width, this.canvasBounds.height
      //);
    },

    step: function() {
      this.invalidatePaint();
    },
    setTranslation: function( dx, dy ) {
      this.dx = dx;
      this.dy = dy;
      CanvasNode.prototype.setTranslation.call( this, dx, dy );
    }
  } );
} );