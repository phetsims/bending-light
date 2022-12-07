// Copyright 2015-2022, University of Colorado Boulder
/**
 * Graphic that draws a medium such as air, water, glass, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import Medium from '../model/Medium.js';

class MediumNode extends Node {

  /**
   * @param modelViewTransform - converts between model and view co-ordinates
   * @param mediumProperty - specifies medium
   */
  public constructor( modelViewTransform: ModelViewTransform2, mediumProperty: Property<Medium> ) {
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