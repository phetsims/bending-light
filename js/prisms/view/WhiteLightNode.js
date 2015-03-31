// Copyright 2002-2011, University of Colorado
/**
 * In order to support white light, we need to perform additive color mixing (not subtractive,
 * as is the default when drawing transparent colors on top of each other in Java).
 * <p/>
 * This class uses the Bresenham line drawing algorithm (with a stroke thickness of 2) to determine which pixels each ray inhabits.
 * When multiple rays hit the same pixel, their RGB values are added.  If any of the RG or B values is greater than the maximum of 255,
 * then RGB values are scaled down and the leftover part is put into the "intensity" value (which is the sum of the ray intensities).
 * The intensity is converted to a transparency value according to alpha = sqrt(intensity/3), which is also clamped to be between 0 and 255.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Util = require( 'DOT/Util' );

  /**
   *
   * @param {Node} rayLayer
   * @param {Number} stageWidth
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
    this.pointArray = [];
  }

  return inherit( CanvasNode, WhiteLightNode, {

    /**
     * Paints the particles on the canvas node.
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var map = {};
      for ( var i = 0; i < this.rayLayer.getChildrenCount(); i++ ) {
        var child = this.rayLayer.getChildAt( i );
        //Get the line values to make the next part more readable
        var start = child.viewStart;
        var end = child.viewEnd;
        var x1 = start.x;
        var y1 = start.y;
        var x2 = end.x;
        var y2 = end.y;
        //Some lines don't start in the play area; have to check and swap to make sure the line isn't pruned
        if ( this.isOutOfBounds( x1, y1 ) ) {
          this.draw( x2, y2, x1, y1, child, map );
        }
        else {
          this.draw( x1, y1, x2, y2, child, map );
        }
      }
      //Don't let things become completely white, since the background is white
      var whiteLimit = 0.2;
      var maxChannel = 1 - whiteLimit;
      //extra factor to make it white instead of cream/orange
      var scale = 4;

      for ( i = 0; i < this.pointArray.length; i++ ) {
        var samples = map[ this.pointArray[ i ] ];
        var pointX = this.pointArray[ i ].x;
        var pointY = this.pointArray[ i ].y;
        var intensity = samples[ 3 ];
        //move excess samples value into the intensity column
        var max = samples[ 0 ];
        if ( samples[ 1 ] > max ) {
          max = samples[ 1 ];
        }
        if ( samples[ 2 ] > max ) {
          max = samples[ 2 ];
        }
        //Scale and clamp the samples
        samples[ 0 ] = Util.clamp( samples[ 0 ] / max * scale - whiteLimit, 0, maxChannel );
        samples[ 1 ] = Util.clamp( samples[ 1 ] / max * scale - whiteLimit, 0, maxChannel );
        samples[ 2 ] = Util.clamp( samples[ 2 ] / max * scale - whiteLimit, 0, maxChannel );
        intensity = intensity * max;
        //don't let it become fully opaque or it looks too dark against white background
        var alpha = Util.clamp( Math.sqrt( intensity ), 0, 1 );
        var pixelColor = samples[ 6 ];
        pixelColor.set( samples[ 0 ] * 255, samples[ 1 ] * 255, samples[ 2 ] * 255, alpha );
        //Set the color and fill in the pixel in the buffer
        context.fillRect( pointX, pointY, 1, 1 );
        context.fillStyle = pixelColor.toCSS();
        context.fill();

      }

      this.pointArray = [];

    },
    isOutOfBounds: function( x0, y0 ) {
      return x0 < 0 || y0 < 0 || x0 > this.stageWidth || y0 > this.stageHeight;
    },
    //Add the specified point to the HashMap, creating a new entry if necessary, otherwise adding it to existing values.
    //Take the intensity as the last component of the array

    addToMap: function( x0, y0, color, intensity, map ) {
      //so that rays don't start fully saturated: this makes it so that it is possible to see the decrease in intensity after a (nontotal) reflection
      var point = new Vector2( x0, y0 );
      this.pointArray.push( new Vector2( x0, y0 ) );
      var brightnessFactor = 0.017;
      if ( !map[ point ] ) {
        //seed with zeros so it can be summed
        map[ point ] = [ 0, 0, 0, 0, x0, y0, color ];
      }
      var current = map[ point ];
      var term = [ color.getRed(), color.getGreen(), color.getBlue() ];
      //don't apply brightness factor to intensities
      for ( var a = 0; a < 3; a++ ) {
        current[ a ] = current[ a ] + term[ a ] * brightnessFactor;
      }
      //add intensities, then convert to alpha later;
      current[ 3 ] = current[ 3 ] + intensity;
    },

    step: function() {
      this.invalidatePaint();
    },
    setPixel: function( x0, y0, child, map ) {
      var color = child.getColor();
      var intensity = child.getLightRay().getPowerFraction();
      this.addToMap( x0, y0, color, intensity, map );
      //Some additional points makes it look a lot better (less sparse) without slowing it down too much
      this.addToMap( x0 + 1, y0, color, intensity, map );
      this.addToMap( x0, y0 + 1, color, intensity, map );
    },
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

