// Copyright 2015-2021, University of Colorado Boulder

/**
 * Main model for bending light application. Rays are recomputed whenever laser parameters changed. Each ray oscillates
 * in time, as shown in the wave view. There are model representations for several tools as well as their visibility.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Utils from '../../../../scenery/js/util/Utils.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import Laser from './Laser.js';
import LightRay from './LightRay.js';
import MediumColorFactory from './MediumColorFactory.js';

// constants
const DEFAULT_LASER_DISTANCE_FROM_PIVOT = 9.225E-6;

// a good size for the units being used in the sim; used to determine the dimensions of various model objects
const CHARACTERISTIC_LENGTH = BendingLightConstants.WAVELENGTH_RED;

abstract class BendingLightModel {
  readonly rays: LightRay[]; // Comes from ObservableArray
  mediumColorFactory: MediumColorFactory;
  readonly modelWidth: number;
  readonly modelHeight: number;
  readonly allowWebGL: boolean;
  readonly laserViewProperty: Property;
  readonly wavelengthProperty: Property;
  readonly speedProperty: Property;
  private readonly indexOfRefractionProperty: Property;
  readonly showNormalProperty: Property;
  readonly isPlayingProperty: Property;
  readonly showAnglesProperty: Property;
  readonly laser: Laser;
  static DEFAULT_LASER_DISTANCE_FROM_PIVOT: number;
  rotationArrowAngleOffset: number | null;

  /**
   * @param {number} laserAngle - laser angle in radians
   * @param {boolean} topLeftQuadrant - specifies whether laser in topLeftQuadrant
   * @param {number} laserDistanceFromPivot - distance of laser from pivot point
   */
  constructor( laserAngle: number, topLeftQuadrant: boolean, laserDistanceFromPivot: number ) {

    // @public (read-only)- list of rays in the model
    this.rays = createObservableArray();

    // overriden in subtypes
    this.rotationArrowAngleOffset = null;

    this.mediumColorFactory = new MediumColorFactory();

    // dimensions of the model, guaranteed to be shown in entirety on the stage
    this.modelWidth = CHARACTERISTIC_LENGTH * 62; // @public (read-only)
    this.modelHeight = this.modelWidth * 0.7; // @public (read-only)

    // Check to see if WebGL was prevented by a query parameter
    this.allowWebGL = Utils.checkWebGLSupport() && phet.chipper.queryParameters.webgl; // @public (read-only)

    // @public, Whether the laser is Ray or Wave mode
    this.laserViewProperty = new Property( 'ray', {
      validValues: [ 'wave', 'ray' ]
    } );
    this.wavelengthProperty = new Property( BendingLightConstants.WAVELENGTH_RED );
    this.isPlayingProperty = new Property( true );

    // @ts-ignore
    this.speedProperty = new Property( TimeSpeed.NORMAL, {
      validValues: TimeSpeed.VALUES
    } );
    this.indexOfRefractionProperty = new Property( 1 );
    this.showNormalProperty = new Property( true );
    this.showAnglesProperty = new Property( false );

    // @public (read-only)- the laser
    this.laser = new Laser( this.wavelengthProperty, laserDistanceFromPivot, laserAngle, topLeftQuadrant );
  }

  /**
   * Adds a ray to the model
   * @public
   * @param {LightRay} ray - model of light ray
   */
  addRay( ray: LightRay ) {
    this.rays.push( ray );
  }

  /**
   * clear the model in preparation for another ray propagation update phase
   * @public
   */
  clearModel() {
    for ( let i = 0; i < this.rays.length; i++ ) {

      // @ts-ignore createObservableArray
      this.rays[ i ].particles.clear();
    }
    this.rays.length = 0;
  }

  /**
   * update the model by clearing the rays, then recreating them
   * @public
   */
  updateModel() {
    this.clearModel();
    this.propagateRays();
  }

  abstract propagateRays(): void;

  /**
   * @public
   * @override
   */
  reset() {
    this.laserViewProperty.reset();
    this.wavelengthProperty.reset();
    this.isPlayingProperty.reset();
    this.speedProperty.reset();
    this.indexOfRefractionProperty.reset();
    this.showNormalProperty.reset();
    this.showAnglesProperty.reset();
    this.laser.reset();
  }

  /**
   * Get the fraction of power reflected from the medium
   * @public
   * @param {number} n1 - index of refraction of first medium
   * @param {number} n2 - index of refraction of second medium
   * @param {number} cosTheta1 - cosine of incident angle
   * @param {number} cosTheta2 - cosine of reflected angle
   * @returns {number}
   */
  static getReflectedPower( n1: number, n2: number, cosTheta1: number, cosTheta2: number ) {
    return Math.pow( ( n1 * cosTheta1 - n2 * cosTheta2 ) / ( n1 * cosTheta1 + n2 * cosTheta2 ), 2 );
  }

  /**
   * Get the fraction of power transmitted through the medium
   * @public
   * @param {number} n1 - index of refraction of first medium
   * @param {number} n2 - index of refraction of second medium
   * @param {number} cosTheta1 - cosine of incident angle
   * @param {number} cosTheta2 - cosine of transmitted angle
   * @returns {number}
   */
  static getTransmittedPower( n1: number, n2: number, cosTheta1: number, cosTheta2: number ) {
    return 4 * n1 * n2 * cosTheta1 * cosTheta2 / ( Math.pow( n1 * cosTheta1 + n2 * cosTheta2, 2 ) );
  }
}

// @public (read-only)
BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT = DEFAULT_LASER_DISTANCE_FROM_PIVOT;

bendingLight.register( 'BendingLightModel', BendingLightModel );

export default BendingLightModel;