// Copyright 2002-2015, University of Colorado Boulder

/**
 * Series of data points to be shown in the wave sensor chart.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );

  /**
   *
   * @param {Property<[]>} pathProperty - path of series
   * @param {Color} color - color of series
   * @constructor
   */
  function Series( pathProperty, color ) {

    this.pathProperty = pathProperty;

    // @public read-only
    this.color = color;

    // @public
    this.points = new ObservableArray();
  }

  return inherit( Object, Series, {

    /**
     * @public
     * @returns {Color}
     */
    getColor: function() {
      return this.color;
    },

    /**
     * Discard early samples that have gone out of range
     * @public
     * @param {number} minTime
     */
    keepLastSamples: function( minTime ) {
      var startIndex = 0;
      if ( this.pathProperty.get().length ) {
        while ( this.pathProperty.get()[ startIndex ] && this.pathProperty.get()[ startIndex ].time < minTime ) {
          startIndex = startIndex + 1;
        }
        this.pathProperty.set( this.pathProperty.get().slice( startIndex, this.pathProperty.get().length ) );
      }
    }
  } );
} );