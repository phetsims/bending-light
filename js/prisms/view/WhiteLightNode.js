// Copyright 2002 - 2015, University of Colorado Boulder

/**
 * In order to support white light, we need to perform additive color mixing (not subtractive,
 * as is the default when drawing transparent colors on top of each other in Java).
 * <p/>
 * This class uses the Bresenham line drawing algorithm (with a stroke thickness of 2) to determine which pixels each
 * ray inhabits. When multiple rays hit the same pixel, their RGB values are added.  If any of the RG or B values is
 * greater than the maximum of 255, then RGB values are scaled down and the leftover part is put into the "intensity"
 * value (which is the sum of the ray intensities). The intensity is converted to a transparency value according to
 * alpha = sqrt(intensity/3), which is also clamped to be between 0 and 255.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Util = require( 'DOT/Util' );

  /**
   *
   * @param {Node} rayLayer
   * @param {number} stageWidth
   * @param {number} stageHeight
   * @constructor
   */
  function WhiteLightNode( rayLayer, stageWidth, stageHeight ) {

    CanvasNode.call( this, {
      canvasBounds: new Bounds2( 0, 0, stageWidth, stageHeight )
    } );
    this.invalidatePaint();
    this.rayLayer = rayLayer;
    this.stageHeight = stageHeight;
    this.stageWidth = stageWidth;
    this.hashMapPointArray = [];
  }

  return inherit( CanvasNode, WhiteLightNode, {

    /**
     * Paints the particles on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      context.beginPath();
      var map = {};
      for ( var i = 0; i < this.rayLayer.getChildrenCount(); i++ ) {
        var child = this.rayLayer.getChildAt( i );

        // Get the line values to make the next part more readable
        var start = child.getLine().start;
        var end = child.getLine().end;
        var x1 = Math.round( start.x );
        var y1 = Math.round( start.y );
        var x2 = Math.round( end.x );
        var y2 = Math.round( end.y );

        // Some lines don't start in the play area; have to check and swap to make sure the line isn't pruned
        if ( this.isOutOfBounds( x1, y1 ) ) {
          this.draw( x2, y2, x1, y1, child, map );
        }
        else {
          this.draw( x1, y1, x2, y2, child, map );
        }
      }
      // Don't let things become completely white, since the background is white
      var whiteLimit = 0.2;
      var maxChannel = 1 - whiteLimit;

      // Extra factor to make it white instead of cream/orange
      var scale = 2;

      for ( i = 0; i < this.hashMapPointArray.length; i++ ) {
        var samples = map[ this.hashMapPointArray[ i ] ];
        var pointX = samples[ 4 ];
        var pointY = samples[ 5 ];
        var intensity = samples[ 3 ];

        // Move excess samples value into the intensity column
        var max = samples[ 0 ];
        if ( samples[ 1 ] > max ) {
          max = samples[ 1 ];
        }
        if ( samples[ 2 ] > max ) {
          max = samples[ 2 ];
        }

        // Scale and clamp the samples
        samples[ 0 ] = Util.clamp( samples[ 0 ] / max * scale - whiteLimit, 0, maxChannel );
        samples[ 1 ] = Util.clamp( samples[ 1 ] / max * scale - whiteLimit, 0, maxChannel );
        samples[ 2 ] = Util.clamp( samples[ 2 ] / max * scale - whiteLimit, 0, maxChannel );
        intensity = intensity * max;

        // Don't let it become fully opaque or it looks too dark against white background
        var alpha = Util.clamp( Math.sqrt( intensity ), 0, 1 );
        var pixelColor = samples[ 6 ];
        pixelColor.set( samples[ 0 ] * 255, samples[ 1 ] * 255, samples[ 2 ] * 255, alpha );

        // Set the color and fill in the pixel
        context.fillRect( pointX, pointY, 0.7, 0.7 );
        context.fillStyle = pixelColor.toCSS();
        context.fill();
      }
      context.closePath();
      this.hashMapPointArray = [];
    },

    /**
     * @private
     * @param {number} x0 - x position in view co-ordinates
     * @param  {number} y0 - y position in view co-ordinates
     * @returns {boolean}
     */
    isOutOfBounds: function( x0, y0 ) {
      return x0 < 0 || y0 < 0 || x0 > this.stageWidth || y0 > this.stageHeight;
    },

    /**
     * Add the specified point to the HashMap, creating a new entry if necessary, otherwise adding it to existing
     * values. Take the intensity as the last component of the array
     * @private
     * @param {number} x0 - x position in view co-ordinates
     * @param  {number} y0 - y position in view co-ordinates
     * @param {Color} color
     * @param {number} intensity
     * @param {Object} map
     */
    addToMap: function( x0, y0, color, intensity, map ) {
      // So that rays don't start fully saturated: this makes it so that it is possible to see the decrease in intensity
      // after a (nontotal) reflection
      var keyPoint = (17647448 * x0 + 13333 * y0 + 33);
      if ( !map[ keyPoint ] ) {
        this.hashMapPointArray.push( keyPoint );

        // Seed with zeros so it can be summed
        map[ keyPoint ] = [ 0, 0, 0, 0, x0, y0, color ];
      }
      var brightnessFactor = 0.017;
      var current = map[ keyPoint ];
      var term = [ color.getRed() / 255, color.getGreen() / 255, color.getBlue() / 255 ];
      // Don't apply brightness factor to intensities
      for ( var a = 0; a < 3; a++ ) {
        current[ a ] = current[ a ] + term[ a ] * brightnessFactor;
      }
      // Add intensities, then convert to alpha later;
      current[ 3 ] = current[ 3 ] + intensity;
    },

    /**
     * @public
     */
    step: function() {
      this.invalidatePaint();
    },

    /**
     * @private
     * @param {number} x0 - x position in view co-ordinates
     * @param  {number} y0 - y position in view co-ordinates
     * @param {Node} child
     * @param {Object} map
     */
    setPixel: function( x0, y0, child, map ) {
      var color = child.getColor();
      var intensity = child.getLightRay().getPowerFraction();
      this.addToMap( x0, y0, color, intensity, map );
      //Some additional points makes it look a lot better (less sparse) without slowing it down too much
      this.addToMap( x0 + 0.5, y0, color, intensity, map );
      this.addToMap( x0, y0 + 0.5, color, intensity, map );
    },

    /**
     * @private
     * @param {number}x0 - x position in view co-ordinates
     * @param {number}y0 - y position in view co-ordinates
     * @param {number}x1 - x position in view co-ordinates
     * @param {number}y1  - y position in view co-ordinates
     * @param {Node}child
     * @param {Object}map
     */
    draw: function( x0, y0, x1, y1, child, map ) {
      var dx = Math.abs( x1 - x0 );
      var dy = Math.abs( y1 - y0 );
      var sx = x0 < x1 ? 1 : -1;
      var sy = y0 < y1 ? 1 : -1;
      var err = dx - dy;
      while ( true ) {
        this.setPixel( x0, y0, child, map );
        if ( x0 === x1 && y0 === y1 ) {
          break;
        }
        if ( this.isOutOfBounds( x0, y0 ) ) {
          break;
        }
        var e2 = 2 * err;
        if ( e2 > -dy ) {
          err = err - dy;
          x0 = x0 + sx;
        }
        if ( e2 < dx ) {
          err = err + dx;
          y0 = y0 + sy;
        }
      }
    }
  } );
} );
