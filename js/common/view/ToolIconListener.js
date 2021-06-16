// Copyright 2015-2021, University of Colorado Boulder

/**
 * Listener for tool icons (in the toolbox) used for creating a node and forwarding events to its listener.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import bendingLight from '../../bendingLight.js';

class ToolIconListener extends SimpleDragHandler {

  /**
   * @param {MovableDragHandler[]} components - the individual listeners that events should be forwarded to.
   * @param {function} init - called with (event) when the start drag occurs
   */
  constructor( components, init ) {
    super( {
      start: ( event, trail ) => {
        init( event );

        // Forward the event to the components
        for ( let i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedStartEvent( event, trail );
        }
      },
      drag: ( event, trail ) => {

        // Forward the event to the components
        for ( let i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedDragEvent( event, trail );
        }
      },
      end: ( event, trail ) => {

        // Forward the event to the components
        for ( let i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedEndEvent( event, trail );
        }
      }
    } );
  }
}

bendingLight.register( 'ToolIconListener', ToolIconListener );

export default ToolIconListener;