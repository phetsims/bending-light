// Copyright 2015-2021, University of Colorado Boulder

/**
 * Listener for tool icons (in the toolbox) used for creating a node and forwarding events to its listener.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import MovableDragHandler from '../../../../scenery-phet/js/input/MovableDragHandler.js';
import { SceneryEvent } from '../../../../scenery/js/imports.js';
import { SimpleDragHandler } from '../../../../scenery/js/imports.js';
import { Trail } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';

class ToolIconListener extends SimpleDragHandler {

  /**
   * @param components - the individual listeners that events should be forwarded to.
   * @param init - called with (event) when the start drag occurs
   */
  constructor( components: MovableDragHandler[], init: ( event: SceneryEvent ) => void ) {
    super( {
      start: ( event: SceneryEvent, trail: Trail ) => {
        init( event );

        // Forward the event to the components
        for ( let i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedStartEvent( event, trail );
        }
      },
      drag: ( event: SceneryEvent, trail: Trail ) => {

        // Forward the event to the components
        for ( let i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedDragEvent( event, trail );
        }
      },
      end: ( event: SceneryEvent, trail: Trail ) => {

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