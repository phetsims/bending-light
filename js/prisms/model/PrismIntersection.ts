// Copyright 2015-2025, University of Colorado Boulder

/**
 * Finds the intersection between a light ray and prism.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Arc, Line } from '../../../../kite/js/segments/Segment.js';
import Shape from '../../../../kite/js/Shape.js';
import bendingLight from '../../bendingLight.js';
import ColoredRay from './ColoredRay.js';
import Intersection from './Intersection.js';

export default class PrismIntersection {
  private constructor() {
    // Note: private and not instantiated
  }

  /**
   * @param edges - edges of the prism, or an empty array for a circle
   * @param arc - arc of the prism
   * @param center - center of the arc if prism contains arc otherwise null
   * @param coloredRay - light ray intersecting the prism
   */
  public static getIntersections( edges: Line[], arc: Arc | Shape | null, center: Vector2, coloredRay: ColoredRay ): Intersection[] {
    const intersections = [];
    let intersection;
    let unitNormal;
    if ( edges.length !== 0 ) {
      edges.forEach( lineSegment => {

        // Get the intersection if there is one
        intersection = lineSegment.intersection( coloredRay.ray );
        if ( intersection.length !== 0 ) {

          // Choose the normal vector that points the opposite direction of the incoming ray
          unitNormal = lineSegment.getEnd().minus( lineSegment.getStart() ).rotate( +Math.PI / 2 ).normalize();

          // Angle between the normal and ray should not be greater than 90 degrees.
          // If angle is greater than 90 then reverse the direction of the normal.
          if ( unitNormal.dot( coloredRay.directionUnitVector ) > 0 ) {
            unitNormal.negate();
          }
          // Add to the array of intersections
          intersections.push( new Intersection( unitNormal, intersection[ 0 ].point ) );
        }
      } );
    }
    if ( arc !== null ) {
      intersection = arc.intersection( coloredRay.ray );
      if ( intersection.length !== 0 ) {

        unitNormal = intersection[ 0 ].point.minus( center ).normalize();

        // Angle between the normal and ray should not be greater than 90 degrees.
        // If angle is greater than 90 then reverse the direction of the normal.
        if ( unitNormal.dot( coloredRay.directionUnitVector ) > 0 ) {
          unitNormal.negate();
        }
        // Add to the array of intersections
        intersections.push( new Intersection( unitNormal, intersection[ 0 ].point ) );
      }
    }

    return intersections;
  }
}

bendingLight.register( 'PrismIntersection', PrismIntersection );