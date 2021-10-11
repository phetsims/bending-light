// Copyright 2015-2021, University of Colorado Boulder

/**
 * WaveParticle is to simulate the wave transformation in Canvas mode.
 * WaveParticle has position, width, angle and etc..
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Color from '../../../../scenery/js/util/Color.js';
import bendingLight from '../../bendingLight.js';

class WaveParticle {
  private readonly position: Vector2;
  private readonly width: number;
  readonly color: string;
  readonly angle: number;
  readonly height: number;
  readonly particleGradientColor: string;

  /**
   * @param {Vector2} position - position of wave particle
   * @param {number} width - width of wave particle
   * @param {Color} color - color of wave particle
   * @param {Color} particleGradientColor
   * @param {number} angle - angle of wave particle
   * @param {number} waveHeight - height of wave particle
   */
  constructor( position: Vector2, width: number, color: string, particleGradientColor: string, angle: number, waveHeight: number ) {
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
  setX( x: number ) {
    this.position.x = x;
  }

  /**
   * @public
   * @param {number} y - y position in model values
   */
  setY( y: number ) {
    this.position.y = y;
  }
}

bendingLight.register( 'WaveParticle', WaveParticle );

export default WaveParticle;