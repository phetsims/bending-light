// Copyright 2015-2022, University of Colorado Boulder

/**
 * Models the intersection between a light ray and an interface, needed so we can optionally depict normals at each
 * intersection.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import bendingLight from '../../bendingLight.js';

class Intersection {
  public readonly unitNormal: Vector2;
  public readonly point: Vector2;

  /**
   * @param unitNormal - unit normal at the intersection of light ray
   * @param point - point where the light ray intersects
   */
  public constructor( unitNormal: Vector2, point: Vector2 ) {

    // Unit normal at the meeting between two interfaces where the light ray has struck
    this.unitNormal = unitNormal; // (read-only)

    // The point where the light ray struck
    this.point = point; // (read-only)
  }
}

bendingLight.register( 'Intersection', Intersection );

export default Intersection;