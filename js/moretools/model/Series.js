/*
// Copyright 2002-2011, University of Colorado
*/
/**
 * Series of data points to be shown in the wave sensor chart.
 *
 * @author Sam Reid
 *//*

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ArrayList = require( 'java.util.ArrayList' );
  var Property = require( 'AXON/Property' );
  var Option = require( 'edu.colorado.phet.common.phetcommon.util.Option' );
  var DoubleGeneralPath = require( 'edu.colorado.phet.common.phetcommon.view.util.DoubleGeneralPath' );

  */
/**
   *
   * @param path
   * @param color
   * @constructor
   *//*

  function Series( path, color ) {
    //Each reading may be None, so represented with Option
    this.path = path;
    this.color = color;
  }

  return inherit( Object, Series, {
    getColor: function() {
      return color;
    },
    addPoint: function( time, value ) {
      path.set( new ArrayList( path.get() ).withAnonymousClassBody( {
        initializer: function() {
          add( new Option.Some( new DataPoint( time, value ) ) );
        }
      } ) );
    },
//Create a GeneralPath from the series
    toShape: function() {
      var generalPath = new DoubleGeneralPath();
      var moved = false;
      //Lift the pen off the paper for None values
      for ( var value in path.get() ) {
        if ( value.isSome() ) {
          var dataPoint = value.get();
          if ( !moved ) {
            generalPath.moveTo( dataPoint.time, dataPoint.value );
            moved = true;
          }
          else {
            generalPath.lineTo( dataPoint.time, dataPoint.value );
          }
        }
      }
      return generalPath.getGeneralPath();
    },
//Discard early samples that have gone out of range
    keepLastSamples: function( maxSampleCount ) {
      var endIndex = path.get().size();
      var startIndex = Math.max( 0, endIndex - maxSampleCount );
      path.set( new ArrayList( path.get().subList( startIndex, endIndex ) ) );
    }
  } );
} );

*/
