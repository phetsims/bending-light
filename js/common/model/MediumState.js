// Copyright 2002-2015, University of Colorado Boulder
/**
 * Immutable state for a medium, with the name and dispersion function, and flags for "mystery" and "custom".
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var DispersionFunction = require( 'BENDING_LIGHT/common/model/DispersionFunction' );

  var WAVELENGTH_RED = 650E-9;

  /**
   *
   * @param {String} name - name of the medium
   * @param {Number} indexForRed - index of refraction of medium
   * @param {Boolean}mystery - true if medium state is mystery else other state
   * @param {Boolean}custom - true if  medium state is custom else other state
   * @constructor
   */
  function MediumState( name, indexForRed, mystery, custom ) {
    this.name = name;
    this.dispersionFunction = new DispersionFunction( indexForRed, WAVELENGTH_RED );
    this.mystery = mystery;
    this.custom = custom;
  }


  return inherit( Object, MediumState, {
    /**
     *
     * @returns {String|*}
     */
    toString: function() {
      return this.name;
    },
    /**
     * @public
     * @returns {*|number|number}
     */
    getIndexOfRefractionForRedLight: function() {
      return this.dispersionFunction.getIndexOfRefraction( WAVELENGTH_RED );
    }
  } );
} );

