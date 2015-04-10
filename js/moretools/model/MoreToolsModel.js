// Copyright 2002-2015, University of Colorado Boulder
/**
 * Model for the "more tools" screen, which adds a wave sensor and a velocity sensor.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var Vector2 = require( 'DOT/Vector2' );
  var WaveSensor = require( 'BENDING_LIGHT/moretools/model/WaveSensor' );
  var VelocitySensor = require( 'BENDING_LIGHT/moretools/model/VelocitySensor' );
  var Property = require( 'AXON/Property' );

  /**
   *
   * @constructor
   */
  function MoreToolsModel() {
    var moreToolsModel = this;
    //on this tab we should start with air and glass as the 2 mediums, since that has a bigger wavelength dependent bend
    IntroModel.call( this, BendingLightModel.GLASS );

    this.velocitySensor = new VelocitySensor( new Vector2( 0, 0 ) );
    var waveValueGetter = function( position ) {
      return moreToolsModel.getWaveValue( position );
    };

    this.waveSensor = new WaveSensor( waveValueGetter, waveValueGetter );

    //Update the velocity sensor value when anything relevant in the model changes
    Property.multilink( [
      this.laserViewProperty,
      this.laser.onProperty,
      this.velocitySensor.positionProperty,
      this.topMediumProperty,
      this.bottomMediumProperty,
      this.laser.emissionPointProperty
    ], function() {
      moreToolsModel.velocitySensor.valueProperty.set( moreToolsModel.getVelocity( moreToolsModel.velocitySensor.position ) );
    } );

  }

  return inherit( IntroModel, MoreToolsModel, {} );
} );
