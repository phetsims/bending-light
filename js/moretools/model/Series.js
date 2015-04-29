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
  var Shape = require( 'KITE/Shape' );
  var DataPoint = require( 'BENDING_LIGHT/moretools/model/DataPoint' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Property} path
   * @param {Color} color
   * @constructor
   */
  function Series( path, color ) {

    this.pathProperty = path;
    this.color = color;
  }

  return inherit( Object, Series, {
    getColor: function() {
      return this.color;
    },
    /**
     *
     * @param {number} time
     * @param {number} value
     */
    addPoint: function( time, value ) {
      this.pathProperty.set( this.pathProperty.get().push( new DataPoint( time, value ) ) );
    },
    /**
     * Create a GeneralPath from the series
     *
     * @returns {Path}
     */
    toShape: function() {
      var generalPath = new Shape();
      var moved = false;

      //Lift the pen off the paper for None values
      this.pathProperty.get().forEach( function( value ) {
        var point = new Vector2();
        if ( value ) {
          var dataPoint = value;
          point.x = dataPoint.time;
          point.y = dataPoint.value;
          if ( !moved ) {
            generalPath.moveToPoint( point );
            moved = true;
          }
          else {
            generalPath.lineToPoint( point );
          }
        }
      } );
      return generalPath;
    },

    /**
     * Discard early samples that have gone out of range
     *
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