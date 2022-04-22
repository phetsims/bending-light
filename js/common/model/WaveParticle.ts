// Copyright 2015-2022, University of Colorado Boulder

/**
 * WaveParticle is to simulate the wave transformation in Canvas mode.
 * WaveParticle has position, width, angle and etc..
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import bendingLight from '../../bendingLight.js';

class WaveParticle {
  private readonly position: Vector2;
  private readonly width: number;
  readonly color: string;
  readonly angle: number;
  readonly height: number;
  readonly particleGradientColor: string;

  /**
   * @param position - position of wave particle
   * @param width - width of wave particle
   * @param color - color of wave particle
   * @param particleGradientColor
   * @param angle - angle of wave particle
   * @param waveHeight - height of wave particle
   */
  constructor( position: Vector2, width: number, color: string, particleGradientColor: string, angle: number, waveHeight: number ) {
    this.position = position;
    this.width = width;
    this.color = color;
    this.angle = angle;
    this.height = waveHeight;
    this.particleGradientColor = particleGradientColor;
  }

  /**
   * get particle x position
   * @returns {number}
   */
  getX() {
    return this.position.x;
  }

  /**
   * get particle Y position
   * @returns {number}
   */
  getY() {
    return this.position.y;
  }

  /**
   * Set the particle x position
   * @param {number} x - x position in model values
   */
  setX( x: number ) {
    this.position.x = x;
  }

  /**
   * @param {number} y - y position in model values
   */
  setY( y: number ) {
    this.position.y = y;
  }
}

bendingLight.register( 'WaveParticle', WaveParticle );

export default WaveParticle;