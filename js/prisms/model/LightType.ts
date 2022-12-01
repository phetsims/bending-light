// Copyright 2021-2022, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import bendingLight from '../../bendingLight.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
class LightType extends EnumerationValue {
  public static readonly WHITE = new LightType();
  public static readonly SINGLE_COLOR = new LightType();
  public static readonly SINGLE_COLOR_5X = new LightType();
  private static readonly enumeration = new Enumeration( LightType );
}

bendingLight.register( 'LightType', LightType );
export default LightType;