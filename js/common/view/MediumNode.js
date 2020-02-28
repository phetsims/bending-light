// Copyright 2015-2020, University of Colorado Boulder
/**
 * Graphic that draws a medium such as air, water, glass, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import bendingLight from '../../bendingLight.js';

/**
 * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
 * @param {Property.<Medium>} mediumProperty - specifies medium
 * @constructor
 */
function MediumNode( modelViewTransform, mediumProperty ) {
  Node.call( this, { pickable: false } ); // user can't interact with the medium except through control panels.

  // add the shape that paints the medium
  const mediumRectangleNode = new Path( modelViewTransform.modelToViewShape( mediumProperty.value.shape ), {
    stroke: 'gray',
    fill: mediumProperty.value.color
  } );
  this.addChild( mediumRectangleNode );

  // Update whenever the medium changes
  mediumProperty.link( function( medium ) {
    mediumRectangleNode.fill = medium.color;
  } );
}

bendingLight.register( 'MediumNode', MediumNode );

inherit( Node, MediumNode );
export default MediumNode;