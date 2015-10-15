// Copyright 2002-2015, University of Colorado Boulder

/**
 * For determining the colors of different mediums as a function of characteristic index of refraction.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Property = require( 'AXON/Property' );

  /**
   * Make sure light doesn't go outside of the 0..255 bounds
   * @public
   * @param {number} value
   * @returns {number}
   */
  var clamp = function( value ) {
    if ( value < 0 ) {
      return 0;
    }
    else if ( value > 255 ) {
      return 255;
    }
    else {
      return value;
    }
  };

  /**
   * Blend colors a and b with the specified amount of "b" to use between 0 and 1
   * @public
   * @param {Color} a
   * @param {Color} b
   * @param {number} ratio
   * @returns {Color}
   */
  var colorBlend = function( a, b, ratio ) {
    var reduction = (1 - ratio);
    return new Color(
      clamp( a.getRed() * reduction + b.getRed() * ratio ),
      clamp( a.getGreen() * reduction + b.getGreen() * ratio ),
      clamp( a.getBlue() * reduction + b.getBlue() * ratio ),
      clamp( a.getAlpha() * reduction + b.getAlpha() * ratio )
    );
  };

  var createProfile = function( AIR_COLOR, WATER_COLOR, GLASS_COLOR, DIAMOND_COLOR ) {

    return function( indexForRed ) {

      // precompute to improve readability below
      var waterIndexForRed = BendingLightModel.WATER.getIndexOfRefractionForRedLight();
      var glassIndexForRed = BendingLightModel.GLASS.getIndexOfRefractionForRedLight();
      var diamondIndexForRed = BendingLightModel.DIAMOND.getIndexOfRefractionForRedLight();

      // find out what region the index of refraction lies in, and linearly interpolate between adjacent medium colors
      var linearFunction;
      var ratio;
      if ( indexForRed < waterIndexForRed ) {

        // Map the values between 1 and waterIndexForRed to (0,1) linearly
        linearFunction = new LinearFunction( 1.0, waterIndexForRed, 0, 1 );

        // returns the value between 0 to 1.
        ratio = linearFunction( indexForRed );
        return colorBlend( AIR_COLOR, WATER_COLOR, ratio );
      }
      else {
        if ( indexForRed < glassIndexForRed ) {

          // Map the values between waterIndexForRed and glassIndexForRed to (0,1) linearly
          linearFunction = new LinearFunction( waterIndexForRed, glassIndexForRed, 0, 1 );

          // returns the value between 0 to 1.
          ratio = linearFunction( indexForRed );
          return colorBlend( WATER_COLOR, GLASS_COLOR, ratio );
        }
        else {
          if ( indexForRed < diamondIndexForRed ) {

            // Map the values between glassIndexForRed and diamondIndexForRed to (0,1) linearly
            linearFunction = new LinearFunction( glassIndexForRed, diamondIndexForRed, 0, 1 );

            // returns the value between 0 to 1.
            ratio = linearFunction( indexForRed );
            return colorBlend( GLASS_COLOR, DIAMOND_COLOR, ratio );
          }
          else {
            return DIAMOND_COLOR;
          }
        }
      }
    };
  };

  // distance between adjacent colors for shades of gray against the black background
  var step = 55;

  return {

    /**
     * Maps index of refraction to color using linear functions
     * @public
     * @param {number} indexForRed
     * @returns {Color}
     */
    getColorAgainstWhite: createProfile(
      new Color( 255, 255, 255 ),
      new Color( 198, 226, 246 ),
      new Color( 171, 169, 212 ),
      new Color( 78, 79, 164 )
    ),
    getColorAgainstBlack: createProfile(
      new Color( step * 0, step * 0, step * 0 ),
      new Color( step * 1, step * 1, step * 1 ),
      new Color( step * 2, step * 2, step * 2 ),
      new Color( step * 3, step * 3, step * 3 )
    ),

    lightTypeProperty: new Property( 'singleColor' ), // could also be 'white'
    getColor: function( indexForRed ) {
      return this.lightTypeProperty.value === 'singleColor' ?
             this.getColorAgainstWhite( indexForRed ) :
             this.getColorAgainstBlack( indexForRed );
    }
  };
} );