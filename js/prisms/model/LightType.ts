// Copyright 2021, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
const LightTypeValues = [ 'white', 'singleColor', 'singleColor5x' ] as const;
type LightType = typeof LightTypeValues[ number ];
export { LightTypeValues };
export default LightType;