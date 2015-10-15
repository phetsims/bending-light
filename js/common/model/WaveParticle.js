// Copyright 2002-2015, University of Colorado Boulder

/**
 * WaveParticle is to simulate the wave transformation in Canvas mode.
 * WaveParticle has position, width, angle and etc..
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Vector2} position - position of wave particle
   * @param {number} width - width of wave particle
   * @param {Color} color - color of wave particle
   * @param {Color} particleGradientColor
   * @param {number} angle - angle of wave particle
   * @param {number} waveHeight - height of wave particle
   * @constructor
   */
  function WaveParticle( position, width, color, particleGradientColor, angle, waveHeight ) {
    this.position = position; // @public
    this.width = width; // @public
    this.color = color; // @public
    this.angle = angle; // @public
    this.height = waveHeight; // @public
    this.particleGradientColor = particleGradientColor; // @public
  }

  return inherit( Object, WaveParticle, {

    /**
     * get particle x position
     * @public
     * @returns {number}
     */
    getX: function() {
      return this.position.x;
    },

    /**
     * get particle Y position
     * @public
     * @returns {number}
     */
    getY: function() {
      return this.position.y;
    },

    /**
     * Set the particle x position
     * @public
     * @param {number} x - x position in model values
     */
    setX: function( x ) {
      this.position.x = x;
    },

    /**
     * @public
     * @param {number} y - y position in model values
     */
    setY: function( y ) {
      this.position.y = y;
    }
  } );
} );