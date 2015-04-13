// Copyright 2002-2015, University of Colorado Boulder
/**
 * Sensor for wave values, reads the wave amplitude as a function of time and location.
 * Two probes can be used to compare values.
 * @author Chandrashekar Bemagoni (Actual Concepts)
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
   * @param {Number} x
   * @param {Number} y
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
     * @param {Vector2} delta
     */
    translate: function( delta ) {
      this.positionProperty.set( this.position.plus( delta ) );
    },
    /**
     *
     * @param {Option<DataPoint>} sample
     */
    addSample: function( sample ) {
      var seriesArray = [];
      for ( var i = 0; i < this.series.length; i++ ) {
        seriesArray[ i ] = this.series[ i ];
      }
      seriesArray.push( sample );
      this.seriesProperty.set( seriesArray );
    },
    reset: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );

  /**
   *
   * @param {function} probe1Value
   * @param {function} probe2Value
   * @constructor
   */
  function WaveSensor( probe1Value, probe2Value ) {

    //Set the relative location of the probes and body in model coordinates (SI)
    //These values for initial probe and body locations were obtained by printing out actual values at runtime,
    // then dragging the objects to a good looking location.  This amount of precision is unnecessary,
    // but these values were just sampled directly.
    this.probe1 = new Probe( -0.00002105, -0.000004 );
    this.probe2 = new Probe( -0.00002155, -0.000005 );
    this.bodyPositionProperty = new Property( new Vector2( -0.00001865, -0.000006 ) );

    //in the play area
    this.visibleProperty = new BooleanProperty( false );

    //Function for getting data from a probe at the specified point
    this.probe1Value = probe1Value;
    this.probe2Value = probe2Value;

  }

  return inherit( Object, WaveSensor, {

    step: function() {
      this.simulationTimeChanged();
    },

    simulationTimeChanged: function() {
      //Read samples from the probes when the simulation time changes
      this.updateProbeSample( this.probe1, this.probe1Value );
      this.updateProbeSample( this.probe2, this.probe2Value );
    },

    /**
     * Read samples from the probes when the simulation time changes
     *
     * @param {Probe} probe
     * @param {function} probeValue
     */
    updateProbeSample: function( probe, probeValue ) {
      //Read the value from the probe function.  May be None if not intersecting a light ray
      var value = probeValue( probe.position );
      if ( value ) {
        probe.addSample( new DataPoint( value[ 0 ], value[ 1 ] ) );
      }
      else {
        probe.addSample( null );
      }
    },
    /**
     *
     * @param {Vector2} delta
     */
    translateBody: function( delta ) {
      this.bodyPositionProperty.set( this.bodyPositionProperty.get().plus( delta ) );
    },
    /**
     * Moves the sensor body and probes until the hot spot (center of one probe) is on the specified position.
     *
     * @param {Vector2} position
     */
    translateToHotSpot: function( position ) {
      this.translateAll( new Vector2( position ).minus( this.probe1.position ) );
    },
    /**
     * Translate the body and probes by the specified model delta
     *
     * @param {Vector2} delta
     */
    translateAll: function( delta ) {
      this.probe1.translate( delta );
      this.probe2.translate( delta );
      this.bodyPositionProperty.set( this.bodyPositionProperty.get().plus( delta ) );
    },
    reset: function() {
      this.bodyPositionProperty.reset();
      this.probe1.reset();
      this.probe2.reset();
    }
  } );
} );
