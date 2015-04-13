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
  var Shape = require( 'KITE/Shape' );
  var Reading = require( 'BENDING_LIGHT/common/model/Reading' );

  /**
   *
   * @param {Number} sensorX
   * @param {Number} sensorY
   * @param {Number} bodyX
   * @param {Number} bodyY
   * @constructor
   */
  function IntensityMeter( sensorX, sensorY, bodyX, bodyY ) {

    PropertySet.call( this, {
        reading: Reading.MISS,  //Value to show on the body
        enabled: true,  //True if it is in the play area and gathering data
        sensorPosition: new Vector2( sensorX, sensorY ),
        bodyPosition: new Vector2( bodyX, bodyY )
      }
    );

    //Accumulation of readings
    this.rayReadings = [];
  }

  return inherit( PropertySet, IntensityMeter, {
      /**
       *
       * @param {Vector2}delta
       */
      translateSensor: function( delta ) {
        this.sensorPositionProperty.set( this.sensorPosition.plus( delta ) );
      },
      /**
       *
       * @param {Vector2}delta
       */
      translateBody: function( delta ) {
        this.bodyPositionProperty.set( this.bodyPosition.plus( delta ) );
      },
      getSensorShape: function() {
        //Fine tuned to match the given image
        var radius = 1.215E-6;
        return new Shape().circle( this.sensorPosition.x, this.sensorPosition.y, radius );
      },
      /**
       * Should be called before a model update so that values from last computation
       * don't leak over into the next summation
       */
      clearRayReadings: function() {
        this.rayReadings = [];
        this.readingProperty.set( Reading.MISS );
      },
      /**
       * Add a new reading to the accumulator and update the readout
       * @param r
       */
      addRayReading: function( r ) {
        this.rayReadings.push( r );
        this.updateReading();
      },
      /**
       * Update the body text based on the accumulated Reading values
       */
      updateReading: function() {
        //Enumerate the hits
        var hits = [];
        this.rayReadings.forEach( function( rayReading ) {
          if ( rayReading.isHit() ) {
            hits.push( rayReading );
          }
        } );

        //If not hits, say "MISS"
        if ( hits.length === 0 ) {
          this.readingProperty.set( Reading.MISS );
        }
        else //otherwise, sum the intensities
        {
          var total = 0.0;
          hits.forEach( function( hit ) {
            total += hit.getValue();
          } );
          this.readingProperty.set( new Reading( total ) );
        }
      },
      /**
       *
       * @param {Vector2} dimension2D
       */
      translateAll: function( dimension2D ) {
        this.translateBody( dimension2D );
        this.translateSensor( dimension2D );
      },
      resetAll: function() {
        PropertySet.prototype.reset.call( this );
      }
    },
    {
      Reading: Reading
    } );
} );

