// Copyright 2015-2020, University of Colorado Boulder

/**
 * WaveParticle is to simulate the wave transformation in Canvas mode.
 * WaveParticle has position, width, angle and etc..
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import bendingLight from '../../bendingLight.js';

class WaveParticle {

  /**
   * @param {Vector2} position - position of wave particle
   * @param {number} width - width of wave particle
   * @param {Color} color - color of wave particle
   * @param {Color} particleGradientColor
   * @param {number} angle - angle of wave particle
   * @param {number} waveHeight - height of wave particle
   */
  constructor( position, width, color, particleGradientColor, angle, waveHeight ) {
    this.position = position; // @public
    this.width = width; // @public
    this.color = color; // @public
    this.angle = angle; // @public
    this.height = waveHeight; // @public
    this.particleGradientColor = particleGradientColor; // @public
  }

  /**
   * get particle x position
   * @public
   * @returns {number}
   */
  getX() {
    return this.position.x;
  }

  /**
   * get particle Y position
   * @public
   * @returns {number}
   */
  getY() {
    return this.position.y;
  }

  /**
   * Set the particle x position
   * @public
   * @param {number} x - x position in model values
   */
  setX( x ) {
    this.position.x = x;
  }

  /**
   * @public
   * @param {number} y - y position in model values
   */
  setY( y ) {
    this.position.y = y;
  }
}

bendingLight.register( 'WaveParticle', WaveParticle );

export default WaveParticle;