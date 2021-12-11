// Copyright 2021, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
const LaserViewEnumValues = [ 'ray', 'wave' ] as const;
type LaserViewEnum = typeof LaserViewEnumValues[number];
export default LaserViewEnum;
export { LaserViewEnumValues };