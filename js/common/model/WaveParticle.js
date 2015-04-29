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
   * @param {Vector2} position - position of wave particle
   * @param {number}width -width of  wave particle
   * @param {Color}color
   * @param {Color}particleGradientColor
   * @param {number}angle
   * @param {number}waveHeight
   * @constructor
   */
  function WaveParticle( position, width, color, particleGradientColor, angle, waveHeight ) {
    this.position = position;
    this.width = width;
    this.color = color;
    this.angle = angle;
    this.height = waveHeight;
    this.particleGradientColor = particleGradientColor;
  }

  return inherit( Object, WaveParticle, {

    /**
     * get particle x position
     * @public
     * @returns {*}
     */
    getX: function() {
      return this.position.x;
    },

    /**
     *  get particle Y position
     *  @public
     * @returns {*}
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
     * @param{number} y  - y position in model values
     */
    setY: function( y ) {
      this.position.y = y;
    }
  } );
} );