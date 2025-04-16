// Copyright 2021-2024, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import bendingLight from '../../bendingLight.js';

export default class LaserViewEnum extends EnumerationValue {
  public static readonly RAY = new LaserViewEnum();
  public static readonly WAVE = new LaserViewEnum();

  private static readonly enumeration = new Enumeration( LaserViewEnum );
}

bendingLight.register( 'LaserViewEnum', LaserViewEnum );