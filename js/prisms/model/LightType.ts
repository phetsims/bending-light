// Copyright 2021, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import bendingLight from '../../bendingLight.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
class LightType extends EnumerationValue {
  static WHITE = new LightType();
  static SINGLE_COLOR = new LightType();
  static SINGLE_COLOR_5X = new LightType();
  static enumeration = new Enumeration( LightType );
}

bendingLight.register( 'LightType', LightType );
export default LightType;