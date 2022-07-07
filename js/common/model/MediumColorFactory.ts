// Copyright 2015-2022, University of Colorado Boulder

/**
 * For determining the colors of different mediums as a function of characteristic index of refraction.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import { Color } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import Substance from './Substance.js';
import ColorModeEnum from './ColorModeEnum.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';

class MediumColorFactory {
  public lightTypeProperty: Property<ColorModeEnum>;
  public getColorAgainstWhite: ( indexForRed: number ) => Color;
  private getColorAgainstBlack: ( indexForRed: number ) => Color;

  public constructor() {
    this.lightTypeProperty = new EnumerationProperty( ColorModeEnum.SINGLE_COLOR );

    /**
     * Maps index of refraction to color using linear functions
     */
    this.getColorAgainstWhite = createProfile(
      new Color( 255, 255, 255 ),
      new Color( 198, 226, 246 ),
      new Color( 171, 169, 212 ),
      new Color( 78, 79, 164 )
    );

    this.getColorAgainstBlack = createProfile(
      new Color( step * 0, step * 0, step * 0 ),
      new Color( step * 1, step * 1, step * 1 ),
      new Color( step * 2, step * 2, step * 2 ),
      new Color( step * 3, step * 3, step * 3 )
    );
  }

  public getColor( indexForRed: number ): Color {
    return this.lightTypeProperty.value === ColorModeEnum.SINGLE_COLOR ?
           this.getColorAgainstWhite( indexForRed ) :
           this.getColorAgainstBlack( indexForRed );
  }
}

/**
 * Make sure light doesn't go outside of the 0..255 bounds
 */
const clamp = ( value: number ) => Utils.clamp( value, 0, 255 );

/**
 * Blend colors a and b with the specified amount of "b" to use between 0 and 1
 */
const colorBlend = ( a: Color, b: Color, ratio: number ): Color => {
  const reduction = ( 1 - ratio );
  return new Color(
    clamp( a.getRed() * reduction + b.getRed() * ratio ),
    clamp( a.getGreen() * reduction + b.getGreen() * ratio ),
    clamp( a.getBlue() * reduction + b.getBlue() * ratio ),
    clamp( a.getAlpha() * reduction + b.getAlpha() * ratio )
  );
};

const createProfile = ( AIR_COLOR: Color, WATER_COLOR: Color, GLASS_COLOR: Color, DIAMOND_COLOR: Color ) => ( indexForRed: number ) => {

  // precompute to improve readability below
  const waterIndexForRed = Substance.WATER.indexOfRefractionForRedLight;
  const glassIndexForRed = Substance.GLASS.indexOfRefractionForRedLight;
  const diamondIndexForRed = Substance.DIAMOND.indexOfRefractionForRedLight;

  // find out what region the index of refraction lies in, and linearly interpolate between adjacent medium colors
  let ratio;
  if ( indexForRed < waterIndexForRed ) {

    // Map the values between 1 and waterIndexForRed to (0,1) linearly
    ratio = Utils.linear( 1.0, waterIndexForRed, 0, 1, indexForRed );
    return colorBlend( AIR_COLOR, WATER_COLOR, ratio );
  }
  else {
    if ( indexForRed < glassIndexForRed ) {

      // Map the values between waterIndexForRed and glassIndexForRed to (0,1) linearly
      ratio = Utils.linear( waterIndexForRed, glassIndexForRed, 0, 1, indexForRed );
      return colorBlend( WATER_COLOR, GLASS_COLOR, ratio );
    }
    else {
      if ( indexForRed < diamondIndexForRed ) {

        // Map the values between glassIndexForRed and diamondIndexForRed to (0,1) linearly
        ratio = Utils.linear( glassIndexForRed, diamondIndexForRed, 0, 1, indexForRed );
        return colorBlend( GLASS_COLOR, DIAMOND_COLOR, ratio );
      }
      else {
        return DIAMOND_COLOR;
      }
    }
  }
};

// distance between adjacent colors for shades of gray against the black background
const step = 55;
bendingLight.register( 'MediumColorFactory', MediumColorFactory );

export default MediumColorFactory;