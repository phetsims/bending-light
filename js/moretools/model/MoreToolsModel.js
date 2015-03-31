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
  var Vector2 = require( 'DOT/Vector2' );
  var WaveSensor = require( 'BENDING_LIGHT/moretools/model/WaveSensor' );

  /**
   *
   * @constructor
   */
  function MoreToolsModel() {
    //on this tab we should start with air and glass as the 2 mediums, since that has a bigger wavelength dependent bend
    IntroModel.call( this, BendingLightModel.GLASS );

    this.waveSensor = new WaveSensor( 0.04, new Vector2( 0, 0 ), new Vector2( 0, 0 ) /*waveValueGetter, waveValueGetter*/ );
  }

  return inherit( IntroModel, MoreToolsModel, {} );
} );
