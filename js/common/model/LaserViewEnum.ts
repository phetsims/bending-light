// Copyright 2021-2023, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import bendingLight from '../../bendingLight.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
class LaserViewEnum extends EnumerationValue {
  public static readonly RAY = new LaserViewEnum();
  public static readonly WAVE = new LaserViewEnum();

  public static readonly enumeration = new Enumeration( LaserViewEnum );
}

bendingLight.register( 'LaserViewEnum', LaserViewEnum );
export default LaserViewEnum;