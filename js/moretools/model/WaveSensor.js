/*
// Copyright 2002-2012, University of Colorado
*/
/**
 * Sensor for wave values, reads the wave amplitude as a function of time and location.  Two probes can be used to compare values.
 *//*

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Dimension2D = require( 'java.awt.geom.Dimension2D' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );

//offset the probe so it isn't taking data by default

  //private
  var DELTA = 1;

  // static class: Probe
  var Probe =
//Model for a probe, including its position and recorded data series
    define( function( require ) {
      function Probe( x, y ) {

        //Note that mutable data structures typically shouldn't be used with Property, but we are careful not to modify the ArrayList so it is okay (would be better if Java or we provided an immutable list class)
        this.series = new Property( [] );
        this.position = new Property( new Vector2( x, y ) );
      }

      return inherit( Object, Probe, {
        translate: function( delta ) {
          position.set( position.get().plus( delta ) );
        },
        translate: function( delta ) {
          position.set( position.get().plus( delta ) );
        },
        addSample: function( sample ) {
          series.set( new ArrayList( series.get() ).withAnonymousClassBody( {
            initializer: function() {
              add( sample );
            }
          } ) );
        }
      } );
    } );
  ;
  function WaveSensor( clock, //Function for getting data from a probe at the specified point
                       probe1Value, probe2Value ) {
    //Set the relative location of the probes and body in model coordinates (SI)
    //These values for initial probe and body locations were obtained by printing out actual values at runtime, then dragging the objects to a good looking location.  This amount of precision is unnecessary, but these values were just sampled directly.
    this.probe1 = new Probe( -4.173076923076922E-7 - DELTA, 9.180769230769231E-7 - DELTA );
    this.probe2 = new Probe( -1.5440384615384618E-6 - DELTA, -1.2936538461538458E-6 - DELTA );
    this.bodyPosition = new Property( new Vector2( 4.882500000000015E-6 - DELTA, -3.1298076923077013E-6 - DELTA ) );
    //Clock to observe the passage of time
    this.clock;
    //in the play area
    this.visible = new BooleanProperty( false );
    this.clock = clock;
    //Read samples from the probes when the simulation time changes
    clock.addClockListener( new ClockAdapter().withAnonymousClassBody( {
      simulationTimeChanged: function( clockEvent ) {
        updateProbeSample( probe1, probe1Value, clock );
        updateProbeSample( probe2, probe2Value, clock );
      }
    } ) );
  }

  return inherit( Object, WaveSensor, {
//Read samples from the probes when the simulation time changes

    //private
    updateProbeSample: function( probe, probeValue, clock ) {
      //Read the value from the probe function.  May be None if not intersecting a light ray
      var value = probeValue.apply( probe.position.get() );
      if ( value.isSome() ) {
        probe.addSample( new Option.Some( new DataPoint( clock.getSimulationTime(), value.get() ) ) );
      }
      else {
        probe.addSample( new Option.None() );
      }
    },
    translateBody: function( delta ) {
      bodyPosition.set( bodyPosition.get().plus( delta ) );
    },
//Moves the sensor body and probes until the hot spot (center of one probe) is on the specified position.
    translateToHotSpot: function( position ) {
      translateAll( new Vector2( position ).minus( probe1.position.get() ) );
    },
//Translate the body and probes by the specified model delta
    translateAll: function( delta ) {
      probe1.translate( delta );
      probe2.translate( delta );
      bodyPosition.set( bodyPosition.get().plus( delta ) );
    }
  } );
} );

*/
