// Copyright 2021-2025, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import bendingLight from '../../bendingLight.js';

export default class LightType extends EnumerationValue {
  public static readonly WHITE = new LightType();
  public static readonly SINGLE_COLOR = new LightType();
  public static readonly SINGLE_COLOR_5X = new LightType();

  private static readonly enumeration = new Enumeration( LightType );
}

bendingLight.register( 'LightType', LightType );