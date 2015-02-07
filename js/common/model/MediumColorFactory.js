// Copyright 2002-2015, University of Colorado
/**
 * For determining the colors of different mediums as a function of characteristic index of refraction.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var LinearFunction = require( 'DOT/LinearFunction' );


  var AIR_COLOR = new Color( 255, 255, 255 );
  var WATER_COLOR = new Color( 198, 226, 246 );
  var GLASS_COLOR = new Color( 171, 169, 212 );
  var DIAMOND_COLOR = new Color( 78, 79, 164 );

  function MediumColorFactory() {

  }

  return inherit( Object, MediumColorFactory, {

      //Maps index of refraction to color using linear functions
      getColor: function( indexForRed ) {
        //Precompute to improve readability below
        var waterIndexForRed = BendingLightModel.WATER.getIndexOfRefractionForRedLight();
        var glassIndexForRed = BendingLightModel.GLASS.getIndexOfRefractionForRedLight();
        var diamondIndexForRed = BendingLightModel.DIAMOND.getIndexOfRefractionForRedLight();
        //Find out what region the index of refraction lies in, and linearly interpolate between adjacent medium colors
        if ( indexForRed < waterIndexForRed ) {
          var linearFunction = new LinearFunction( 1.0, waterIndexForRed, 0, 1 );
          var ratio = linearFunction( indexForRed );
          return this.colorBlend( AIR_COLOR, WATER_COLOR, ratio );
        }
        else {
          if ( indexForRed < glassIndexForRed ) {
            var linearFunction = new LinearFunction( waterIndexForRed, glassIndexForRed, 0, 1 );
            var ratio = linearFunction( indexForRed );
            return this.colorBlend( WATER_COLOR, GLASS_COLOR, ratio );
          }
          else {
            if ( indexForRed < diamondIndexForRed ) {
              var linearFunction = new LinearFunction( glassIndexForRed, diamondIndexForRed, 0, 1 );
              var ratio = linearFunction( indexForRed );
              return this.colorBlend( GLASS_COLOR, DIAMOND_COLOR, ratio );
            }
            else {
              return DIAMOND_COLOR;
            }
          }
        }
      },
      //Blend colors a and b with the specified amount of "b" to use between 0 and 1

      colorBlend: function( a, b, ratio ) {
        return new Color( this.clamp( ((a.getRed()) * (1 - ratio) + (b.getRed()) * ratio) ), this.clamp( ((a.getGreen()) * (1 - ratio) + (b.getGreen()) * ratio) ), this.clamp( ((a.getBlue()) * (1 - ratio) + (b.getBlue()) * ratio) ), this.clamp( ((a.getAlpha()) * (1 - ratio) + (b.getAlpha()) * ratio) ) );
      },
      //Make sure light doesn't go outside of the 0..255 bounds

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
    },
    //statics
    {
      AIR_COLOR: AIR_COLOR,
      WATER_COLOR: WATER_COLOR,
      GLASS_COLOR: GLASS_COLOR,
      DIAMOND_COLOR: DIAMOND_COLOR
    } );
} );