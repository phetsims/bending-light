// Copyright 2002-2015, University of Colorado Boulder

/**
 * Series of data points to be shown in the wave sensor chart.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );

  /**
   *
   * @param {Property.<[]>} pathProperty - path of series
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
     * Discard early samples that have gone out of range
     * @public
     * @param {number} minTime - minimum time to be displayed on chart node
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