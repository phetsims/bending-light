// Copyright 2002-2015, University of Colorado Boulder

/**
 * A LightRay models one straight segment of a beam (completely within a single medium), with a specific wavelength.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );
  var Ray2 = require( 'DOT/Ray2' );
  var Line = require( 'KITE/segments/Line' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );

  /**
   *
   * @param {number} trapeziumWidth - width of wave at intersection of mediums
   * @param {Vector2} tail - tail position of light ray
   * @param {Vector2} tip - tip position of light ray
   * @param {number} indexOfRefraction - The index of refraction of the medium the light ray inhabits
   * @param {number} wavelength - wavelength in meters
   * @param {number} powerFraction - amount of power this light has (full strength is 1.0)
   * @param {Color} color - color of light ray
   * @param {number} waveWidth - width of the wave
   * @param {number} numWavelengthsPhaseOffset - indicates how many wavelengths have passed before this light ray begins
   * @param {boolean} extend - indicates whether to extend it at tip of the wave
   * @param {boolean} extendBackwards - indicates whether to extend backwards it at tail of the wave
   * @param {Property.<string>} laserViewProperty - specifies the laser view whether ray or wave mode
   * @constructor
   */
  function LightRay( trapeziumWidth, tail, tip, indexOfRefraction, wavelength, powerFraction, color, waveWidth,
                     numWavelengthsPhaseOffset, extend, extendBackwards, laserViewProperty ) {


    // fill in the triangular chip near y=0 even for truncated beams, if it is the transmitted beam
    // Light must be extended backwards for the transmitted wave shape to be correct
    this.extendBackwards = extendBackwards;
    this.color = color;
    this.waveWidth = waveWidth;
    this.trapeziumWidth = trapeziumWidth;

    // Directionality is important for propagation
    this.tip = tip;
    this.tail = tail;

    // The index of refraction of the medium the light ray inhabits
    this.indexOfRefraction = indexOfRefraction;
    this.wavelength = wavelength; // wavelength in meters

    // Amount of power this light has (full strength is 1.0)
    this.powerFraction = powerFraction;

    // This number indicates how many wavelengths have passed before this light ray begins.
    // It is zero for the light coming out of the laser.
    this.numWavelengthsPhaseOffset = numWavelengthsPhaseOffset;

    // has to be an integral number of wavelength so that the phases work out correctly,
    // turing this up too high past 1E6 causes things not to render properly
    this.extend = extend;

    this.vectorForm = new Vector2( 0, 0 );
    this.unitVector = new Vector2( 0, 0 );

    // wave particles
    this.particles = new ObservableArray();

    // time used in wave sensor node
    this.time = 0;

    if ( laserViewProperty.get() === 'wave' ) {

      // The wave is wider than the ray, and must be clipped against the opposite medium so it doesn't leak over
      // angle of tail is Math.PI/2 for transmitted and reflected rays.
      var tipAngle = this.extend ? Math.PI / 2 : this.getAngle();
      var tailAngle = this.extendBackwards ? Math.PI / 2 : this.getAngle();
      var tipWidth = this.extend ? this.trapeziumWidth : this.waveWidth;
      var tailWidth = this.extendBackwards ? this.trapeziumWidth : this.waveWidth;

      // Calculating two end points of tip. They are at the angle of Math.PI/2 with respect to the ray angle
      var tipVectorX = tipWidth * Math.cos( tipAngle + Math.PI / 2 ) / 2;
      var tipVectorY = tipWidth * Math.sin( tipAngle + Math.PI / 2 ) / 2;

      // Calculating two end points of tail. They are at the angle of Math.PI/2 with respect to the ray angle
      var tailVectorX = tailWidth * Math.cos( tailAngle + Math.PI / 2 ) / 2;
      var tailVectorY = tailWidth * Math.sin( tailAngle + Math.PI / 2 ) / 2;

      var tipPoint1 = this.tip.minusXY( tipVectorX, tipVectorY );
      var tipPoint2 = this.tip.plusXY( tipVectorX, tipVectorY );
      var tailPoint1 = this.tail.minusXY( tailVectorX, tailVectorY );
      var tailPoint2 = this.tail.plusXY( tailVectorX, tailVectorY );

      // Getting correct order of points
      var tipPoint1XY = tipPoint2.x > tipPoint1.x ? tipPoint2 : tipPoint1;
      var tipPoint2XY = tipPoint2.x < tipPoint1.x ? tipPoint2 : tipPoint1;

      var tailPoint1XY = tailPoint1.x < tailPoint2.x ? tailPoint1 : tailPoint2;
      var tailPoint2XY = tailPoint1.x > tailPoint2.x ? tailPoint1 : tailPoint2;

      // This is to avoid drawing of wave backwards (near the intersection of mediums) when it intersects intensity
      // meter sensor shape
      if ( (tailPoint2XY.x - tipPoint1XY.x) > 1E-10 ) {
        tipPoint1XY.y = tailPoint2XY.y;
        tailPoint2XY.x = this.toVector().magnitude() / Math.cos( this.getAngle() );
        tipPoint1XY.x = tailPoint2XY.x;
      }
      this.waveShape = new Shape()
        .moveToPoint( tailPoint1XY )
        .lineToPoint( tailPoint2XY )
        .lineToPoint( tipPoint1XY )
        .lineToPoint( tipPoint2XY )
        .close();
    }
  }

  return inherit( Object, LightRay, {

    /**
     * Update the time, so it can update the phase of the wave graphic
     * @public
     * @param {number} time - simulation time
     */
    setTime: function( time ) {
      this.time = time;
    },

    /**
     * Determines the speed of the light ray
     * @public
     * @returns {number}
     */
    getSpeed: function() {
      return BendingLightConstants.SPEED_OF_LIGHT / this.indexOfRefraction;
    },

    /**
     * Check to see if this light ray hits the specified sensor region
     * @public
     * @param {Shape} sensorRegion - sensor region of intensity meter
     * @returns {Array}
     */
    getIntersections: function( sensorRegion ) {
      return sensorRegion.intersection( new Ray2( this.tail, Vector2.createPolar( 1, this.getAngle() ) ) );
    },

    /**
     * @public
     * @returns {Line}
     */
    toLine: function() {
      return new Line( this.tail, this.tip );
    },

    /**
     * Determines length of light ray
     * @public
     * @returns {number}
     */
    getLength: function() {
      return this.tip.distance( this.tail );
    },

    /**
     * @public
     * @returns {Vector2}
     */
    toVector: function() {
      this.vectorForm.x = this.tip.x - this.tail.x;
      this.vectorForm.y = this.tip.y - this.tail.y;
      return this.vectorForm;
    },

    /**
     * Determines the unit vector of light ray
     * @public
     * @returns {Vector2}
     */
    getUnitVector: function() {
      var magnitude = this.tip.distance( this.tail );
      this.unitVector.x = (this.tip.x - this.tail.x) / magnitude;
      this.unitVector.y = (this.tip.y - this.tail.y) / magnitude;
      return this.unitVector;
    },

    /**
     * Determines the angle of light ray
     * @public
     * @returns {number}
     */
    getAngle: function() {
      return Math.atan2( this.tip.y - this.tail.y, this.tip.x - this.tail.x );
    },

    /**
     * @public
     * @returns {number}
     */
    getNumberOfWavelengths: function() {
      return this.getLength() / this.wavelength;
    },

    /**
     * Determine if the light ray contains the specified position,
     * accounting for whether it is shown as a thin light ray or wide wave
     * @public
     * @param {Vector2} position
     * @param {boolean} waveMode - specifies whether ray or wave mode
     * @returns {boolean}
     */
    contains: function( position, waveMode ) {
      if ( waveMode ) {
        return this.waveShape.containsPoint( position );
      }
      else {
        return this.toLine().explicitClosestToPoint( position )[ 0 ].distanceSquared < 1E-14;
      }
    },

    /**
     * @public
     * @returns {number}
     */
    getRayWidth: function() {
      // at the default transform, this yields a 4 pixel wide stroke
      return 1.5992063492063494E-7;
    },

    /**
     * @public
     * @returns {Vector2}
     */
    getVelocityVector: function() {
      return this.tip.minus( this.tail ).normalize().multiplyScalar( this.getSpeed() );
    },

    /**
     * @public
     * @returns {number}
     */
    getFrequency: function() {
      return this.getSpeed() / this.wavelength;
    },

    /**
     * @public
     * @returns {number}
     */
    getAngularFrequency: function() {
      return this.getFrequency() * Math.PI * 2;
    },

    /**
     * @public
     * @returns {number}
     */
    getPhaseOffset: function() {
      return this.getAngularFrequency() * this.time - 2 * Math.PI * this.numWavelengthsPhaseOffset;
    },

    /**
     * Get the total argument to the cosine for the wave function(k * x - omega * t + phase)
     * @public
     * @param {number} distanceAlongRay - distance of a specific point from the start of the ray
     * @returns {number}
     */
    getCosArg: function( distanceAlongRay ) {
      var w = this.getAngularFrequency();
      var k = 2 * Math.PI / this.wavelength;
      var x = distanceAlongRay;
      var t = this.time;
      return k * x - w * t + 2 * Math.PI * this.numWavelengthsPhaseOffset;
    }
  } );
} );