// Copyright 2002-2011, University of Colorado
/**
 * Enum type pattern for the laser color, which may be white or a specific wavelength.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  var Color = require( 'SCENERY/Util/Color' );

  /**
   *
   * @constructor
   */
  function LaserColor() {

  }

//White light appears gray against a white background
  /*  var WHITE_LIGHT = new LaserColor().withAnonymousClassBody( {
   getWavelength: function() {
   return BendingLightModel.WAVELENGTH_RED;
   },
   getColor: function() {
   return Color.gray;
   }
   });*/

  // static class: OneColor
  //var OneColor = define( function( require ) {
   /* function OneColor( wavelength ) {
      this.wavelength = wavelength;
    }

    return inherit( LaserColor, OneColor, {

    } );*/
  //} );

  return inherit( Object, LaserColor, {
   /*   // Determine the wavelength (in nm) of the light
      getWavelength: function() {
        return BendingLightModel.WAVELENGTH_RED;
      },
      // Determine the color of the light.
      getColor: function() {
        return Color.gray;
      },*/
      getColor: function(wavelength) {
        this.wavelength=wavelength?wavelength:650E-9;
        return new VisibleColor.wavelengthToColor(   this.wavelength * 1E9 );//convert to nanometers
      },
      getWavelength: function() {
        return this.wavelength;
      }
    },
    // statics
    {
      //WHITE_LIGHT: WHITE_LIGHT
    } );
} );

