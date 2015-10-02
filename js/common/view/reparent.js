// Copyright 2002-2015, University of Colorado Boulder

/**
 * Utility for dealing with toolbox nodes.  Moves a node from one parent to another while keeping it in the same
 * place on the screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function() {
  'use strict';

  /**
   * Move a node from one parent to another but keeping it in exactly the same position/scale/orientation on the screen.
   * Require the oldParent explicitly rather than inferring it from the node to support multiparent nodes.
   * @param {Node} node
   * @param {Node} newParent
   */
  return function( node, newParent ) {
    var oldParent = node.getParent();
    var g1 = node.getLocalToGlobalMatrix();

    oldParent.removeChild( node );
    newParent.addChild( node );

    var p2 = newParent.getGlobalToLocalMatrix();

    var m2 = p2.timesMatrix( g1 );
    node.setMatrix( m2 );
  };
} );