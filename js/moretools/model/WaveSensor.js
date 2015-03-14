// Copyright 2002-2015, University of Colorado
/**
 * Sensor for wave values, reads the wave amplitude as a function of time and location.  Two probes can be used to compare values.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var DataPoint = require( 'BENDING_LIGHT/moretools/model/DataPoint' );

  /**
   * Model for a probe, including its position and recorded data series
   *
   * @param x
   * @param y
   * @constructor
   */
  function Probe( x, y ) {

    PropertySet.call( this, {
        series: [],
        position: new Vector2( x, y )
      }
    );
  }

  inherit( PropertySet, Probe, {

    /**
     *
     * @param delta
     */
    translate: function( delta ) {
      this.positionProperty.set( this.position.plus( delta ) );
    },
    /**
     *
     * @param sample
     */
    addSample: function( sample ) {
      this.seriesProperty.set( this.series.push( sample ) );
    }
  } );

  /**
   *
   * @param clock  -Function for getting data from a probe at the specified point
   * @param probe1Value
   * @param probe2Value
   * @constructor
   */
  function WaveSensor( clock, probe1Value, probe2Value ) {

    //var waveSensor = this;

    //Set the relative location of the probes and body in model coordinates (SI)
    //These values for initial probe and body locations were obtained by printing out actual values at runtime,
    // then dragging the objects to a good looking location.  This amount of precision is unnecessary,
    // but these values were just sampled directly.
    this.probe1 = new Probe( -0.0000155, -0.000005 );
    this.probe2 = new Probe( -0.0000167, -0.0000075 );
    this.bodyPosition = new Property( new Vector2( -0.00001, -0.0000098 ) );
    this.visible = new BooleanProperty( false );

    //Clock to observe the passage of time
    //in the play area
    this.clock = clock;

    /*    //Read samples from the probes when the simulation time changes
     clock.addClockListener( new ClockAdapter().withAnonymousClassBody( {
     simulationTimeChanged: function( clockEvent ) {
     waveSensor.updateProbeSample( waveSensor.probe1, probe1Value, clock );
     waveSensor.updateProbeSample( waveSensor.probe2, probe2Value, clock );
     }
     } ) );*/
  }

  return inherit( Object, WaveSensor, {

    /**
     * Read samples from the probes when the simulation time changes
     *
     * @param probe
     * @param probeValue
     * @param clock
     */
    updateProbeSample: function( probe, probeValue, clock ) {
      //Read the value from the probe function.  May be None if not intersecting a light ray
      var value = probeValue( probe.position );
      if ( value ) {
        probe.addSample( new DataPoint( clock.getSimulationTime(), value.get() ) );
      }
      else {
        // probe.addSample( new Option.None() );
      }
    },
    /**
     *
     * @param delta
     */
    translateBody: function( delta ) {
      this.bodyPosition.set( this.bodyPosition.get().plus( delta ) );
    },
    /**
     * Moves the sensor body and probes until the hot spot (center of one probe) is on the specified position.
     *
     * @param position
     */
    translateToHotSpot: function( position ) {
      this.translateAll( new Vector2( position ).minus( this.probe1.position ) );
    },
    /**
     * Translate the body and probes by the specified model delta
     *
     * @param delta
     */
    translateAll: function( delta ) {
      this.probe1.translate( delta );
      this.probe2.translate( delta );
      this.bodyPosition.set( this.bodyPosition.get().plus( delta ) );
    },
    reset: function() {
      this.bodyPosition.reset();
      this.probe1.positionProperty.reset();
      this.probe2.positionProperty.reset();
    }
  } );
} );
