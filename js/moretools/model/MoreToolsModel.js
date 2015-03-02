// Copyright 2002-2012, University of Colorado
/**
 * Model for the "more tools" tab, which adds a wave sensor and a velocity sensor.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroModel = require( 'BENDING_LIGHT/intro/model/IntroModel' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  //var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @constructor
   */
  function MoreToolsModel() {
    //on this tab we should start with air and glass as the 2 mediums, since that has a bigger wavelength dependent bend
    IntroModel.call( this, BendingLightModel.GLASS );

    /*  this.velocitySensor = new VelocitySensor();
     this.waveValueGetter = new Function1().withAnonymousClassBody( {
     apply: function( position) {
     return getWaveValue(position);
     }
     });
     this.waveSensor = new WaveSensor(getClock(), waveValueGetter, waveValueGetter);
     //on this tab we should start with air and glass as the 2 mediums, since that has a bigger wavelength dependent bend
     IntroModel.call(this, clock, GLASS);
     //Update the velocity sensor value when anything relevant in the model changes
     var updateReading = new VoidFunction0().withAnonymousClassBody( {
     apply: function() {
     velocitySensor.value.set(getVelocity(velocitySensor.position.get()));
     }
     });
     addModelUpdateListener(updateReading);
     new RichSimpleObserver().withAnonymousClassBody( {
     update: function() {
     updateReading.apply();
     }
     }).observe(velocitySensor.position, waveSensor.probe1.position, waveSensor.probe2.position);
     */
  }

  return inherit( IntroModel, MoreToolsModel, {} );
} );

