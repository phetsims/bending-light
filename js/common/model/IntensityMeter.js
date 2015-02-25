// Copyright 2002-2012, University of Colorado
/**
 * Model for the intensity meter, including the position of the sensor, body, the reading values, etc.
 * When multiple rays hit the sensor, they are summed up.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );


  // strings
  var miss = require( 'string!BENDING_LIGHT/miss' );

  // constants
  var VALUE_DECIMALS = 2;

  /**
   * A single reading for the intensity meter.
   *
   * @param value
   * @constructor
   */

  function Reading( value ) {
    this.value = value;
  }

  inherit( Object, Reading, {
      getString: function() {
        if ( this.value !== '-' ) {
          return this.format( this.value );
        }
        else {
          return this.value;
        }
      },
      format: function( value ) {
        if ( value !== Reading.MISS ) {
          return value.toFixed( VALUE_DECIMALS ) + "%";
        }
      },
      isHit: function() {
        return true;
      },
      getValue: function() {
        return this.value;
      }
    },
    //statics
    {
      MISS: miss
    } );

  /**
   *
   * @param sensorX
   * @param sensorY
   * @param bodyX
   * @param bodyY
   * @constructor
   */
  function IntensityMeter( sensorX, sensorY, bodyX, bodyY ) {

    PropertySet.call( this, {
        reading: new Reading( Reading.MISS ),  //Value to show on the body
        enabled: true,  //True if it is in the play area and gathering data
        sensorPosition: new Vector2( sensorX, sensorY ),
        bodyPosition: new Vector2( bodyX, bodyY )
      }
    );

    //Accumulation of readings

    //private
    this.rayReadings = [];
    this.value = new Property( NaN ); // NaN if the meter is not reading a value
  }

  return inherit( PropertySet, IntensityMeter, {
    /**
     *
     * @param delta
     */
    translateSensor: function( delta ) {
      this.sensorPositionProperty.set( this.sensorPosition.plus( delta ) );
    },
    /**
     *
     * @param delta
     */
    translateBody: function( delta ) {
      this.bodyPositionProperty.set( this.bodyPosition.plus( delta ) );
    },
    getSensorShape: function() {
      //Fine tuned to match the given image
      var radius = 1.215E-6;
      return new Shape().circle( this.sensorPosition.x, this.sensorPosition.y, radius );
    },
    //Should be called before a model update so that values from last computation don't leak over into the next summation
    clearRayReadings: function() {
      this.rayReadings.clear();
      this.reading.set( Reading.MISS );
    },
    /**
     * Add a new reading to the accumulator and update the readout
     * @param r
     */
    addRayReading: function( r ) {
      this.rayReadings.add( r );
      this.updateReading();
    },
    //Update the body text based on the accumulated Reading values

    //private
    updateReading: function() {
      //Enumerate the hits
      var hits = [];
      /*    for ( var rayReading in this.rayReadings ) {
       if ( rayReading.isHit() ) {
       hits.add( rayReading );
       }
       }*/
      //If not hits, say "MISS"
      if ( hits.size() === 0 ) {
        this.reading.set( Reading.MISS );
      }
      else //otherwise, sum the intensities
      {
        var total = 0.0;
        /*      for ( var hit in hits ) {
         total += hit.getValue();
         }*/
        this.reading.set( new Reading( total ) );
      }
    },
    /**
     *
     * @param dimension2D
     */
    translateAll: function( dimension2D ) {
      this.translateBody( dimension2D );
      this.translateSensor( dimension2D );
    },
    resetAll: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );
} );

/*
 var MISS = new Reading().withAnonymousClassBody( {
 getString: function() {
 return BendingLightStrings.MISS;
 },
 isHit: function() {
 return false;
 */
