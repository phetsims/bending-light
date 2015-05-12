// Copyright 2002-2015, University of Colorado Boulder
/**
 * A LightRay models one straight segment of a beam (completely within a single medium), with a specific wavelength.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni(Actual Concepts)
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
   * @param {number} trapeziumWidth
   * @param {Vector2} tail
   * @param {Vector2} tip
   * @param {number} indexOfRefraction
   * @param {number} wavelength
   * @param {number} powerFraction
   * @param {Color} color
   * @param {number} waveWidth
   * @param {number} numWavelengthsPhaseOffset
   * @param {boolean} extend
   * @param {boolean} extendBackwards
   * @constructor
   */
  function LightRay( trapeziumWidth, tail, tip, indexOfRefraction, wavelength, powerFraction, color, waveWidth,
                     numWavelengthsPhaseOffset, extend, extendBackwards ) {


    // fill in the triangular chip near y=0 even for truncated beams, if it is the transmitted beam
    // Light must be extended backwards for the transmitted wave shape to be correct
    this.extendBackwards = extendBackwards;
    this.color = color;
    this.waveWidth = waveWidth;
    this.trapeziumWidth = trapeziumWidth;

    // Directionality is important for propagation
    this.tip = tip;
    this.tail = tail;

    // The index of refraction of the medium the lightray inhabits
    this.indexOfRefraction = indexOfRefraction;
    this.wavelength = wavelength;    // wavelength in meters

    // Amount of power this light has (full strength is 1.0)
    this.powerFraction = powerFraction;

    // This number indicates how many wavelengths have passed before this light ray begins;
    // It is zero for the light coming out of the laser.
    this.numWavelengthsPhaseOffset = numWavelengthsPhaseOffset;

    // has to be an integral number of wavelength so that the phases work out correctly,
    // turing this up too high past 1E6 causes things not to render properly
    this.extend = extend;

    this.waveBounds = [];
    this.vectorForm = new Vector2( 0, 0 );
    this.unitVector = new Vector2( 0, 0 );

    // wave particles
    this.particles = new ObservableArray();

    // time used in wave sensor node
    this.time = 0;
  }

  return inherit( Object, LightRay, {

    /**
     *
     * @param {number} time
     */
    setTime: function( time ) {
      this.time = time;
    },

    /**
     * @public
     * @returns {number}
     */
    getSpeed: function() {
      return BendingLightConstants.SPEED_OF_LIGHT / this.indexOfRefraction;
    },

    /**
     * @public
     * @returns {number}
     */
    getPowerFraction: function() {
      return this.powerFraction;
    },

    /**
     * Check to see if this light ray hits the specified sensor region
     * @public
     * @param {Shape} sensorRegion
     * @returns {Array}
     */
    getIntersections: function( sensorRegion ) {
      return sensorRegion.intersection( new Ray2( this.tail, Vector2.createPolar( 1, this.getAngle() ) ) );
    },

    /**
     * @public
     * @returns {Line}
     */
    toLine2D: function() {
      return new Line( this.tail, this.tip );
    },

    /**
     * @public
     * @returns {number}
     */
    getLength: function() {
      return this.tip.minus( this.tail ).magnitude();
    },

    /**
     * @public
     * @returns {Vector2}
     */
    toVector2D: function() {
      this.vectorForm.x = this.tip.x - this.tail.x;
      this.vectorForm.y = this.tip.y - this.tail.y;
      return this.vectorForm;
    },

    /**
     * @public
     * @returns {Color}
     */
    getColor: function() {
      return this.color;
    },

    /**
     * @public
     * @returns {number}
     */
    getWavelength: function() {
      return this.wavelength;
    },

    /**
     * The wave is wider than the ray, and must be clipped against the opposite medium so it doesn't leak over
     * @public
     * @returns {Shape}
     */
    getWaveShape: function() {
      var tipAngle = this.extend ? Math.PI / 2 : this.getAngle();
      var tailAngle = this.extendBackwards ? Math.PI / 2 : this.getAngle();
      var tipWidth = this.extend ? this.trapeziumWidth : this.waveWidth;
      var tailWidth = this.extendBackwards ? this.trapeziumWidth : this.waveWidth;

      var tipVector = Vector2.createPolar( 1, tipAngle + Math.PI / 2 );
      tipVector.x = tipVector.x * tipWidth / 2;
      tipVector.y = tipVector.y * tipWidth / 2;

      var tailVector = Vector2.createPolar( 1, tailAngle + Math.PI / 2 );
      tailVector.x = tailVector.x * tailWidth / 2;
      tailVector.y = tailVector.y * tailWidth / 2;

      var tipPoint1 = this.tip.minus( tipVector );
      var tipPoint2 = this.tip.plus( tipVector );
      var tailPoint1 = this.tail.minus( tailVector );
      var tailPoint2 = this.tail.plus( tailVector );

      var tipPoint1X = tipPoint2.x > tipPoint1.x ? tipPoint2.x : tipPoint1.x;
      var tipPoint1Y = tipPoint2.x > tipPoint1.x ? tipPoint2.y : tipPoint1.y;
      var tipPoint2X = tipPoint2.x < tipPoint1.x ? tipPoint2.x : tipPoint1.x;
      var tipPoint2Y = tipPoint2.x < tipPoint1.x ? tipPoint2.y : tipPoint1.y;

      var tailPoint1X = tailPoint1.x < tailPoint2.x ? tailPoint1.x : tailPoint2.x;
      var tailPoint1Y = tailPoint1.x < tailPoint2.x ? tailPoint1.y : tailPoint2.y;
      var tailPoint2X = tailPoint1.x > tailPoint2.x ? tailPoint1.x : tailPoint2.x;
      var tailPoint2Y = tailPoint1.x > tailPoint2.x ? tailPoint1.y : tailPoint2.y;

      if ( (tailPoint2X - tipPoint1X) > 1E-10 ) {
        tipPoint1Y = tailPoint2Y;
        tailPoint2X = this.toVector2D().magnitude() / Math.cos( this.getAngle() );
        tipPoint1X = tailPoint2X;
      }
      var shape = new Shape();
      shape.moveTo( tailPoint1X, tailPoint1Y )
        .lineTo( tailPoint2X, tailPoint2Y )
        .lineTo( tipPoint1X, tipPoint1Y )
        .lineTo( tipPoint2X, tipPoint2Y )
        .close();
      return shape;
    },

    /**
     * The wave is wider than the ray, and must be clipped against the opposite medium so it doesn't leak over
     * @public
     * @returns {Array}
     */
    getWaveBounds: function() {
      if ( this.waveBounds.length > 0 ) {
        return this.waveBounds;
      }

      var angle = this.extendBackwards ? Math.abs( this.getAngle() ) : Math.PI / 2;
      var tailWidth = this.waveWidth;
      var tipWidth = this.trapeziumWidth;

      // tip point
      var tipPoint1 = new Vector2( this.tip.x + tipWidth / 2, this.tip.y );
      var tipPoint2 = new Vector2( this.tip.x - tipWidth / 2, this.tip.y );

      //tail
      var tailPoint1 = new Vector2( this.tail.x + tailWidth / 2 * Math.sin( angle ),
        this.tail.y + tailWidth / 2 * Math.cos( angle ) );
      var tailPoint2 = new Vector2( this.tail.x - tailWidth / 2 * Math.sin( angle ),
        this.tail.y - tailWidth / 2 * Math.cos( angle ) );
      this.waveBounds = [ tailPoint1, tailPoint2, tipPoint2, tipPoint1 ];
      return this.waveBounds;
    },

    /**
     * @public
     * @returns {Vector2}
     */
    getUnitVector: function() {
      var x = this.tip.x - this.tail.x;
      var y = this.tip.y - this.tail.y;
      var magnitude = Math.sqrt( x * x + y * y );
      this.unitVector.x = x / magnitude;
      this.unitVector.y = y / magnitude;
      return this.unitVector;
    },

    /**
     *  @public
     * @returns {number}
     */
    getAngle: function() {
      return this.toVector2D().angle();
    },
    // todo:Update the time and notify wave listeners so they can update the phase of the wave graphic

    /**
     * @pub
     * @returns {number}
     */
    getWaveWidth: function() {
      return this.waveWidth;
    },

    /**
     *  @public
     * @returns {number}
     */
    getNumberOfWavelengths: function() {
      return this.getLength() / this.wavelength;
    },

    /**
     * @public
     * @returns {number}
     */
    getNumWavelengthsPhaseOffset: function() {
      return this.numWavelengthsPhaseOffset;
    },


    /**
     * Determine if the light ray contains the specified position,
     * accounting for whether it is shown as a thin light ray or wide wave
     * @public
     * @param {Vector2} position
     * @param {boolean} waveMode
     * @returns {boolean}
     */
    contains: function( position, waveMode ) {
      if ( waveMode ) {
        // todo:  Need to Change kite/js/segments/Line.js    ( s < 0.000001 ) = >   ( s < 0.0000001 )
        //  return this.getWaveShape().containsPoint( position );
        var intersection = this.getWaveShape().intersection( new Ray2( position, this.getUnitVector() ) );
        return intersection.length % 2 === 1;
      }
      else {
        return this.toLine2D().explicitClosestToPoint( position )[ 0 ].distanceSquared < 1E-14;
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
      return this.tip.minus( this.tail ).normalized().times( this.getSpeed() );
    },

    /**
     * @public
     * @returns {number}
     */
    getFrequency: function() {
      return this.getSpeed() / this.getWavelength();
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
     * @param {number} distanceAlongRay
     * @returns {number}
     */
    getCosArg: function( distanceAlongRay ) {
      var w = this.getAngularFrequency();
      var k = 2 * Math.PI / this.getWavelength();
      var x = distanceAlongRay;
      var t = this.time;
      return k * x - w * t - 2 * Math.PI * this.numWavelengthsPhaseOffset;
    },

    /**
     * @public
     * @returns {number}
     */
    getTime: function() {
      return this.time;
    }
  } );
} );