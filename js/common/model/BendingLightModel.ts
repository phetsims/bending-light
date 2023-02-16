// Copyright 2015-2023, University of Colorado Boulder

/**
 * Main model for bending light application. Rays are recomputed whenever laser parameters changed. Each ray oscillates
 * in time, as shown in the wave view. There are model representations for several tools as well as their visibility.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import { Utils } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import Laser from './Laser.js';
import LightRay from './LightRay.js';
import MediumColorFactory from './MediumColorFactory.js';
import LaserViewEnum from './LaserViewEnum.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import TModel from '../../../../joist/js/TModel.js';

// constants
const DEFAULT_LASER_DISTANCE_FROM_PIVOT = 9.225E-6;

// a good size for the units being used in the sim; used to determine the dimensions of various model objects
const CHARACTERISTIC_LENGTH = BendingLightConstants.WAVELENGTH_RED;

abstract class BendingLightModel implements TModel {
  public readonly rays: ObservableArray<LightRay>;
  public mediumColorFactory: MediumColorFactory;
  protected readonly modelWidth: number;
  public readonly modelHeight: number;
  public readonly allowWebGL: boolean;
  public readonly laserViewProperty: Property<LaserViewEnum>;
  public readonly wavelengthProperty: Property<number>;
  public readonly speedProperty: EnumerationProperty<TimeSpeed>;
  private readonly indexOfRefractionProperty: Property<number>;
  public readonly showNormalProperty: Property<boolean>;
  public readonly isPlayingProperty: Property<boolean>;
  public readonly showAnglesProperty: Property<boolean>;
  public readonly laser: Laser;
  public rotationArrowAngleOffset: number | null;

  public static readonly DEFAULT_LASER_DISTANCE_FROM_PIVOT: number = DEFAULT_LASER_DISTANCE_FROM_PIVOT;

  /**
   * @param laserAngle - laser angle in radians
   * @param topLeftQuadrant - specifies whether laser in topLeftQuadrant
   * @param laserDistanceFromPivot - distance of laser from pivot point, in view coordinates
   * @param tandem
   */
  public constructor( laserAngle: number, topLeftQuadrant: boolean, laserDistanceFromPivot: number, tandem: Tandem ) {

    // (read-only)- list of rays in the model
    this.rays = createObservableArray();

    // overridden in subtypes
    this.rotationArrowAngleOffset = null;

    this.mediumColorFactory = new MediumColorFactory();

    // dimensions of the model, guaranteed to be shown in entirety on the stage
    this.modelWidth = CHARACTERISTIC_LENGTH * 62;
    this.modelHeight = this.modelWidth * 0.7;

    // Check to see if WebGL was prevented by a query parameter
    this.allowWebGL = Utils.checkWebGLSupport() && phet.chipper.queryParameters.webgl; // (read-only)

    // Whether the laser is Ray or Wave mode
    this.laserViewProperty = new EnumerationProperty( LaserViewEnum.RAY );

    this.wavelengthProperty = new NumberProperty( BendingLightConstants.WAVELENGTH_RED, {
      tandem: tandem.createTandem( 'wavelengthProperty' ),
      range: new Range( BendingLightConstants.LASER_MIN_WAVELENGTH * 1E-9, BendingLightConstants.LASER_MAX_WAVELENGTH * 1E-9 )
    } );
    this.isPlayingProperty = new BooleanProperty( true );
    this.speedProperty = new EnumerationProperty( TimeSpeed.NORMAL );
    this.indexOfRefractionProperty = new Property( 1 );
    this.showNormalProperty = new BooleanProperty( true );
    this.showAnglesProperty = new BooleanProperty( false );

    // (read-only)- the laser
    this.laser = new Laser( this.wavelengthProperty, laserDistanceFromPivot, laserAngle, topLeftQuadrant );
  }

  // Adds a ray to the model
  public addRay( ray: LightRay ): void {
    this.rays.push( ray );
  }

  // Clear the model in preparation for another ray propagation update phase
  private clearModel(): void {
    for ( let i = 0; i < this.rays.length; i++ ) {
      this.rays[ i ].particles.clear();
    }
    this.rays.length = 0;
  }

  // Update the model by clearing the rays, then recreating them
  public updateModel(): void {
    this.clearModel();
    this.propagateRays();
  }

  protected abstract propagateRays(): void;

  public reset(): void {
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
   * @param n1 - index of refraction of first medium
   * @param n2 - index of refraction of second medium
   * @param cosTheta1 - cosine of incident angle
   * @param cosTheta2 - cosine of reflected angle
   */
  public static getReflectedPower( n1: number, n2: number, cosTheta1: number, cosTheta2: number ): number {
    return Math.pow( ( n1 * cosTheta1 - n2 * cosTheta2 ) / ( n1 * cosTheta1 + n2 * cosTheta2 ), 2 );
  }

  /**
   * Get the fraction of power transmitted through the medium
   * @param n1 - index of refraction of first medium
   * @param n2 - index of refraction of second medium
   * @param cosTheta1 - cosine of incident angle
   * @param cosTheta2 - cosine of transmitted angle
   */
  public static getTransmittedPower( n1: number, n2: number, cosTheta1: number, cosTheta2: number ): number {
    return 4 * n1 * n2 * cosTheta1 * cosTheta2 / ( Math.pow( n1 * cosTheta1 + n2 * cosTheta2, 2 ) );
  }
}

bendingLight.register( 'BendingLightModel', BendingLightModel );

export default BendingLightModel;