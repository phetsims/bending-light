// Copyright 2015, University of Colorado Boulder

/**
 * Listener for tool icons (in the toolbox) used for creating a node and forwarding events to its listener.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
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
          components[ i ].handleForwardedStartEvent( event );
        }
      },
      drag: function( event ) {

        // Forward the event to the components
        for ( var i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedDragEvent( event );
        }
      },
      end: function( event ) {

        // Forward the event to the components
        for ( var i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedEndEvent( event );
        }
      }
    } );
  }

  bendingLight.register( 'ToolIconListener', ToolIconListener );
  
  return inherit( SimpleDragHandler, ToolIconListener );
} );