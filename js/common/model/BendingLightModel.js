// Copyright 2002-2011, University of Colorado
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
  var LaserView = require( 'BENDING_LIGHT/common/view/LaserView' );
  var Laser = require( 'BENDING_LIGHT/common/model/Laser' );

  //Default values
  var DEFAULT_LASER_DISTANCE_FROM_PIVOT = 8.125E-6;
  var DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = 2.419;

  //Mediums that can be selected
  var AIR = new MediumState( 'AIR', 1.000293 );
  var WATER = new MediumState( 'WATER', 1.333 );
  var GLASS = new MediumState( 'GLASS', 1.5 );
  var DIAMOND = new MediumState( 'DIAMOND', DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT );
  var MYSTERY_A = new MediumState( 'MYSTERY_A', DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, true );
  var MYSTERY_B = new MediumState( 'MYSTERY_B', 1.4, true );

  //Model parameters
  var SPEED_OF_LIGHT = 2.99792458E8;
  var WAVELENGTH_RED = 650E-9; //nanometers

  //To come up with a good time scale dt, use lambda = v/f.  For lambda = RED_WAVELENGTH and C=SPEED_OF_LIGHT,
  // we have f=4.612E14
  var RED_LIGHT_FREQUENCY = SPEED_OF_LIGHT / WAVELENGTH_RED;

  //Speed up by a factor of 2.5 because default wave view was moving too slow
  var TIME_SPEEDUP_SCALE = 2.5;

  //thirty frames per cycle times the speedup scale
  var MAX_DT = 1.0 / RED_LIGHT_FREQUENCY / 30 * TIME_SPEEDUP_SCALE;
  var MIN_DT = MAX_DT / 10;
  var DEFAULT_DT = MAX_DT / 4;

  //A good size for the units being used in the sim; used to determine the dimensions of various model objects
  var CHARACTERISTIC_LENGTH = WAVELENGTH_RED;

  /**
   * Main constructor for BendingLightModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  /**
   *
   * @param {Number}laserAngle
   * @param {Boolean}topLeftQuadrant
   * @param {number}laserDistanceFromPivot
   * @constructor
   */
  function BendingLightModel( laserAngle, topLeftQuadrant, laserDistanceFromPivot) {


    //List of rays in the model
    this.rays = new ObservableArray();

    //Dimensions of the model, guaranteed to be shown in entirety on the stage
    this.modelWidth = CHARACTERISTIC_LENGTH * 62;
    this.modelHeight = this.modelWidth * 0.7;

    // everything that had a listener in the java version becomes a property
    PropertySet.call( this, {
        laserView: 'ray',//LaserView.RAY, //Whether the laser is Ray or Wave mode
        wavelengthProperty: WAVELENGTH_RED,
        isPlaying: true,
        speed: 'normal',
        indexOfRefraction: 1,
        showNormal: true,
        topMediumIndexOfRefraction: 0,
        bottomMediumIndexOfRefraction: 1
      }
    );
    //Model components
    this.intensityMeter = new IntensityMeter( 0, 0, 0, 0 );
    this.laser = new Laser( laserDistanceFromPivot, laserAngle, topLeftQuadrant );
  }

  return inherit( PropertySet, BendingLightModel, {

     step:function(){
       this.rays.clear();
       this.propagateRays();
     },
      /**

       *
       * @param ray
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
      addRayAddedListener: function( listener ) {
        this.rayAddedListeners.add( listener );
      },
      getLaser: function() {
        return this.laser;
      },
      getClock: function() {
        return clock;
      },
      getRays: function() {
        return this.rays;
      },
      getIntensityMeter: function() {
        return this.intensityMeter;
      },
      //Clear the model in preparation for another ray propagation update phase
      clearModel: function() {
        for ( var ray in this.rays ) {
          ray.remove();
        }
        this.rays.clear();
        //Clear the accumulator in the intensity meter so it can sum up the newly created rays
        this.intensityMeter.clearRayReadings();
      },
      //Update the model by clearing the rays, then recreating them
      updateModel: function() {
        this.clearModel();
        this.propagateRays();
        for ( var modelUpdateListener in this.modelUpdateListeners ) {
          modelUpdateListener.apply();
        }
      },
      //Abstract method for creating all the rays in the model after the model has been cleared
      propagateRays: function() {},
      //Get the fraction of power transmitted through the medium
      getTransmittedPower: function( n1, n2, cosTheta1, cosTheta2 ) {
        return 4 * n1 * n2 * cosTheta1 * cosTheta2 / (Math.pow( n1 * cosTheta1 + n2 * cosTheta2, 2 ));
      },
      //Get the fraction of power reflected from the medium
      getReflectedPower: function( n1, n2, cosTheta1, cosTheta2 ) {
        return Math.pow( (n1 * cosTheta1 - n2 * cosTheta2) / (n1 * cosTheta1 + n2 * cosTheta2), 2 );
      },
      //Add a listener that is notified after the model gets updated (by having the ray propagation scheme run again)
      addModelUpdateListener: function( listener ) {
        this.modelUpdateListeners.add( listener );
      },
      addResetListener: function( listener ) {
        this.resetListeners.add( listener );
      },
      resetAll: function() {
      this.laser.resetAll();
        PropertySet.prototype.reset.call( this );
        //this.intensityMeter.resetAll();
        // this.laserView.reset();
        /* for ( var listener in this.resetListeners ) {
         listener.apply();
         }*/
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

