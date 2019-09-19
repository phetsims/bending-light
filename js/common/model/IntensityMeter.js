// Copyright 2015-2019, University of Colorado Boulder

/**
 * Model for the intensity meter, including the position of the sensor, body, the reading values, etc.
 * When multiple rays hit the sensor, they are summed up.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );
  const Reading = require( 'BENDING_LIGHT/common/model/Reading' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  /**
   * @param {number} sensorX - sensor x position in model coordinates
   * @param {number} sensorY - sensor y position in model coordinates
   * @param {number} bodyX - body x position in model coordinates
   * @param {number} bodyY - body y position in model coordinates
   * @constructor
   */
  function IntensityMeter( sensorX, sensorY, bodyX, bodyY ) {

    this.readingProperty = new Property( Reading.MISS ); // @public, value to show on the body
    this.sensorPositionProperty = new Vector2Property( new Vector2( sensorX, sensorY ) ); // @public
    this.bodyPositionProperty = new Vector2Property( new Vector2( bodyX, bodyY ) ); // @public
    this.enabledProperty = new Property( false ); // @public, True if it is in the play area

    // @public (read-only), accumulation of readings
    this.rayReadings = [];
  }

  bendingLight.register( 'IntensityMeter', IntensityMeter );

  return inherit( Object, IntensityMeter, {

    /**
     * Restore the initial values.
     */
    reset: function() {
      this.readingProperty.reset();
      this.sensorPositionProperty.reset();
      this.bodyPositionProperty.reset();
      this.enabledProperty.reset();
      this.rayReadings.length = 0;
    },

    // Copy the model for reuse in the toolbox node.
    copy: function() {
      return new IntensityMeter(
        this.sensorPositionProperty.get().x,
        this.sensorPositionProperty.get().y,
        this.bodyPositionProperty.get().x,
        this.bodyPositionProperty.get().y
      );
    },

    /**
     * @public
     * @returns {Shape}
     */
    getSensorShape: function() {

      // fine tuned to match the given image
      var radius = 1E-6;
      return new Shape().arcPoint( this.sensorPositionProperty.get(), radius, 0, Math.PI * 2, false );
    },

    /**
     * Should be called before a model update so that values from last computation don't leak over into the next
     * summation.
     * @public
     */
    clearRayReadings: function() {
      this.rayReadings = [];
      this.readingProperty.set( Reading.MISS );
    },

    /**
     * Add a new reading to the accumulator and update the readout
     * @public
     * @param {Reading} r - intensity of the wave or MISS
     */
    addRayReading: function( r ) {
      this.rayReadings.push( r );
      this.updateReading();
    },

    /**
     * Update the body text based on the accumulated Reading values
     * @private
     */
    updateReading: function() {

      // enumerate the hits
      var hits = [];
      this.rayReadings.forEach( function( rayReading ) {
        if ( rayReading.isHit() ) {
          hits.push( rayReading );
        }
      } );

      // if not hits, say "MISS"
      if ( hits.length === 0 ) {
        this.readingProperty.set( Reading.MISS );
      }
      else {

        // otherwise, sum the intensities
        var total = 0.0;
        hits.forEach( function( hit ) {
          total += hit.value;
        } );
        this.readingProperty.set( new Reading( total ) );
      }
    }
  } );
} );