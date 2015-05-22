// Copyright 2002 - 2015, University of Colorado Boulder

/**
 * Models the intersection between a light ray and an interface, needed so we can optionally depict normals at each
 * intersection.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @param {Vector2} unitNormal
   * @param {Vector2} point
   * @constructor
   */
  function Intersection( unitNormal, point ) {

    // Unit normal at the meeting between two interfaces where the light ray has struck
    this.unitNormal = unitNormal;

    // The point where the light ray struck
    this.point = point;
  }

  return inherit( Object, Intersection, {

    /**
     * @public
     * @returns {Pointer.point|*}
     */
    getPoint: function() {
      return this.point;
    },

    /**
     * @public
     * @returns {*}
     */
    getUnitNormal: function() {
      return this.unitNormal;
    }
  } );
} );
