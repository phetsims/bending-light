//  Copyright 2002-2015, University of Colorado Boulder

/**
 * A handler designed to be used with ChainInputListener that moves a node to the front.
 *
 * TODO: How are developers going to know which files in this directory are handers compatible with chain?
 * TODO: Should we create a separate directory, use a naming convention or make them instances on ChainInputListener?
 *
 * TODO: This file is highly volatile and not ready for public consumption.  The API and implementation are subject to
 * change, and this disclaimer will be removed when the code is ready for review or usage.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var scenery = require( 'SCENERY/scenery' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @constructor
   */
  function ToolboxDragHandler( node, scale, newParent ) {
    this.node = node;
    this.scale = scale;
    this.newParent = newParent;
  }

  /**
   * Move a node from one parent to another but keeping it in exactly the same position/scale/orientation on the screen.
   * Require the oldParent explicitly rather than inferring it from the node to support multiparent nodes.
   * @param node
   * @param oldParent
   * @param newParent
   */
  var reparent = function( node, oldParent, newParent ) {
    var g1 = node.getLocalToGlobalMatrix();

    oldParent.removeChild( node );
    newParent.addChild( node );

    var p2 = newParent.getGlobalToLocalMatrix();

    var m2 = p2.timesMatrix( g1 );
    node.setMatrix( m2 );
  };

  /**
   * When the tool is dragged to/from the toolbox it shrinks/grows with animation.
   * @param node
   * @param scale
   * @param centerX
   * @param centerY
   * @returns {*}
   */
  var animateScale = function( node, scale, centerX, centerY ) {
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
  };

  scenery.ToolboxDragHandler = ToolboxDragHandler;

  return inherit( Object, ToolboxDragHandler, {
    start: function( event, trail, chainInputListener, point ) {
      var v = event.currentTarget.globalToParentPoint( point );
      reparent( this.node, this.node.parent, this.newParent );
      animateScale( this.node, this.scale, v.x, v.y );
      chainInputListener.nextStart( event, trail, point );
    }
  } );
} );