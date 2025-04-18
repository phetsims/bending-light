// Copyright 2015-2024, University of Colorado Boulder

/**
 * Models the intersection between a light ray and an interface, needed so we can optionally depict normals at each
 * intersection.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import bendingLight from '../../bendingLight.js';

export default class Intersection {

  /**
   * @param unitNormal - unit normal at the intersection of light ray
   * @param point - point where the light ray intersects
   */
  public constructor(
    public readonly unitNormal: Vector2, // Unit normal at the meeting between two interfaces where the light ray has struck
    public readonly point: Vector2 // The point where the light ray struck
  ) {
  }
}

bendingLight.register( 'Intersection', Intersection );