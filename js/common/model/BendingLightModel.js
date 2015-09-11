// Copyright 2002-2015, University of Colorado Boulder

/**
 * Main model for bending light application. Rays are recomputed whenever laser parameters changed. Each ray oscillates
 * in time, as shown in the wave view. There are model representations for several tools as well as their visibility.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var MediumState = require( 'BENDING_LIGHT/common/model/MediumState' );
  var Laser = require( 'BENDING_LIGHT/common/model/Laser' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var Util = require( 'SCENERY/util/Util' );

  // strings
  var airString = require( 'string!BENDING_LIGHT/air' );
  var waterString = require( 'string!BENDING_LIGHT/water' );
  var glassString = require( 'string!BENDING_LIGHT/glass' );
  var diamondString = require( 'string!BENDING_LIGHT/diamond' );
  var mysteryAString = require( 'string!BENDING_LIGHT/mysteryA' );
  var mysteryBString = require( 'string!BENDING_LIGHT/mysteryB' );

  // constants
  // default values
  var DEFAULT_LASER_DISTANCE_FROM_PIVOT = 9.225E-6;
  var DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = 2.419;

  // mediums that can be selected
  var AIR = new MediumState( airString, 1.000293, false, false );
  var WATER = new MediumState( waterString, 1.333, false, false );
  var GLASS = new MediumState( glassString, 1.5, false, false );
  var DIAMOND = new MediumState( diamondString, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, false, false );
  var MYSTERY_A = new MediumState( mysteryAString, DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, true, false );
  var MYSTERY_B = new MediumState( mysteryBString, 1.4, true, false );

  /**
   * Get the fraction of power reflected from the medium
   * @public
   * @param {number} n1 - index of refraction of first medium
   * @param {number} n2 - index of refraction of second medium
   * @param {number} cosTheta1 - cosine of incident angle
   * @param {number} cosTheta2 - cosine of reflected angle
   * @returns {number}
   */
  var getReflectedPower = function getReflectedPower( n1, n2, cosTheta1, cosTheta2 ) {
    return Math.pow( (n1 * cosTheta1 - n2 * cosTheta2) / (n1 * cosTheta1 + n2 * cosTheta2), 2 );
  };

  /**
   * Get the fraction of power transmitted through the medium
   * @public
   * @param {number} n1 - index of refraction of first medium
   * @param {number} n2 - index of refraction of second medium
   * @param {number} cosTheta1 - cosine of incident angle
   * @param {number} cosTheta2 - cosine of transmitted angle
   * @returns {number}
   */
  var getTransmittedPower = function getTransmittedPower( n1, n2, cosTheta1, cosTheta2 ) {
    return 4 * n1 * n2 * cosTheta1 * cosTheta2 / (Math.pow( n1 * cosTheta1 + n2 * cosTheta2, 2 ));
  };

  // a good size for the units being used in the sim; used to determine the dimensions of various model objects
  var CHARACTERISTIC_LENGTH = BendingLightConstants.WAVELENGTH_RED;

  /**
   * Main constructor for BendingLightModel, which contains all of the model logic for the entire sim screen.
   *
   * @param {number} laserAngle - laser angle in radians
   * @param {boolean} topLeftQuadrant - specifies whether laser in topLeftQuadrant
   * @param {number} laserDistanceFromPivot - distance of laser from pivot point
   * @param {Object} [properties] - additional properties to add to the property set
   * @constructor
   */
  function BendingLightModel( laserAngle, topLeftQuadrant, laserDistanceFromPivot, properties ) {

    // @public - list of rays in the model
    this.rays = new ObservableArray();

    // dimensions of the model, guaranteed to be shown in entirety on the stage
    this.modelWidth = CHARACTERISTIC_LENGTH * 62; // @public read-only
    this.modelHeight = this.modelWidth * 0.7; // @public read-only

    // if WebGL support then particles creation and propagation not need else we should create particles and propagate 
    // to render them on canvas. Check to see if WebGL was prevented by a query parameter
    var disallowWebGL = phet.chipper.getQueryParameter( 'webgl' ) === 'false';

    // The mobile WebGL implementation will work with basic WebGL support
    this.allowWebGL = Util.checkWebGLSupport() && !disallowWebGL; // @public

    PropertySet.call( this, _.extend( {
      laserView: 'ray', // @public, Whether the laser is Ray or Wave mode
      wavelength: BendingLightConstants.WAVELENGTH_RED, // @public
      isPlaying: true, // @public
      speed: 'normal', // @public
      indexOfRefraction: 1, // @public
      showNormal: true, // @public
      showAngles: false // @public
    }, properties ) );

    // @public - the laser
    this.laser = new Laser( this.wavelengthProperty, laserDistanceFromPivot, laserAngle, topLeftQuadrant );
  }

  return inherit( PropertySet, BendingLightModel, {

      /**
       * Adds a ray to the model
       * @public
       * @param {LightRay} ray - model of light ray
       */
      addRay: function( ray ) {
        this.rays.add( ray );
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
       * @override
       */
      reset: function() {
        PropertySet.prototype.reset.call( this );
        this.laser.reset();
      }
    },

    // @public statics
    {
      DEFAULT_LASER_DISTANCE_FROM_PIVOT: DEFAULT_LASER_DISTANCE_FROM_PIVOT,
      DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT: DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT,
      AIR: AIR,
      WATER: WATER,
      GLASS: GLASS,
      DIAMOND: DIAMOND,
      MYSTERY_A: MYSTERY_A,
      MYSTERY_B: MYSTERY_B,
      getReflectedPower: getReflectedPower,
      getTransmittedPower: getTransmittedPower
    } );
} );