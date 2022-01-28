// Copyright 2021, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import bendingLight from '../../bendingLight.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
class ColorModeEnum extends EnumerationValue {
  static WHITE = new ColorModeEnum();
  static SINGLE_COLOR = new ColorModeEnum();
  static enumeration = new Enumeration( ColorModeEnum );
}

bendingLight.register( 'ColorModeEnum', ColorModeEnum );
export default ColorModeEnum;