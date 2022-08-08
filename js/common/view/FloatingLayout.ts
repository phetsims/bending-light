// Copyright 2015-2022, University of Colorado Boulder

/**
 * Floats the control panels and reset all buttons to the right to give a bit more room in the play area for
 * wide screens.  See https://github.com/phetsims/bending-light/issues/171
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import bendingLight from '../../bendingLight.js';
import { Node } from '../../../../scenery/js/imports.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';

// The fraction the objects can float out of the layout bounds
const floatFraction = 0.3;

// Distance of each object from the edge of the screen
const topBottomPadding = 15;
const leftRightPadding = 10;

const FloatingLayout = {

  /**
   * Move the nodes to the edge when the screen resizes, but not too far
   */
  floatRight: ( screenView: ScreenView, nodes: Node[] ): void => {
    screenView.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {

      // Let the panels move to the right, but not too far
      const right = Math.min( visibleBounds.right - leftRightPadding, screenView.layoutBounds.width * ( 1 + floatFraction ) );
      nodes.forEach( node => {
        node.right = right;
      } );
    } );
  },

  /**
   * Move the nodes to the edge when the screen resizes, but not too far
   */
  floatLeft: ( screenView: ScreenView, nodes: Node[], delta = 0 ): void => {
    screenView.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {

      // Let the panels move to the left, but not too far
      const left = Math.max( visibleBounds.left + leftRightPadding, -screenView.layoutBounds.width * floatFraction );
      nodes.forEach( node => {
        node.left = left + delta;
      } );
    } );
  },

  /**
   * Move the nodes to the edge when the screen resizes, but not too far
   */
  floatTop: ( screenView: ScreenView, nodes: Node[] ): void => {
    screenView.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {

      // Let the panels move to the top, but not too far
      const top = Math.max( visibleBounds.top + topBottomPadding, -screenView.layoutBounds.width * floatFraction );
      nodes.forEach( node => {
        node.top = top;
      } );
    } );
  },

  /**
   * Move the nodes to the edge when the screen resizes, but not too far
   */
  floatBottom: ( screenView: ScreenView, nodes: Node[] ): void => {
    screenView.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {

      // Let the panels move to the bottom, but not too far
      const bottom = Math.min( visibleBounds.bottom - topBottomPadding, screenView.layoutBounds.width * ( 1 + floatFraction ) );
      nodes.forEach( node => {
        node.bottom = bottom;
      } );
    } );
  }
};

bendingLight.register( 'FloatingLayout', FloatingLayout );

export default FloatingLayout;