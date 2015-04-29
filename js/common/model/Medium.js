// Copyright 2002-2015, University of Colorado Boulder
/**
 * A Medium is a substance through which LightRay instances propagate.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @param {Shape} shape
   * @param {MediumState} mediumState - state of the medium
   * @param {Color} color - color of the medium
   * @constructor
   */
  function Medium( shape, mediumState, color ) {

    //immutable shape
    this.shape = shape;
    this.mediumState = mediumState;
    this.color = color; // color is based on the index of refraction at red wavelength
  }

  return inherit( Object, Medium, {

    /**
     *
     * @public
     * @param {number} wavelength
     * @returns {number}
     */
    getIndexOfRefraction: function( wavelength ) {
      return this.mediumState.dispersionFunction.getIndexOfRefraction( wavelength );
    },
    isMystery: function() {
      return this.mediumState.mystery;
    },
    getMediumState: function() {
      return this.mediumState;
    }
  } );
} );

