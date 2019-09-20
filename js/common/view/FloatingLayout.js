// Copyright 2015-2019, University of Colorado Boulder

/**
 * Floats the control panels and reset all buttons to the right to give a bit more room in the play area for
 * wide screens.  See https://github.com/phetsims/bending-light/issues/171
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );

  // The fraction the objects can float out of the layout bounds
  const floatFraction = 0.3;

  // Distance of each object from the edge of the screen
  const topBottomPadding = 15;
  const leftRightPadding = 10;

  const FloatingLayout = {

    /**
     * Move the nodes to the edge when the screen resizes, but not too far
     * @public
     * @param {ScreenView} screenView
     * @param {Node[]} nodes
     */
    floatRight: function( screenView, nodes ) {
      screenView.visibleBoundsProperty.link( function( visibleBounds ) {

        // Let the panels move to the right, but not too far
        const right = Math.min( visibleBounds.right - leftRightPadding, screenView.layoutBounds.width * (1 + floatFraction) );
        nodes.forEach( function( node ) {
          node.right = right;
        } );
      } );
    },

    /**
     * Move the nodes to the edge when the screen resizes, but not too far
     * @public
     * @param {ScreenView} screenView
     * @param {Node[]} nodes
     */
    floatLeft: function( screenView, nodes, delta ) {
      delta = delta || 0;
      screenView.visibleBoundsProperty.link( function( visibleBounds ) {

        // Let the panels move to the left, but not too far
        const left = Math.max( visibleBounds.left + leftRightPadding, -screenView.layoutBounds.width * floatFraction );
        nodes.forEach( function( node ) {
          node.left = left + delta;
        } );
      } );
    },

    /**
     * Move the nodes to the edge when the screen resizes, but not too far
     * @public
     * @param {ScreenView} screenView
     * @param {Node[]} nodes
     */
    floatTop: function( screenView, nodes ) {
      screenView.visibleBoundsProperty.link( function( visibleBounds ) {

        // Let the panels move to the top, but not too far
        const top = Math.max( visibleBounds.top + topBottomPadding, -screenView.layoutBounds.width * floatFraction );
        nodes.forEach( function( node ) {
          node.top = top;
        } );
      } );
    },

    /**
     * Move the nodes to the edge when the screen resizes, but not too far
     * @public
     * @param {ScreenView} screenView
     * @param {Node[]} nodes
     */
    floatBottom: function( screenView, nodes ) {
      screenView.visibleBoundsProperty.link( function( visibleBounds ) {

        // Let the panels move to the bottom, but not too far
        const bottom = Math.min( visibleBounds.bottom - topBottomPadding, screenView.layoutBounds.width * (1 + floatFraction) );
        nodes.forEach( function( node ) {
          node.bottom = bottom;
        } );
      } );
    }
  };

  bendingLight.register( 'FloatingLayout', FloatingLayout );

  return FloatingLayout;
} );