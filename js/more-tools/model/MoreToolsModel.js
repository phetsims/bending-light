// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model for the "more tools" screen, which adds a wave sensor and a velocity sensor.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var WaveSensor = require( 'BENDING_LIGHT/more-tools/model/WaveSensor' );
  var VelocitySensor = require( 'BENDING_LIGHT/more-tools/model/VelocitySensor' );
  var Property = require( 'AXON/Property' );

  /**
   * @constructor
   */
  function MoreToolsModel() {

    var moreToolsModel = this;

    // On this tab we should start with air and glass as the 2 mediums, since that has a bigger wavelength dependent
    // bend
    IntroModel.call( this, BendingLightModel.GLASS, false );

    // @public
    this.velocitySensor = new VelocitySensor();
    var waveValueGetter = function( position ) {
      return moreToolsModel.getWaveValue( position );
    };

    // @public
    this.waveSensor = new WaveSensor( waveValueGetter, waveValueGetter );

    // Update the velocity sensor value when anything relevant in the model changes
    Property.multilink( [
      this.laserViewProperty,
      this.laser.onProperty,
      this.velocitySensor.positionProperty,
      this.intensityMeter.sensorPositionProperty,
      this.topMediumProperty,
      this.bottomMediumProperty,
      this.laser.emissionPointProperty
    ], function() {
      moreToolsModel.velocitySensor.valueProperty.set(
        moreToolsModel.getVelocity( moreToolsModel.velocitySensor.position ) );
    } );
  }

  return inherit( IntroModel, MoreToolsModel, {
    reset: function() {
      IntroModel.prototype.reset.call( this );
      this.velocitySensor.reset();
    }
  } );
} );
