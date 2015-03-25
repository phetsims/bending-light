// Copyright (c) 2002 - 2015. University of Colorado Boulder

/**
 * @author Chandrashekar Bemagoni  (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @param position
   * @param width
   * @param color
   * @param angle
   * @param waveHeight
   * @constructor
   */
  function WaveParticle( position, width, color, angle, waveHeight ) {
    this.position = position;
    this.width = width;
    this.color = color;
    this.angle = angle;
    this.height = waveHeight;
  }

  return inherit( Object, WaveParticle, {

    // get particle x position
    getX: function() {
      return this.position.x;
    },

    // get particle Y position
    getY: function() {
      return this.position.y;
    },

    /**
     * Set the particle x position
     * @param {Number} x position in meters
     */
    setX: function( x ) {
      this.position.x = x;
    },
    setY: function( y ) {
      this.position.y = y;
    }
  } );
} );