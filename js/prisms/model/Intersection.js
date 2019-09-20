// Copyright 2015-2019, University of Colorado Boulder

/**
 * Models the intersection between a light ray and an interface, needed so we can optionally depict normals at each
 * intersection.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Vector2} unitNormal - unit normal at the intersection of light ray
   * @param {Vector2} point - point where the light ray intersects
   * @constructor
   */
  function Intersection( unitNormal, point ) {

    // Unit normal at the meeting between two interfaces where the light ray has struck
    this.unitNormal = unitNormal; // @public (read-only)

    // The point where the light ray struck
    this.point = point; // @public (read-only)
  }

  bendingLight.register( 'Intersection', Intersection );
  
  return inherit( Object, Intersection );
} );