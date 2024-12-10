// Copyright 2023-2024, University of Colorado Boulder

/**
 * Defines query parameters that are specific to this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import logGlobal from '../../phet-core/js/logGlobal.js';
import bendingLight from './bendingLight.js';

const BendingLightQueryParameters = QueryStringMachine.getAll( {

  /**
   * The number of steps a light ray is allowed to reflect/refract before it is considered to be lost.
   */
  maxLightRaySteps: {
    type: 'number' as const,
    defaultValue: 50
  }
} );

bendingLight.register( 'BendingLightQueryParameters', BendingLightQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.bendingLight.BendingLightQueryParameters' );

export default BendingLightQueryParameters;