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
        if ( value ) {
          var dataPoint = value;
          if ( !moved ) {
            generalPath.moveTo( dataPoint.time, dataPoint.value );
            moved = true;
          }
          else {
            generalPath.lineTo( dataPoint.time, dataPoint.value );
          }
        }
      } );
      return generalPath;
    },

    /**
     * Discard early samples that have gone out of range
     *
     * @param {Number} maxSampleCount
     */
    keepLastSamples: function( maxSampleCount ) {
      var endIndex = this.pathProperty.get().length;
      var startIndex = Math.max( 0, endIndex - maxSampleCount );
      this.pathProperty.set( this.pathProperty.get().slice( startIndex, endIndex ) );
    }
  } );
} );