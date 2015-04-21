// Copyright 2002-2015, University of Colorado Boulder
/**
 * A LightRay models one straight segment of a beam (completely within
 * a single medium), with a specific wavelength.
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


  // constants
  var SPEED_OF_LIGHT = 2.99792458E8;

  /**
   *
   * @param {Number} trapeziumWidth
   * @param {Vector2} tail
   * @param {Vector2} tip
   * @param {Number} indexOfRefraction
   * @param {Number} wavelength
   * @param {Number} powerFraction
   * @param {Color} color
   * @param {Number} waveWidth
   * @param {Number} numWavelengthsPhaseOffset
   * @param {Number} oppositeMedium
   * @param {boolean} extend
   * @param {boolean} extendBackwards
   * @constructor
   */
  function LightRay( trapeziumWidth, tail, tip, indexOfRefraction, wavelength, powerFraction, color, waveWidth, numWavelengthsPhaseOffset, oppositeMedium, extend, extendBackwards ) {

    //  used to create a clipped shape for wave mode
    this.oppositeMedium = oppositeMedium;

    // fill in the triangular chip near y=0 even for truncated beams, if it is the transmitted beam
    // Light must be extended backwards for the transmitted wave shape to be correct
    this.extendBackwards = extendBackwards;
    this.color = color;
    this.waveWidth = waveWidth;
    this.trapeziumWidth = trapeziumWidth;

    // directionality is important for propagation
    this.tip = tip;
    this.tail = tail;

    // the index of refraction of the medium the lightray inhabits
    this.indexOfRefraction = indexOfRefraction;
    this.wavelength = wavelength;    // wavelength in meters

    // amount of power this light has (full strength is 1.0)
    this.powerFraction = powerFraction;

    // this number indicates how many wavelengths have passed before this light ray begins;
    // it is zero for the light coming out of the laser.
    this.numWavelengthsPhaseOffset = numWavelengthsPhaseOffset;

    // has to be an integral number of wavelength so that the phases work out correctly,
    // turing this up too high past 1E6 causes things not to render properly
    this.extend = extend;

    this.waveBounds = [];
    this.vectorForm = new Vector2( 0, 0 );

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
      return SPEED_OF_LIGHT / this.indexOfRefraction;
    },

    /**
     * @public
     * @returns {Number|*}
     */
    getPowerFraction: function() {
      return this.powerFraction;
    },

    /**
     * Check to see if this light ray hits the specified sensor region
     *@public
     * @param {Shape} sensorRegion
     * @returns {*}
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
     * @returns {*}
     */
    getLength: function() {
      return this.tip.minus( this.tail ).magnitude();
    },

    /**
     * @public
     * @returns {Vector2|*}
     */
    toVector2D: function() {
      this.vectorForm.x = this.tip.x - this.tail.x;
      this.vectorForm.y = this.tip.y - this.tail.y;
      return this.vectorForm;
    },

    /**
     * @public
     * @returns {Element.color|*}
     */
    getColor: function() {
      return this.color;
    },

    /**
     * @public
     * @returns {OneColor.wavelength|*}
     */
    getWavelength: function() {
      return this.wavelength;
    },

    /**
     * The wave is wider than the ray, and must be clipped against the opposite medium so it doesn't leak over
     * @public
     * @returns {*}
     */
    getWaveShape: function() {
      var tipAngle = this.extend ? Math.PI / 2 : this.getAngle();
      var tailAngle = this.extendBackwards ? Math.PI / 2 : this.getAngle();
      var tipWidth = this.extend ? this.trapeziumWidth : this.waveWidth;
      var tailWidth = this.extendBackwards ? this.trapeziumWidth : this.waveWidth;

      var tipPoint1 = this.tip.minus( Vector2.createPolar( 1, tipAngle ).perpendicular().times( tipWidth / 2 ) );
      var tipPoint2 = this.tip.plus( Vector2.createPolar( 1, tipAngle ).perpendicular().times( tipWidth / 2 ) );
      var tailPoint1 = this.tail.minus( Vector2.createPolar( 1, tailAngle ).perpendicular().times( tailWidth / 2 ) );
      var tailPoint2 = this.tail.plus( Vector2.createPolar( 1, tailAngle ).perpendicular().times( tailWidth / 2 ) );

      var shape = new Shape();
      shape.moveToPoint( tailPoint1.x < tailPoint2.x ? tailPoint1 : tailPoint2 )
        .lineToPoint( tailPoint1.x > tailPoint2.x ? tailPoint1 : tailPoint2 )
        .lineToPoint( tipPoint2.x > tipPoint1.x ? tipPoint2 : tipPoint1 )
        .lineToPoint( tipPoint2.x < tipPoint1.x ? tipPoint2 : tipPoint1 )
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
      var tailPoint1 = new Vector2( this.tail.x + tailWidth / 2 * Math.sin( angle ), this.tail.y + tailWidth / 2 * Math.cos( angle ) );
      var tailPoint2 = new Vector2( this.tail.x - tailWidth / 2 * Math.sin( angle ), this.tail.y - tailWidth / 2 * Math.cos( angle ) );
      this.waveBounds = [ tailPoint1, tailPoint2, tipPoint2, tipPoint1 ];
      return this.waveBounds;
    },

    /**
     * @public
     * @returns {*}
     */
    getUnitVector: function() {
      var x = this.tip.x - this.tail.x;
      var y = this.tip.y - this.tail.y;
      return new Vector2( x, y ).normalized();
    },

    /**
     *  @public
     * @returns {*}
     */
    getAngle: function() {
      return this.toVector2D().angle();
    },
    // todo:Update the time and notify wave listeners so they can update the phase of the wave graphic

    /**
     * @pub
     * @returns {Number|*}
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
     * @returns {Number|*}
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
     * @returns {*}
     */
    contains: function( position, waveMode ) {
      if ( waveMode ) {
        return this.getWaveShape().containsPoint( position );
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
     * @returns {*}
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
     * @returns {number|*}
     */
    getTime: function() {
      return this.time;
    }
  } );
} );

