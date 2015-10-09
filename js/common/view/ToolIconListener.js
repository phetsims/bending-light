// Copyright 2002-2015, University of Colorado Boulder

/**
 * Listener for tool icons (in the toolbox) used for creating a node and forwarding events to its listener.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {MovableDragHandler[]} components - the individual listeners that events should be forwarded to.
   * @param {function} init - called with (event) when the start drag occurs
   * @constructor
   */
  function ToolIconListener( components, init ) {
    SimpleDragHandler.call( this, {
      start: function( event ) {
        init( event );

        // Forward the event to the components
        for ( var i = 0; i < components.length; i++ ) {
          components[ i ].forwardStartEvent( event );
        }
      },
      drag: function( event ) {

        // Forward the event to the components
        for ( var i = 0; i < components.length; i++ ) {
          components[ i ].forwardDragEvent( event );
        }
      },
      end: function( event ) {

        // Forward the event to the components
        for ( var i = 0; i < components.length; i++ ) {
          components[ i ].forwardEndEvent( event );
        }
      }
    } );
  }

  return inherit( SimpleDragHandler, ToolIconListener );
} );