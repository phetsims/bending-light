// Copyright 2002-2015, University of Colorado
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
   * @param shape
   * @param mediumState
   * @param color
   * @constructor
   */
  function Medium( shape, mediumState, color, mediumIndexOfRefraction ) {

    //immutable shape
    this.shape = shape;
    this.mediumState = mediumState;
    this.color = color;
    this.mediumIndexOfRefraction = mediumIndexOfRefraction;
  }

  return inherit( Object, Medium, {
    /**
     *
     * @param wavelength
     * @returns {*|number}
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

