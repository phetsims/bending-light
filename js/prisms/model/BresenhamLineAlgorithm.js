// Copyright 2002-2015, University of Colorado
/**
 * Algorithm that is used to compute pixels hit in the white light algorithm, necessary since we have to
 * implement additive color mixing ourselves (because java only supports subtractive mixing internally).
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  function BresenhamLineAlgorithm() {

  }

  return inherit( Object, BresenhamLineAlgorithm, {
    //See http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
    draw: function( x0, y0, x1, y1 ) {
      var dx = Math.abs( x1 - x0 );
      var dy = Math.abs( y1 - y0 );
      var sx = x0 < x1 ? 1 : -1;
      var sy = y0 < y1 ? 1 : -1;
      var err = dx - dy;
      while ( true ) {
        this.setPixel( x0, y0 );
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
    },
    //Shortcut method to avoid computing points outside of the relevant bounds
    isOutOfBounds: function( x0, y0 ) {
      return false;
    },
    //Sets the specified pixel to be hit (this implementation just prints debug info, but should be overriden to do something useful)
    setPixel: function( x0, y0 ) {
      console.log( x0 + ", " + y0 );
    }
  } );
} );

