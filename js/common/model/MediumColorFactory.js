// Copyright 2002-2015, University of Colorado Boulder
/**
 * For determining the colors of different mediums as a function of characteristic index of refraction.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var LinearFunction = require( 'DOT/LinearFunction' );

  // constants
  var AIR_COLOR = new Color( 255, 255, 255 );
  var WATER_COLOR = new Color( 198, 226, 246 );
  var GLASS_COLOR = new Color( 171, 169, 212 );
  var DIAMOND_COLOR = new Color( 78, 79, 164 );


  return {

    /**
     *  Maps index of refraction to color using linear functions
     *  @public
     * @param i{number} indexForRed
     * @returns {Color}
     */
    getColor: function( indexForRed ) {

      // precompute to improve readability below
      var waterIndexForRed = BendingLightModel.WATER.getIndexOfRefractionForRedLight();
      var glassIndexForRed = BendingLightModel.GLASS.getIndexOfRefractionForRedLight();
      var diamondIndexForRed = BendingLightModel.DIAMOND.getIndexOfRefractionForRedLight();

      // find out what region the index of refraction lies in, and linearly interpolate between adjacent medium colors
      var linearFunction;
      var ratio;
      if ( indexForRed < waterIndexForRed ) {
        linearFunction = new LinearFunction( 1.0, waterIndexForRed, 0, 1 );
        ratio = linearFunction( indexForRed );
        return this.colorBlend( AIR_COLOR, WATER_COLOR, ratio );
      }
      else {
        if ( indexForRed < glassIndexForRed ) {
          linearFunction = new LinearFunction( waterIndexForRed, glassIndexForRed, 0, 1 );
          ratio = linearFunction( indexForRed );
          return this.colorBlend( WATER_COLOR, GLASS_COLOR, ratio );
        }
        else {
          if ( indexForRed < diamondIndexForRed ) {
            linearFunction = new LinearFunction( glassIndexForRed, diamondIndexForRed, 0, 1 );
            ratio = linearFunction( indexForRed );
            return this.colorBlend( GLASS_COLOR, DIAMOND_COLOR, ratio );
          }
          else {
            return DIAMOND_COLOR;
          }
        }
      }
    },
    /**
     * Blend colors a and b with the specified amount of "b" to use between 0 and 1
     * @param{Color} a
     * @param {Color}b
     * @param {number}ratio
     * @returns {Color}
     */
    colorBlend: function( a, b, ratio ) {
      return new Color( this.clamp( ((a.getRed()) * (1 - ratio) + (b.getRed()) * ratio) ), this.clamp( ((a.getGreen()) * (1 - ratio) + (b.getGreen()) * ratio) ), this.clamp( ((a.getBlue()) * (1 - ratio) + (b.getBlue()) * ratio) ), this.clamp( ((a.getAlpha()) * (1 - ratio) + (b.getAlpha()) * ratio) ) );
    },

    /**
     * Make sure light doesn't go outside of the 0..255 bounds
     * @param {number} value
     * @returns {number}
     */
    clamp: function( value ) {
      if ( value < 0 ) {
        return 0;
      }
      else if ( value > 255 ) {
        return 255;
      }
      else {
        return value;
      }
    }
  };
} );