// Copyright 2015-2021, University of Colorado Boulder

/**
 * A LightRay models one straight segment of a beam (completely within a single medium), with a specific wavelength.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Ray2 from '../../../../dot/js/Ray2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Line from '../../../../kite/js/segments/Line.js';
import Shape from '../../../../kite/js/Shape.js';
import Color from '../../../../scenery/js/util/Color.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import WaveParticle from './WaveParticle.js';

// constants
/**
 * If a vector is infinite, make it finite
 * @param vector
 */
const makeFinite = ( vector: Vector2 ) => {
  if ( !isFinite( vector.x ) ) {
    vector.x = 0;
  }
  if ( !isFinite( vector.y ) ) {
    vector.y = 0;
  }
};

class LightRay {
  readonly extendBackwards: boolean;
  readonly color: Color;
  readonly waveWidth: number;
  readonly trapeziumWidth: number;

  // Directionality is important for propagation
  readonly tip: Vector2;
  readonly tail: Vector2;

  indexOfRefraction: number;
  wavelength: number;
  wavelengthInVacuum: number;
  powerFraction: number;
  numWavelengthsPhaseOffset: number;
  extend: boolean;

  // for internal use only. Clients should use toVector()
  private unitVector: Vector2 = new Vector2( 0, 0 );
  private vectorForm: Vector2 = new Vector2( 0, 0 );

  // wave particles
  particles: ObservableArray<WaveParticle> = createObservableArray();

  // time used in wave sensor node
  time: number = 0;
  rayType: string;


  waveShape: Shape | null = null;
  clipRegionCorners: Vector2[] | null = null;
  static RAY_WIDTH: number;

  /**
   * @param trapeziumWidth - width of wave at intersection of mediums
   * @param tail - tail position of light ray
   * @param tip - tip position of light ray
   * @param indexOfRefraction - The index of refraction of the medium the light ray inhabits
   * @param wavelength - wavelength in meters
   * @param wavelengthInVacuum - wavelength in nm (in a vacuum, not in the current medium)
   * @param powerFraction - amount of power this light has (full strength is 1.0)
   * @param color - color of light ray
   * @param waveWidth - width of the wave
   * @param numWavelengthsPhaseOffset - indicates how many wavelengths have passed before this light ray begins
   * @param extend - indicates whether to extend it at tip of the wave
   * @param extendBackwards - indicates whether to extend backwards it at tail of the wave
   * @param laserView - specifies the laser view whether ray or wave mode
   * @param rayType - for the intro model, 'incident' | 'reflected' | 'transmitted' | 'prism'
   */
  constructor( trapeziumWidth: number, tail: Vector2, tip: Vector2, indexOfRefraction: number, wavelength: number, wavelengthInVacuum: number, powerFraction: number, color: Color,
               waveWidth: number, numWavelengthsPhaseOffset: number, extend: boolean, extendBackwards: boolean, laserView: string, rayType: string ) {

    // fill in the triangular chip near y=0 even for truncated beams, if it is the transmitted beam
    // Light must be extended backwards for the transmitted wave shape to be correct
    this.extendBackwards = extendBackwards;
    this.color = color;
    this.waveWidth = waveWidth;
    this.trapeziumWidth = trapeziumWidth;
    this.tip = tip;
    this.tail = tail;

    // The index of refraction of the medium the light ray inhabits
    this.indexOfRefraction = indexOfRefraction; // @public (read-only)
    this.wavelength = wavelength; // @public (read-only), wavelength in meters
    assert && assert( wavelengthInVacuum >= 300 && wavelengthInVacuum <= 900 );
    this.wavelengthInVacuum = wavelengthInVacuum; // @public (read-only), wavelength in nm

    // Amount of power this light has (full strength is 1.0)
    this.powerFraction = powerFraction; // @public (read-only)

    // This number indicates how many wavelengths have passed before this light ray begins.
    // It is zero for the light coming out of the laser.
    this.numWavelengthsPhaseOffset = numWavelengthsPhaseOffset; // @public (read-only)

    // has to be an integral number of wavelength so that the phases work out correctly,
    // turing this up too high past 1E6 causes things not to render properly
    this.extend = extend; // @public (read-only)

    // @public (read-only) Keep track of the type of light ray for use in AngleNode
    this.rayType = rayType;

    if ( laserView === 'wave' ) {

      // The wave is wider than the ray, and must be clipped against the opposite medium so it doesn't leak over
      // angle of tail is Math.PI/2 for transmitted and reflected rays.
      const tipAngle = this.extend ? Math.PI / 2 : this.getAngle();
      const tailAngle = this.extendBackwards ? Math.PI / 2 : this.getAngle();
      const tipWidth = this.extend ? this.trapeziumWidth : this.waveWidth;
      const tailWidth = this.extendBackwards ? this.trapeziumWidth : this.waveWidth;

      // Calculating two end points of tip. They are at the angle of Math.PI/2 with respect to the ray angle
      const tipVectorX = tipWidth * Math.cos( tipAngle + Math.PI / 2 ) / 2;
      const tipVectorY = tipWidth * Math.sin( tipAngle + Math.PI / 2 ) / 2;

      // Calculating two end points of tail. They are at the angle of Math.PI/2 with respect to the ray angle
      const tailVectorX = tailWidth * Math.cos( tailAngle + Math.PI / 2 ) / 2;
      const tailVectorY = tailWidth * Math.sin( tailAngle + Math.PI / 2 ) / 2;

      const tipPoint1 = this.tip.minusXY( tipVectorX, tipVectorY );
      const tipPoint2 = this.tip.plusXY( tipVectorX, tipVectorY );
      const tailPoint1 = this.tail.minusXY( tailVectorX, tailVectorY );
      const tailPoint2 = this.tail.plusXY( tailVectorX, tailVectorY );

      // Getting correct order of points
      const tipPoint1XY = tipPoint2.x > tipPoint1.x ? tipPoint2 : tipPoint1;
      const tipPoint2XY = tipPoint2.x < tipPoint1.x ? tipPoint2 : tipPoint1;

      const tailPoint1XY = tailPoint1.x < tailPoint2.x ? tailPoint1 : tailPoint2;
      const tailPoint2XY = tailPoint1.x > tailPoint2.x ? tailPoint1 : tailPoint2;

      // This is to avoid drawing of wave backwards (near the intersection of mediums) when it intersects intensity
      // meter sensor shape
      if ( ( tailPoint2XY.x - tipPoint1XY.x ) > 1E-10 ) {
        tipPoint1XY.y = tailPoint2XY.y;
        tailPoint2XY.x = this.toVector().magnitude / Math.cos( this.getAngle() );
        tipPoint1XY.x = tailPoint2XY.x;
      }

      // Make sure we don't send NaN or +/- Infinity to Kite, see https://github.com/phetsims/bending-light/issues/329
      makeFinite( tailPoint1XY );
      makeFinite( tailPoint2XY );
      makeFinite( tipPoint1XY );
      makeFinite( tipPoint2XY );

      // @public (read-only)
      this.waveShape = new Shape()
        .moveToPoint( tailPoint1XY )
        .lineToPoint( tailPoint2XY )
        .lineToPoint( tipPoint1XY )
        .lineToPoint( tipPoint2XY )
        .close();

      // @public (read-only), for drawing the clipping shape
      this.clipRegionCorners = [
        new Vector2( tailPoint1XY.x, tailPoint1XY.y ),
        new Vector2( tailPoint2XY.x, tailPoint2XY.y ),
        new Vector2( tipPoint1XY.x, tipPoint1XY.y ),
        new Vector2( tipPoint2XY.x, tipPoint2XY.y )
      ];
    }
  }

  /**
   * Update the time, so it can update the phase of the wave graphic
   * @public
   * @param {number} time - simulation time
   */
  setTime( time: number ) {
    this.time = time;
  }

  /**
   * Determines the speed of the light ray
   * @public
   * @returns {number}
   */
  getSpeed() {
    return BendingLightConstants.SPEED_OF_LIGHT / this.indexOfRefraction;
  }

  /**
   * @param {number} distance
   * @param {string} rayType
   * @returns {Ray2}
   * @private
   */
  createParallelRay( distance: number, rayType: string ) {
    const perpendicular = Vector2.createPolar( distance, this.getAngle() + Math.PI / 2 );
    const t = rayType === 'incident' ? this.tip : this.tail;
    const tail = t.plus( perpendicular );
    return new Ray2( tail, Vector2.createPolar( 1, this.getAngle() + ( rayType === 'incident' ? Math.PI : 0 ) ) );
  }

  /**
   * Check to see if this light ray hits the specified sensor region
   * @public
   * @param {Shape} sensorRegion - sensor region of intensity meter
   * @param {string} rayType - 'incident', 'transmitted' or 'reflected'
   * @returns {Array}
   */
  getIntersections( sensorRegion: Shape, rayType: string ) {

    if ( this.waveShape ) {

      // Create a ray that is parallel to the light ray and within the beam width that is closest to the center
      // of the sensor.  This is the most straightforward way to check for the closest intersection to the sensor
      // region.
      const p = sensorRegion.getBounds().center;

      const tip = this.tip;
      const tail = this.tail;

      // Compute the distance from the sensor to the ray, using
      // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
      const n = tip.minus( tail ).normalized();
      const a = tail;
      const aMinusP = a.minus( p );
      let distanceToRay = aMinusP.minus( n.timesScalar( aMinusP.dot( n ) ) ).magnitude;

      const perpendicular = Vector2.createPolar( 1, this.getAngle() + Math.PI / 2 );
      const sign = perpendicular.dot( p.minus( a ) ) < 0 ? -1 : +1;
      distanceToRay = sign * Math.min( distanceToRay, this.waveWidth / 2 );
      return sensorRegion.intersection( this.createParallelRay( distanceToRay, rayType ) );
    }
    else {
      const direction = Vector2.createPolar( 1, this.getAngle() + ( rayType === 'incident' ? Math.PI : 0 ) );
      const ray = new Ray2( rayType === 'incident' ? this.tip : this.tail, direction );
      return sensorRegion.intersection( ray );
    }
  }

  /**
   * @public
   * @returns {Line}
   */
  toLine() {
    return new Line( this.tail, this.tip );
  }

  /**
   * Determines length of light ray
   * @public
   * @returns {number}
   */
  getLength() {
    return this.tip.distance( this.tail );
  }

  /**
   * @public
   * @returns {Vector2}
   */
  toVector() {
    this.vectorForm.x = this.tip.x - this.tail.x;
    this.vectorForm.y = this.tip.y - this.tail.y;
    return this.vectorForm;
  }

  /**
   * Determines the unit vector of light ray
   * @public
   * @returns {Vector2}
   */
  getUnitVector() {
    const magnitude = this.tip.distance( this.tail );
    this.unitVector.x = ( this.tip.x - this.tail.x ) / magnitude;
    this.unitVector.y = ( this.tip.y - this.tail.y ) / magnitude;
    return this.unitVector;
  }

  /**
   * Determines the angle of light ray
   * @public
   * @returns {number}
   */
  getAngle() {
    return Math.atan2( this.tip.y - this.tail.y, this.tip.x - this.tail.x );
  }

  /**
   * @public
   * @returns {number}
   */
  getNumberOfWavelengths() {
    return this.getLength() / this.wavelength;
  }

  /**
   * Determine if the light ray contains the specified position,
   * accounting for whether it is shown as a thin light ray or wide wave
   * @public
   * @param {Vector2} position
   * @param {boolean} waveMode - specifies whether ray or wave mode
   * @returns {boolean}
   */
  contains( position: Vector2, waveMode: boolean ) {
    if ( waveMode && this.waveShape ) {
      return this.waveShape.containsPoint( position );
    }
    else {
      // @ts-ignore
      return this.toLine().explicitClosestToPoint( position )[ 0 ].distanceSquared < 1E-14;
    }
  }

  /**
   * @public
   * @returns {Vector2}
   */
  getVelocityVector() {
    return this.tip.minus( this.tail ).normalize().multiplyScalar( this.getSpeed() );
  }

  /**
   * @public
   * @returns {number}
   */
  getFrequency() {
    return this.getSpeed() / this.wavelength;
  }

  /**
   * @public
   * @returns {number}
   */
  getAngularFrequency() {
    return this.getFrequency() * Math.PI * 2;
  }

  /**
   * @public
   * @returns {number}
   */
  getPhaseOffset() {
    return this.getAngularFrequency() * this.time - 2 * Math.PI * this.numWavelengthsPhaseOffset;
  }

  /**
   * Get the total argument to the cosine for the wave function(k * x - omega * t + phase)
   * @public
   * @param {number} distanceAlongRay - distance of a specific point from the start of the ray
   * @returns {number}
   */
  getCosArg( distanceAlongRay: number ) {
    const w = this.getAngularFrequency();
    const k = 2 * Math.PI / this.wavelength;
    const x = distanceAlongRay;
    const t = this.time;
    return k * x - w * t + 2 * Math.PI * this.numWavelengthsPhaseOffset;
  }
}

LightRay.RAY_WIDTH = 1.5992063492063494E-7;

bendingLight.register( 'LightRay', LightRay );

export default LightRay;