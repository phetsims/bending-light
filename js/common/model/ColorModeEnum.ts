// Copyright 2021-2024, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import bendingLight from '../../bendingLight.js';

export default class ColorModeEnum extends EnumerationValue {
  public static readonly WHITE = new ColorModeEnum();
  public static readonly SINGLE_COLOR = new ColorModeEnum();

  private static readonly enumeration = new Enumeration( ColorModeEnum );
}

bendingLight.register( 'ColorModeEnum', ColorModeEnum );