// Copyright 2015, University of Colorado Boulder

/**
 * Sensor for wave values, reads the wave amplitude as a function of time and location. Two probes can be used to
 * compare values.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var DataPoint = require( 'BENDING_LIGHT/more-tools/model/DataPoint' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * Model for a probe, including its position and recorded data series
   *
   * @param {number} x - x position of probe
   * @param {number} y - y position of probe
   * @constructor
   */
  function Probe( x, y ) {

    PropertySet.call( this, {
        series: [], // @public, array of data points
        position: new Vector2( x, y ) // @public, position of a probe
      }
    );
  }

  inherit( PropertySet, Probe, {

    /**
     * @public
     * @param {Option<DataPoint>} sample
     */
    addSample: function( sample ) {
      this.series.push( sample );
      this.seriesProperty.notifyObserversStatic();
    }
  } );

  /**
   * @param {function} probe1Value - function for getting data from a probe at the specified point
   * @param {function} probe2Value - function for getting data from a probe at the specified point
   * @constructor
   */
  function WaveSensor( probe1Value, probe2Value ) {

    // Set the relative location of the probes and body in model coordinates (SI). These values for initial probe and
    // body locations were obtained by printing out actual values at runtime, then dragging the objects to a good
    // looking location. This amount of precision is unnecessary, but these values were just sampled directly.
    this.probe1 = new Probe( -0.00001932, -0.0000052 );
    this.probe2 = new Probe( -0.0000198, -0.0000062 );

    PropertySet.call( this, {

      // @public
      bodyPosition: new Vector2( -0.0000172, -0.00000605 ),

      // @public
      // in the play area
      enabled: false
    } );

    // Function for getting data from a probe at the specified point
    this.probe1Value = probe1Value;
    this.probe2Value = probe2Value;
  }

  return inherit( PropertySet, WaveSensor, {

    // @public - create a copy for use in toolbox icons, etc.
    copy: function() {
      var waveSensor = new WaveSensor( 0, 0 );
      waveSensor.bodyPosition = this.bodyPosition;
      waveSensor.probe1.position = this.probe1.position;
      waveSensor.probe2.position = this.probe2.position;
      return waveSensor;
    },

    // @public
    step: function() {
      this.simulationTimeChanged();
    },

    // @private - Read samples from the probes when the simulation time changes 
    simulationTimeChanged: function() {
      this.updateProbeSample( this.probe1, this.probe1Value );
      this.updateProbeSample( this.probe2, this.probe2Value );
    },

    /**
     * Read the value from the probe function. May be None if not intersecting a light ray
     * @private
     * @param {Probe} probe
     * @param {function} probeValue - function for getting data from a probe at the specified point
     */
    updateProbeSample: function( probe, probeValue ) {

      // Read the value from the probe function. May be None if not intersecting a light ray
      var value = probeValue( probe.position );
      if ( value ) {
        probe.addSample( new DataPoint( value.time, value.magnitude ) );
      }
    },

    /**
     * @public
     */
    reset: function() {
      PropertySet.prototype.reset.call( this );
      this.probe1.reset();
      this.probe2.reset();
    }
  } );
} );