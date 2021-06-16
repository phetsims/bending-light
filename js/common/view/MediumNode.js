[object Promise]
/**
 * Graphic that draws a medium such as air, water, glass, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import bendingLight from '../../bendingLight.js';

class MediumNode extends Node {

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {Property.<Medium>} mediumProperty - specifies medium
   */
  constructor( modelViewTransform, mediumProperty ) {
    super( { pickable: false } ); // user can't interact with the medium except through control panels.

    // add the shape that paints the medium
    const mediumRectangleNode = new Path( modelViewTransform.modelToViewShape( mediumProperty.value.shape ), {
      stroke: 'gray',
      fill: mediumProperty.value.color
    } );
    this.addChild( mediumRectangleNode );

    // Update whenever the medium changes
    mediumProperty.link( medium => {
      mediumRectangleNode.fill = medium.color;
    } );
  }
}

bendingLight.register( 'MediumNode', MediumNode );

export default MediumNode;