// Copyright 2015-2021, University of Colorado Boulder

/**
 * The normal line is a graphic that indicates the point of intersection of the light ray and the perpendicular angle at
 * the interface.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Shape from '../../../../kite/js/Shape.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import { Path } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';

class NormalLine extends Node {

  /**
   * @param {number} height - height of normal
   * @param {number[]} lineDash
   * @param {Object} [providedOptions] - options that can be passed on to the underlying node
   */
  constructor( height: number, lineDash: number[], providedOptions?: NodeOptions ) {
    super();

    this.addChild( new Path( Shape.lineSegment( 0, 0, 0, height ), {
      stroke: 'black',
      lineDash: lineDash
    } ) );
    this.mutate( providedOptions );
  }
}

bendingLight.register( 'NormalLine', NormalLine );

export default NormalLine;