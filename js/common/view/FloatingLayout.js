//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Floats the control panels and reset all buttons to the right to give a bit more room in the play area for
 * wide screens.  See https://github.com/phetsims/bending-light/issues/171
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function() {
  'use strict';

  var floatFraction = 0.3;
  var padding = 10;

  return {
    floatRight: function( screenView, nodes ) {
      screenView.events.on( 'layoutFinished', function( dx, dy, width ) {

        // Let the panels move to the right, but not too far
        var right = Math.min( width - dx - padding, screenView.layoutBounds.width * (1 + floatFraction) );
        nodes.forEach( function( node ) {
          node.right = right;
        } );
      } );
    },

    floatLeft: function( screenView, nodes ) {
      screenView.events.on( 'layoutFinished', function( dx ) {

        // Let the panels move to the left, but not too far
        var left = Math.max( -dx + padding, -screenView.layoutBounds.width * floatFraction );
        nodes.forEach( function( node ) {
          node.left = left;
        } );
      } );
    }
  };
} );