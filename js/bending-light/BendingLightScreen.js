//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BendingLightModel = require( 'BENDING_LIGHT/bending-light/model/BendingLightModel' );
  var BendingLightScreenView = require( 'BENDING_LIGHT/bending-light/view/BendingLightScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var bendingLightSimString = require( 'string!BENDING_LIGHT/bending-light.name' );

  /**
   * @constructor
   */
  function BendingLightScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, bendingLightSimString, icon,
      function() { return new BendingLightModel(); },
      function( model ) { return new BendingLightScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, BendingLightScreen );
} );