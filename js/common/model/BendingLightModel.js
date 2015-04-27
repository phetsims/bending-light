// Copyright 2002-2015, University of Colorado Boulder
/**
 * Main model for bending light application.  Rays are recomputed whenever laser parameters changed.
 * Each ray oscillates in time, as shown in the wave view.  There are model representations for several tools as well as their visibility.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var IntensityMeter = require( 'BENDING_LIGHT/common/model/IntensityMeter' );
  var MediumState = require( 'BENDING_LIGHT/common/model/MediumState' );
  var Laser = require( 'BENDING_LIGHT/common/model/Laser' );
  var LaserColor = require( 'BENDING_LIGHT/common/view/LaserColor' );

  // default values
  var DEFAULT_LASER_DISTANCE_FROM_PIVOT = 8.125E-6;
  var DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = 2.419;

  //  strings
  var airString = require( 'string!BENDING_LIGHT/air' );
  var waterString = require( 'string!BENDING_LIGHT/water' );
  var glassString = require( 'string!BENDING_LIGHT/glass' );
  var diamondString = require( 'string!BENDING_LIGHT/diamond' );
  var mysteryAString = require( 'string!BENDING_LIGHT/mysteryA' );
  var mysteryBString = require( 'string!BENDING_LIGHT/mysteryB' );

  // mediums that can be selected
  var AIR = new MediumState( airString, 1.000293, false, false );
  var WATER = new MediumState( waterString, 1.333, false, false );
  var GLASS = new MediumState( glassString, 1.5, false, false );
  var DIAMOND = new MediumState( diamondString, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, false, false );
  var MYSTERY_A = new MediumState( mysteryAString, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, true, false );
  var MYSTERY_B = new MediumState( mysteryBString, 1.4, true, false );

  // model parameters
  var SPEED_OF_LIGHT = 2.99792458E8;
  var WAVELENGTH_RED = 650E-9; //nanometers

  // to come up with a good time scale dt, use lambda = v/f.  For lambda = RED_WAVELENGTH and C=SPEED_OF_LIGHT,
  // we have f=4.612E14
  var RED_LIGHT_FREQUENCY = SPEED_OF_LIGHT / WAVELENGTH_RED;

  // speed up by a factor of 2.5 because default wave view was moving too slow
  var TIME_SPEEDUP_SCALE = 2.5;

  // thirty frames per cycle times the speedup scale
  var MAX_DT = 1.0 / RED_LIGHT_FREQUENCY / 30 * TIME_SPEEDUP_SCALE;
  var MIN_DT = MAX_DT / 10;
  var DEFAULT_DT = MAX_DT / 4;

  // a good size for the units being used in the sim; used to determine the dimensions of various model objects
  var CHARACTERISTIC_LENGTH = WAVELENGTH_RED;

  /**
   * Main constructor for BendingLightModel,
   * which contains all of the model logic for the entire sim screen.
   * @param {Number}laserAngle
   * @param {Boolean}topLeftQuadrant
   * @param {number}laserDistanceFromPivot
   * @param {boolean} centerOffsetLeft
   * @constructor
   */

  function BendingLightModel( laserAngle, topLeftQuadrant, laserDistanceFromPivot, centerOffsetLeft ) {

    // list of rays in the model
    this.rays = new ObservableArray();
    var bendingLightModel = this;

    // dimensions of the model, guaranteed to be shown in entirety on the stage
    this.modelWidth = CHARACTERISTIC_LENGTH * 62;
    this.modelHeight = this.modelWidth * 0.7;

    //  if  WebGL support  then particles creation particle and propagation not need
    //  else we should create particles and propagate to render them on canvas.
    this.allowWebGL = false;

    // everything that had a listener in the java version becomes a property
    PropertySet.call( this, {
        laserView: 'ray', //Whether the laser is Ray or Wave mode
        wavelength: WAVELENGTH_RED,
        isPlaying: true,
        speed: 'normal',
        indexOfRefraction: 1,
        showNormal: true
      }
    );

    // model components
    this.intensityMeter = new IntensityMeter( centerOffsetLeft ? -this.modelWidth * 0.525 : -this.modelWidth * 0.385, -this.modelHeight * 0.25,
      centerOffsetLeft ? -this.modelWidth * 0.490 : -this.modelWidth * 0.35, -this.modelHeight * 0.25 );
    this.laser = new Laser( laserDistanceFromPivot, laserAngle, topLeftQuadrant );
    this.wavelengthProperty.link( function( wavelength ) {
      bendingLightModel.laser.colorProperty.set( new LaserColor.OneColor( wavelength ) );
    } );

  }

  return inherit( PropertySet, BendingLightModel, {

      /**
       * @public
       * @param {LightRay}ray
       */
      addRay: function( ray ) {
        this.rays.add( ray );
      },
      getWidth: function() {
        return this.modelWidth;
      },
      getHeight: function() {
        return this.modelHeight;
      },
      getLaser: function() {
        return this.laser;
      },

      getRays: function() {
        return this.rays;
      },
      getIntensityMeter: function() {
        return this.intensityMeter;
      },
      /**
       * clear the model in preparation for another ray propagation update phase
       * @public
       */
      clearModel: function() {

        for ( var i = 0; i < this.rays.length; i++ ) {
          this.rays.get( i ).particles.clear();
        }
        this.rays.clear();
        // clear the accumulator in the intensity meter so it can sum up the newly
        // created rays
        this.intensityMeter.clearRayReadings();
      },

      /**
       * update the model by clearing the rays, then recreating them
       * @public
       */
      updateModel: function() {
        this.clearModel();
        this.propagateRays();
      },

      /**
       * @public
       * Get the fraction of power transmitted through the medium
       * @param {Number} n1
       * @param {Number} n2
       * @param {Number} cosTheta1
       * @param {Number}cosTheta2
       * @returns {number}
       */
      getTransmittedPower: function( n1, n2, cosTheta1, cosTheta2 ) {
        return 4 * n1 * n2 * cosTheta1 * cosTheta2 / (Math.pow( n1 * cosTheta1 + n2 * cosTheta2, 2 ));
      },

      /**
       * Get the fraction of power reflected from the medium
       * @public
       * @param {Number} n1
       * @param {Number} n2
       * @param {Number} cosTheta1
       * @param {Number} cosTheta2
       * @returns {number}
       */
      getReflectedPower: function( n1, n2, cosTheta1, cosTheta2 ) {
        return Math.pow( (n1 * cosTheta1 - n2 * cosTheta2) / (n1 * cosTheta1 + n2 * cosTheta2), 2 );
      },
      /**
       * @public
       */
      resetAll: function() {
        this.laser.resetAll();
        PropertySet.prototype.reset.call( this );
        this.intensityMeter.resetAll();
      }
    },
    //statics
    {
      DEFAULT_LASER_DISTANCE_FROM_PIVOT: DEFAULT_LASER_DISTANCE_FROM_PIVOT,
      DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT: DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT,
      AIR: AIR,
      WATER: WATER,
      GLASS: GLASS,
      DIAMOND: DIAMOND,
      MYSTERY_A: MYSTERY_A,
      MYSTERY_B: MYSTERY_B,
      SPEED_OF_LIGHT: SPEED_OF_LIGHT,
      WAVELENGTH_RED: WAVELENGTH_RED,
      RED_LIGHT_FREQUENCY: RED_LIGHT_FREQUENCY,
      TIME_SPEEDUP_SCALE: TIME_SPEEDUP_SCALE,
      MAX_DT: MAX_DT,
      MIN_DT: MIN_DT,
      DEFAULT_DT: DEFAULT_DT,
      CHARACTERISTIC_LENGTH: CHARACTERISTIC_LENGTH
    } );
} );

