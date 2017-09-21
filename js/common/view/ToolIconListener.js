// Copyright 2015-2016, University of Colorado Boulder

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
      start: function( event, trail ) {
        init( event );

        // Forward the event to the components
        for ( var i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedStartEvent( event, trail );
        }
      },
      drag: function( event, trail ) {

        // Forward the event to the components
        for ( var i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedDragEvent( event, trail );
        }
      },
      end: function( event, trail ) {

        // Forward the event to the components
        for ( var i = 0; i < components.length; i++ ) {
          components[ i ].handleForwardedEndEvent( event, trail );
        }
      }
    } );
  }

  bendingLight.register( 'ToolIconListener', ToolIconListener );

  return inherit( SimpleDragHandler, ToolIconListener );
} );