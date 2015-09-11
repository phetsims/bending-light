// Copyright 2002-2015, University of Colorado Boulder

/**
 * Finds the intersection between a light ray and prism.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Intersection = require( 'BENDING_LIGHT/prisms/model/Intersection' );
  var Ray2 = require( 'DOT/Ray2' );

  function PrismIntersection() {
    assert && assert( false, 'should not be instantiated' );
  }

  return inherit( Object, PrismIntersection, {},
    // static
    {

      /**
       * @param {array.<Line>} edges - edges of the prism, or an empty array for a circle
       * @param {Shape} arc - arc of the prism
       * @param {Vector2} center - center of the arc if prism contains arc otherwise null
       * @param {ColoredRay} ray - light ray intersecting the prism
       * @constructor
       */
      getIntersections: function( edges, arc, center, ray ) {
        var intersections = [];
        var intersection;
        var unitNormal;
        if ( edges.length !== 0 ) {
          edges.forEach( function( lineSegment ) {

            // Get the intersection if there is one
            intersection = lineSegment.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
            if ( intersection.length !== 0 ) {

              // Choose the normal vector that points the opposite direction of the incoming ray
              unitNormal = lineSegment.getEnd().minus( lineSegment.getStart() ).rotate( +Math.PI / 2 ).normalize();

              // Angle between the normal and ray should not be greater than 90 degrees.
              // If angle is greater than 90 then reverse the direction of the normal.
              if ( unitNormal.dot( ray.directionUnitVector ) > 0 ) {
                unitNormal.negate();
              }
              // Add to the array of intersections
              intersections.push( new Intersection( unitNormal, intersection[ 0 ].point ) );
            }
          } );
        }
        if ( arc !== null ) {
          intersection = arc.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
          if ( intersection.length !== 0 ) {

            unitNormal = intersection[ 0 ].point.minus( center ).normalize();

            // Angle between the normal and ray should not be greater than 90 degrees.
            // If angle is greater than 90 then reverse the direction of the normal.
            if ( unitNormal.dot( ray.directionUnitVector ) > 0 ) {
              unitNormal.negate();
            }
            // Add to the array of intersections
            intersections.push( new Intersection( unitNormal, intersection[ 0 ].point ) );
          }
        }

        return intersections;
      }
    } );
} );