// Copyright 2002-2015, University of Colorado Boulder

/**
 * Sensor for wave values, reads the wave amplitude as a function of time and location. Two probes can be used to
 * compare values.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var DataPoint = require( 'BENDING_LIGHT/more-tools/model/DataPoint' );

  /**
   * Model for a probe, including its position and recorded data series
   *
   * @param {number} x - x position of probe
   * @param {number} y - y position of probe
   * @constructor
   */
  function Probe( x, y ) {

    PropertySet.call( this, {
        series: [],
        position: new Vector2( x, y )
      }
    );

    // Note: Created here to reduce Vector2 allocations
    this.probePosition = new Vector2( 0, 0 );
  }

  inherit( PropertySet, Probe, {

    /**
     * Translate the probe in model
     * @public
     * @param {number} deltaX - amount of space in x direction probe to be translated
     * @param {number} deltaY - amount of space in y direction probe to be translated
     */
    translateXY: function( deltaX, deltaY ) {
      this.probePosition.x = this.position.x + deltaX;
      this.probePosition.y = this.position.y + deltaY;
      this.positionProperty.set( this.probePosition );
      this.positionProperty._notifyObservers();
    },

    /**
     * @public
     * @param {Option<DataPoint>} sample
     */
    addSample: function( sample ) {
      this.series.push( sample );
      this.seriesProperty._notifyObservers();
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
    Property.addProperty( this, 'bodyPosition', new Vector2( -0.0000172, -0.00000605 ) );

    // @public
    // in the play area
    Property.addProperty( this, 'visible', false );

    // Function for getting data from a probe at the specified point
    this.probe1Value = probe1Value;
    this.probe2Value = probe2Value;

    // Note: Created here to reduce Vector2 allocations
    this.newBodyPosition = new Vector2( 0, 0 );

  }

  return inherit( Object, WaveSensor, {

    /**
     * @public
     */
    step: function() {
      this.simulationTimeChanged();
    },

    /**
     * Read samples from the probes when the simulation time changes
     * @private
     */
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
     * Translate the body in model
     * @param {number} deltaX - distance in x direction to be dragged
     * @param {number} deltaY - distance in y direction to be dragged
     */
    translateBodyXY: function( deltaX, deltaY ) {
      this.newBodyPosition.x = this.bodyPosition.x + deltaX;
      this.newBodyPosition.y = this.bodyPosition.y + deltaY;
      this.bodyPositionProperty.set( this.newBodyPosition );
      this.bodyPositionProperty._notifyObservers();
    },

    /**
     * Translate the body and probes by the specified model delta
     * @public
     * @param {number} deltaX - distance in x direction to be dragged
     * @param {number} deltaY - distance in y direction to be dragged
     */
    translateAllXY: function( deltaX, deltaY ) {
      this.probe1.translateXY( deltaX, deltaY );
      this.probe2.translateXY( deltaX, deltaY );
      this.translateBodyXY( deltaX, deltaY );
    },

    /**
     * @public
     */
    reset: function() {
      this.bodyPositionProperty.reset();
      this.visibleProperty.reset();
      this.probe1.reset();
      this.probe2.reset();
    }
  } );
} );