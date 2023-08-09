// Copyright 2021-2023, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import bendingLight from '../../bendingLight.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
class ColorModeEnum extends EnumerationValue {
  public static readonly WHITE = new ColorModeEnum();
  public static readonly SINGLE_COLOR = new ColorModeEnum();

  public static readonly enumeration = new Enumeration( ColorModeEnum );
}

bendingLight.register( 'ColorModeEnum', ColorModeEnum );
export default ColorModeEnum;