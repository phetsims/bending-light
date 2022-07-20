// Copyright 2015-2022, University of Colorado Boulder

/**
 * The icon to be shown with the "Angles" checkbox.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';

class AngleIcon extends Node {

  public constructor() {
    super();

    const edgeLength = 15;

    // Same as the default laser angle
    const angle = Math.PI * 3 / 4 - Math.PI / 2;

    // a "V" shape with the right edge perfectly vertical and the left edge at an angle
    const shape = new Shape().moveTo( edgeLength, 0 )
      .lineTo( 0, 0 )
      .lineTo( edgeLength * Math.cos( angle ), -edgeLength * Math.sin( angle ) );
    this.addChild( new Path( shape, {
      stroke: 'black',
      lineWidth: 1
    } ) );

    const overlapAngle = Math.PI / 12;
    const arc = new Shape().arc( 0, 0, edgeLength * 0.55, overlapAngle, -angle - overlapAngle, true );
    this.addChild( new Path( arc, {
      stroke: 'black',
      lineWidth: 1
    } ) );
  }
}

bendingLight.register( 'AngleIcon', AngleIcon );

export default AngleIcon;