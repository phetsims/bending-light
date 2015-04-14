// Copyright 2011-2015 University of Colorado Boulder
/**
 * @author Chandrashekar bemagoni(Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var Vector2 = require( 'DOT/Vector2' );
  return {

    /**
     * Constrains a location to some bounds.
     * It returns (1) the same location if the location is within the bounds
     * or (2) a location on the edge of the bounds if the location is outside the bounds
     * @param {Vector2} location
     * @param {Bounds2} bounds
     * @returns {Vector2}
     */
    constrainLocation: function( location, bounds ) {
      if ( bounds.containsCoordinates( location.x, location.y ) ) {
        return location;
      }
      else {
        var xConstrained = Math.max( Math.min( location.x, bounds.maxX ), bounds.x );
        var yConstrained = Math.max( Math.min( location.y, bounds.maxY ), bounds.y );
        return new Vector2( xConstrained, yConstrained );
      }
    }
  };
} );