// Copyright 2002-2012, University of Colorado Boulder
/**
 * Models the intersection between a light ray and an interface, needed so we can optionally depict normals
 * at each intersection.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @param unitNormal
   * @param point
   * @constructor
   */
  function Intersection( unitNormal, point ) {

    // unit normal at the meeting between two interfaces where the light ray has struck
    this.unitNormal = unitNormal;

    // the point where the light ray struck
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

