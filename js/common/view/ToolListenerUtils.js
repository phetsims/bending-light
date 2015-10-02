// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @constructor
   */
  function ToolListenerUtils() {
  }

  return inherit( Object, ToolListenerUtils, {}, {
    /**
     * Move a node from one parent to another but keeping it in exactly the same position/scale/orientation on the screen.
     * Require the oldParent explicitly rather than inferring it from the node to support multiparent nodes.
     * @param node
     * @param oldParent
     * @param newParent
     */
    reparent: function( node, oldParent, newParent ) {
      var g1 = node.getLocalToGlobalMatrix();

      oldParent.removeChild( node );
      newParent.addChild( node );

      var p2 = newParent.getGlobalToLocalMatrix();

      var m2 = p2.timesMatrix( g1 );
      node.setMatrix( m2 );
    },

    /**
     * When the tool is dragged to/from the toolbox it shrinks/grows with animation.
     * @param node
     * @param scale
     * @param centerX
     * @param centerY
     * @returns {*}
     */
    animateScale: function( node, scale, centerX, centerY ) {
      var parameters = {
        scale: node.getScaleVector().x,
        centerX: node.centerX,
        centerY: node.centerY
      }; // initial state, modified as the animation proceeds
      return new TWEEN.Tween( parameters )
        .easing( TWEEN.Easing.Cubic.InOut )
        .to( {
          scale: scale,
          centerX: centerX,
          centerY: centerY
        }, 200 )
        .onUpdate( function() {
          node.setScaleMagnitude( parameters.scale );
          node.center = new Vector2( parameters.centerX, parameters.centerY );
        } )
        .onComplete( function() {
        } )
        .start();
    }
  } );
} );