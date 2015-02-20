// Copyright 2002-2012, University of Colorado
/**
 * Models the intersection between a light ray and an interface, needed so we can optionally depict normals at each intersection.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  //var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param unitNormal
   * @param point
   * @constructor
   */
  function Intersection( unitNormal, point ) {

    //Unit normal at the meeting between two interfaces where the light ray has struck
    this.unitNormal = unitNormal;

    //The point where the light ray struck
    this.point = point;
  }

  return inherit( Object, Intersection, {
    getPoint: function() {
      return this.point;
    },
    getUnitNormal: function() {
      return this.unitNormal;
    }/*,
     addCleanupListener: function( voidFunction0 ) {
     cleanupListeners.add( voidFunction0 );
     },
     remove: function() {
     for ( var cleanupListener in cleanupListeners ) {
     cleanupListener.apply();
     }
     }*/
  } );
} );

