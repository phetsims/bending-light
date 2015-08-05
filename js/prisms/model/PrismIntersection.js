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

  /**
   * @param {array.<Line>} edges - edges of the prism
   * @param {Shape} arc - arc of the prism
   * @param {Vector2} center - center of the arc if prism contains arc otherwise null
   * @param {Ray} ray - light ray intersecting the prism
   * @constructor
   */
  function PrismIntersection( edges, arc, center, ray ) {

    var prismIntersection = this;
    this.intersections = [];
    if ( edges.length !== 0 ) {
      edges.forEach( function( lineSegment ) {

        // Get the intersection if there is one
        var intersection = lineSegment.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
        if ( intersection.length !== 0 ) {

          // Choose the normal vector that points the opposite direction of the incoming ray
          var normal = lineSegment.getEnd().minus( lineSegment.getStart() ).rotate( +Math.PI / 2 ).normalize();
          var unitNormal = ray.directionUnitVector.dot( normal ) < 0 ? normal : normal.rotate( Math.PI );

          // Add to the list of intersections
          prismIntersection.intersections.push( new Intersection( unitNormal, intersection[ 0 ].point ) );
        }
      } );
    }
    if ( arc !== null ) {
      var intersection = arc.intersection( new Ray2( ray.tail, ray.directionUnitVector ) );
      if ( intersection.length !== 0 ) {

        // Only consider intersections that are in front of the ray
        var dx = (intersection[ 0 ].point.x - ray.tail.x) * ray.directionUnitVector.x;
        var dy = (intersection[ 0 ].point.y - ray.tail.y) * ray.directionUnitVector.y;
        if ( dx + dy > 0 ) {
          var normalVector = intersection[ 0 ].point.minus( center ).normalize();

          // Angle between the normal and ray should not be greater than 90 degrees.
          // If angle is greater than 90 then reverse the direction of the normal.
          if ( normalVector.dot( ray.directionUnitVector ) > 0 ) {
            normalVector.negate();
          }
          prismIntersection.intersections.push( new Intersection( normalVector, intersection[ 0 ].point ) );
        }
      }
    }
  }

  return inherit( Object, PrismIntersection );
} );
