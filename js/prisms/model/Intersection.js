[object Promise]

/**
 * Models the intersection between a light ray and an interface, needed so we can optionally depict normals at each
 * intersection.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import bendingLight from '../../bendingLight.js';

class Intersection {

  /**
   * @param {Vector2} unitNormal - unit normal at the intersection of light ray
   * @param {Vector2} point - point where the light ray intersects
   */
  constructor( unitNormal, point ) {

    // Unit normal at the meeting between two interfaces where the light ray has struck
    this.unitNormal = unitNormal; // @public (read-only)

    // The point where the light ray struck
    this.point = point; // @public (read-only)
  }
}

bendingLight.register( 'Intersection', Intersection );

export default Intersection;