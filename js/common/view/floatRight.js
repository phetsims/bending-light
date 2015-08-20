//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Floats the control panels and reset all buttons to the right to give a bit more room in the play area for
 * wide screens.  See https://github.com/phetsims/bending-light/issues/171
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function() {
  'use strict';

  return function( screenView, nodes ) {
    screenView.events.on( 'layoutFinished', function( dx, dy, width ) {

      // Let the panels move to the right, but not too far
      var right = Math.min( width - dx - 10, screenView.layoutBounds.maxX * 1.5 );
      nodes.forEach( function( node ) {
        node.right = right;
      } );
    } );
  };
} );