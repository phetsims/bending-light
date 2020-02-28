// Copyright 2015-2020, University of Colorado Boulder

/**
 * Shape that comprises a prism.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Arc from '../../../../kite/js/segments/Arc.js';
import Line from '../../../../kite/js/segments/Line.js';
import Shape from '../../../../kite/js/Shape.js';
import inherit from '../../../../phet-core/js/inherit.js';
import bendingLight from '../../bendingLight.js';
import PrismIntersection from './PrismIntersection.js';

/**
 * @param {number} referencePointIndex - is used as the drag handle corner for rotation
 * @param {array.<Vector2>} points - corner points
 * @param {number} radius - radius of semicircle
 * @constructor
 */
function SemiCircle( referencePointIndex, points, radius ) {

  this.points = points; // @private

  // Index for the point used as the "reference" point, which is used as the drag handle corner for rotation
  this.referencePointIndex = referencePointIndex; // @private
  this.radius = radius; // @private
  this.center = this.points[ 0 ].plus( this.points[ 1 ] ).multiplyScalar( 0.5 ); // @public (read-only)
  this.centroid = this.center;

  // Creates a shape
  const startAngle = Math.atan2( this.center.y - this.points[ 1 ].y, this.center.x - this.points[ 1 ].x );

  // @public (read-only) - the shape of the semi-circle
  this.shape = new Shape()
    .ellipticalArcPoint( this.center, this.radius, this.radius, 0, startAngle, startAngle + Math.PI, false )
    .close();
}

bendingLight.register( 'SemiCircle', SemiCircle );

export default inherit( Object, SemiCircle, {

  /**
   * Get the specified corner point
   * @public
   * @param {number} i - index of point
   * @returns {Vector2}
   */
  getPoint: function( i ) {
    return this.points[ i ];
  },

  /**
   * Create a new SemiCircle translated by the specified amount
   * @public
   * @param {number} deltaX - distance in x direction to be translated
   * @param {number} deltaY - distance in y direction to be translated
   * @returns {SemiCircle}
   */
  getTranslatedInstance: function( deltaX, deltaY ) {

    const newPoints = [];
    for ( let j = 0; j < this.points.length; j++ ) {

      // get new points after rotating
      newPoints.push( this.points[ j ].plusXY( deltaX, deltaY ) );
    }

    // create a new SemiCircle with rotated points
    return new SemiCircle( this.referencePointIndex, newPoints, this.radius );
  },

  /**
   * Gets a rotated copy of this SemiCircle
   * @public
   * @param {number} angle - angle to be rotated
   * @param {Vector2} rotationPoint - point around which semicircle to be rotated
   * @returns {SemiCircle}
   */
  getRotatedInstance: function( angle, rotationPoint ) {
    const newPoints = [];
    for ( let k = 0; k < this.points.length; k++ ) {
      const vectorAboutCentroid = this.points[ k ].subtract( rotationPoint );
      const rotated = vectorAboutCentroid.rotate( angle );

      // get new points after rotating
      newPoints.push( rotated.add( rotationPoint ) );
    }

    // create a new SemiCircle with rotated points
    return new SemiCircle( this.referencePointIndex, newPoints, this.radius );
  },

  /**
   * Determines whether shape contains given point or not
   * @public
   * @param {Vector2} point
   * @returns {boolean}
   */
  containsPoint: function( point ) {
    return this.shape.containsPoint( point );
  },

  /**
   * Just use the 0th point for the reference point for rotation drag handles
   * @public
   * @returns {Vector2}
   */
  getReferencePoint: function() {
    return this.getPoint( this.referencePointIndex );
  },

  /**
   * Computes the centroid of the corner points (e.g. the center of "mass" assuming the corner points have equal
   * "mass")
   * @public
   * @returns {Vector2}
   */
  getRotationCenter: function() {
    return this.center;
  },

  /**
   * Compute the intersections of the specified ray with this polygon's edges
   * @public
   * @param {ColoredRay} ray - model of the ray
   * @returns {array.<Intersection>}
   */
  getIntersections: function( ray ) {
    const segment = new Line( this.points[ 0 ], this.points[ 1 ] );
    const startAngle = Math.atan2( this.points[ 1 ].y - this.center.y, this.points[ 1 ].x - this.center.x );
    const arc = new Arc( this.center, this.radius, startAngle, startAngle + Math.PI, true );
    return PrismIntersection.getIntersections( [ segment ], arc, this.center, ray );
  }
} );