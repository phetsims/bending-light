// Copyright 2015-2023, University of Colorado Boulder

/**
 * Model for the "prisms" screen, in which the user can move the laser and many prisms.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Ray2 from '../../../../dot/js/Ray2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import { Color, NodeOptions } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import BendingLightModel from '../../common/model/BendingLightModel.js';
import LightRay from '../../common/model/LightRay.js';
import Medium from '../../common/model/Medium.js';
import MediumColorFactory from '../../common/model/MediumColorFactory.js';
import Substance from '../../common/model/Substance.js';
import BendingLightCircle from './BendingLightCircle.js';
import ColoredRay from './ColoredRay.js';
import Intersection from './Intersection.js';
import Polygon from './Polygon.js';
import Prism from './Prism.js';
import SemiCircle from './SemiCircle.js';
import ColorModeEnum from '../../common/model/ColorModeEnum.js';
import Multilink from '../../../../axon/js/Multilink.js';

// constants
const WAVELENGTH_RED = BendingLightConstants.WAVELENGTH_RED;
const CHARACTERISTIC_LENGTH = WAVELENGTH_RED;

class PrismsModel extends BendingLightModel {
  public readonly prisms: ObservableArray<Prism>;
  public readonly intersections: ObservableArray<Intersection>;
  public readonly manyRaysProperty: Property<number>;
  public readonly showReflectionsProperty: Property<boolean>;
  public readonly showNormalsProperty: Property<boolean>;
  public readonly showProtractorProperty: Property<boolean>;
  public readonly environmentMediumProperty: Property<Medium>;
  public readonly prismMediumProperty: Property<Medium>;
  public readonly intersectionStrokeProperty: Property<string>;
  public dirty: boolean;

  public constructor( providedOptions?: NodeOptions ) {

    super( Math.PI, false, 1E-16, providedOptions!.tandem! );

    this.prisms = createObservableArray(); // (read-only)

    // (read-only) - List of intersections, which can be shown graphically
    this.intersections = createObservableArray();

    this.mediumColorFactory = new MediumColorFactory();

    // Show multiple beams to help show how lenses work
    this.manyRaysProperty = new Property( 1 );

    // If false, will hide non TIR reflections
    this.showReflectionsProperty = new BooleanProperty( false );
    this.showNormalsProperty = new BooleanProperty( false );
    this.showProtractorProperty = new BooleanProperty( false );

    // Environment the laser is in
    this.environmentMediumProperty = new Property( new Medium( Shape.rect( -1, 0, 2, 1 ), Substance.AIR, this.mediumColorFactory.getColor( Substance.AIR.indexOfRefractionForRedLight ) ), {
      hasListenerOrderDependencies: true, // TODO: https://github.com/phetsims/bending-light/issues/414

      // See https://github.com/phetsims/bending-light/issues/378
      reentrant: true
    } );

    // Material that comprises the prisms
    this.prismMediumProperty = new Property( new Medium( Shape.rect( -1, -1, 2, 1 ), Substance.GLASS, this.mediumColorFactory.getColor( Substance.GLASS.indexOfRefractionForRedLight ) ), {
      hasListenerOrderDependencies: true, // TODO: https://github.com/phetsims/bending-light/issues/414

      // See https://github.com/phetsims/bending-light/issues/378
      reentrant: true
    } );

    this.intersectionStrokeProperty = new Property( 'black' );
    this.laser.colorModeProperty.link( colorMode => {
      this.intersectionStrokeProperty.value = colorMode === ColorModeEnum.WHITE ? 'white' : 'black';
    } );
    Multilink.multilink( [
      this.manyRaysProperty,
      this.environmentMediumProperty,
      this.showReflectionsProperty,
      this.prismMediumProperty,
      this.laser.onProperty,
      this.laser.pivotProperty,
      this.laser.emissionPointProperty,
      this.showNormalsProperty,
      this.laser.colorModeProperty,
      this.laser.colorProperty,
      this.laserViewProperty
    ], () => {
      this.clear();
      this.updateModel();
      this.dirty = true;
    } );

    // coalesce repeat updates so work is not duplicated in white light node.
    this.dirty = true;

    this.rotationArrowAngleOffset = 0;
  }

  public override reset(): void {
    super.reset();
    this.prisms.clear();
    this.manyRaysProperty.reset();
    this.environmentMediumProperty.reset();
    this.prismMediumProperty.reset();
    this.showReflectionsProperty.reset();
    this.showNormalsProperty.reset();
    this.showProtractorProperty.reset();
  }

  /**
   * List of prism prototypes that can be created in the sim
   */
  public getPrismPrototypes(): Prism[] {
    const prismsTypes = [];

    // characteristic length scale
    const a = CHARACTERISTIC_LENGTH * 10;

    // triangle, attach at bottom right
    prismsTypes.push( new Prism( new Polygon( 1, [
      new Vector2( -a / 2, -a / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( a / 2, -a / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0, a / Math.sqrt( 3 ) )
    ], 0 ), 'triangle' ) );

    // trapezoid, attach at bottom right
    prismsTypes.push( new Prism( new Polygon( 1, [
      new Vector2( -a / 2, -a * Math.sqrt( 3 ) / 4 ),
      new Vector2( a / 2, -a * Math.sqrt( 3 ) / 4 ),
      new Vector2( a / 4, a * Math.sqrt( 3 ) / 4 ),
      new Vector2( -a / 4, a * Math.sqrt( 3 ) / 4 )
    ], 0 ), 'trapezoid' ) );

    // attach at bottom right
    prismsTypes.push( new Prism( new Polygon( 2, [
      new Vector2( -a / 2, a / 2 ),
      new Vector2( a / 2, a / 2 ),
      new Vector2( a / 2, -a / 2 ),
      new Vector2( -a / 2, -a / 2 )
    ], 0 ), 'square' ) );

    const radius = a / 2;

    // Continuous Circle
    prismsTypes.push( new Prism( new BendingLightCircle( new Vector2( 0, 0 ), radius ), 'circle' ) );

    // SemiCircle
    prismsTypes.push( new Prism( new SemiCircle( 1, [
      new Vector2( 0, radius ),
      new Vector2( 0, -radius )
    ], radius ), 'semicircle' ) );

    // DivergingLens
    prismsTypes.push( new Prism( new Polygon( 2, [
      new Vector2( -0.6 * radius, radius ),
      new Vector2( 0.6 * radius, radius ),
      new Vector2( 0.6 * radius, -radius ),
      new Vector2( -0.6 * radius, -radius )
    ], radius ), 'diverging-lens' ) );
    return prismsTypes;
  }

  /**
   * Adds a prism to the model.
   */
  public addPrism( prism: Prism ): void {
    this.prisms.add( prism );
  }

  /**
   * Removes a prism from the model
   */
  public removePrism( prism: Prism ): void {
    this.prisms.remove( prism );
    this.updateModel();
  }

  /**
   * Determines whether white light or single color light
   * @param ray - tail and direction for light
   * @param power - amount of power this light has
   * @param laserInPrism - specifies whether laser in prism
   */
  private propagate( ray: Ray2, power: number, laserInPrism: boolean ): void {

    // Determines whether to use white light or single color light
    let mediumIndexOfRefraction;
    if ( this.laser.colorModeProperty.value === ColorModeEnum.WHITE ) {
      // This number is the number of (equally spaced wavelength) rays to show in a white beam. More rays looks
      // better but is more computationally intensive.
      const wavelengths = BendingLightConstants.WHITE_LIGHT_WAVELENGTHS;

      for ( let i = 0; i < wavelengths.length; i++ ) {
        const wavelength = wavelengths[ i ] / 1E9; // convert to meters
        mediumIndexOfRefraction = laserInPrism ?
                                  this.prismMediumProperty.value.getIndexOfRefraction( wavelength ) :
                                  this.environmentMediumProperty.value.getIndexOfRefraction( wavelength );

        // show the intersection for the smallest and largest wavelengths.  Protect against floating point error for
        // the latter
        const showIntersection = ( i === 0 ) || ( i === wavelengths.length - 1 );
        this.propagateTheRay( new ColoredRay( ray, power, wavelength, mediumIndexOfRefraction,
          BendingLightConstants.SPEED_OF_LIGHT / wavelength ), 0, showIntersection );
      }
    }
    else {
      mediumIndexOfRefraction = laserInPrism ?
                                this.prismMediumProperty.value.getIndexOfRefraction( this.laser.getWavelength() ) :
                                this.environmentMediumProperty.value.getIndexOfRefraction( this.laser.getWavelength() );
      this.propagateTheRay( new ColoredRay( ray, power, this.laser.getWavelength(),
        mediumIndexOfRefraction, this.laser.getFrequency() ), 0, true );
    }
  }

  /**
   * Algorithm that computes the trajectories of the rays throughout the system
   */
  public propagateRays(): void {

    if ( this.laser.onProperty.value ) {
      const tail = this.laser.emissionPointProperty.value;
      const laserInPrism = this.isLaserInPrism();
      const directionUnitVector = this.laser.getDirectionUnitVector();
      if ( this.manyRaysProperty.value === 1 ) {

        // This can be used to show the main central ray
        this.propagate( new Ray2( tail, directionUnitVector ), 1.0, laserInPrism );
      }
      else {

        // Many parallel rays
        for ( let x = -WAVELENGTH_RED; x <= WAVELENGTH_RED * 1.1; x += WAVELENGTH_RED / 2 ) {
          const offset = directionUnitVector.rotated( Math.PI / 2 ).multiplyScalar( x );
          this.propagate( new Ray2( offset.add( tail ), directionUnitVector ), 1.0, laserInPrism );
        }
      }
    }
  }

  /**
   * Determine if the laser beam originates within a prism for purpose of determining what index of refraction to use
   * initially
   */
  private isLaserInPrism(): boolean {
    const emissionPoint = this.laser.emissionPointProperty.value;
    for ( let i = 0; i < this.prisms.length; i++ ) {
      if ( this.prisms[ i ].contains( emissionPoint ) ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Recursive algorithm to compute the pattern of rays in the system. This is the main computation of this model,
   * rays are cleared beforehand and this algorithm adds them as it goes
   * @param incidentRay - model of the ray
   * @param count - number of rays
   * @param showIntersection - true if the intersection should be shown.  True for single rays and for
   *                                     extrema of white light wavelengths
   */
  private propagateTheRay( incidentRay: ColoredRay, count: number, showIntersection: boolean ): void {
    let rayColor;
    let rayVisibleColor;
    const waveWidth = CHARACTERISTIC_LENGTH * 5;

    // Termination condition: we have reached too many iterations or if the ray is very weak
    if ( count > 50 || incidentRay.power < 0.001 ) {
      return;
    }

    // Check for an intersection
    const intersection = this.getIntersection( incidentRay, this.prisms );
    const L = incidentRay.directionUnitVector;
    const n1 = incidentRay.mediumIndexOfRefraction;
    const wavelengthInN1 = incidentRay.wavelength / n1;
    if ( intersection !== null ) {

      // List the intersection in the model
      if ( showIntersection ) {
        this.intersections.add( intersection );
      }

      const pointOnOtherSide = ( incidentRay.directionUnitVector.times( 1E-12 ) ).add( intersection.point );
      let outputInsidePrism = false;
      const lightRayAfterIntersectionInRay2Form = new Ray2( pointOnOtherSide, incidentRay.directionUnitVector );
      this.prisms.forEach( ( prism: Prism ) => {
        const intersection = prism.getTranslatedShape().shape.intersection( lightRayAfterIntersectionInRay2Form );
        if ( intersection.length % 2 === 1 ) {
          outputInsidePrism = true;
        }
      } );

      // Index of refraction of the other medium
      const n2 = outputInsidePrism ?
                 this.prismMediumProperty.value.getIndexOfRefraction( incidentRay.getBaseWavelength() ) :
                 this.environmentMediumProperty.value.getIndexOfRefraction( incidentRay.getBaseWavelength() );

      // Precompute for readability
      const point = intersection.point;
      const n = intersection.unitNormal;

      // Compute the output rays, see http://en.wikipedia.org/wiki/Snell's_law#Vector_form
      const cosTheta1 = n.dotXY( L.x * -1, L.y * -1 );
      const cosTheta2Radicand = 1 - Math.pow( n1 / n2, 2 ) * ( 1 - Math.pow( cosTheta1, 2 ) );
      const totalInternalReflection = cosTheta2Radicand < 0;
      const cosTheta2 = Math.sqrt( Math.abs( cosTheta2Radicand ) );
      const vReflect = ( n.times( 2 * cosTheta1 ) ).add( L );
      let vRefract = cosTheta1 > 0 ?
                     ( L.times( n1 / n2 ) ).addXY(
                       n.x * ( n1 / n2 * cosTheta1 - cosTheta2 ),
                       n.y * ( n1 / n2 * cosTheta1 - cosTheta2 )
                     ) :
                     ( L.times( n1 / n2 ) ).addXY(
                       n.x * ( n1 / n2 * cosTheta1 + cosTheta2 ),
                       n.y * ( n1 / n2 * cosTheta1 + cosTheta2 )
                     );

      // Normalize the direction vector, see https://github.com/phetsims/bending-light/issues/226
      vRefract = vRefract.normalized();

      const reflectedPower = totalInternalReflection ? 1
                                                     : Utils.clamp( BendingLightModel.getReflectedPower( n1, n2, cosTheta1, cosTheta2 ), 0, 1 );
      const transmittedPower = totalInternalReflection ? 0
                                                       : Utils.clamp( BendingLightModel.getTransmittedPower( n1, n2, cosTheta1, cosTheta2 ), 0, 1 );

      // Create the new rays and propagate them recursively
      const reflectedRay = new Ray2( incidentRay.directionUnitVector.times( -1E-12 ).add( point ), vReflect );
      const reflected = new ColoredRay(
        reflectedRay,
        incidentRay.power * reflectedPower,
        incidentRay.wavelength,
        incidentRay.mediumIndexOfRefraction,
        incidentRay.frequency
      );
      const refractedRay = new Ray2( incidentRay.directionUnitVector.times( +1E-12 ).add( point ), vRefract );
      const refracted = new ColoredRay(
        refractedRay,
        incidentRay.power * transmittedPower,
        incidentRay.wavelength,
        n2,
        incidentRay.frequency
      );
      if ( this.showReflectionsProperty.value || totalInternalReflection ) {
        this.propagateTheRay( reflected, count + 1, showIntersection );
      }
      this.propagateTheRay( refracted, count + 1, showIntersection );
      rayColor = new Color( 0, 0, 0, 0 );
      rayVisibleColor = VisibleColor.wavelengthToColor( incidentRay.wavelength * 1E9 );
      rayColor.set( rayVisibleColor.getRed(), rayVisibleColor.getGreen(), rayVisibleColor.getBlue(),
        rayVisibleColor.getAlpha() );

      // Add the incident ray itself
      this.addRay( new LightRay( CHARACTERISTIC_LENGTH / 2,
        incidentRay.tail,
        intersection.point,
        n1,
        wavelengthInN1,
        incidentRay.wavelength * 1E9,
        incidentRay.power,
        rayColor,
        waveWidth,
        0,
        true,
        false,
        this.laserViewProperty.value,
        'prism'
      ) );
    }
    else {
      rayColor = new Color( 0, 0, 0, 0 );
      rayVisibleColor = VisibleColor.wavelengthToColor( incidentRay.wavelength * 1E9 );
      rayColor.set( rayVisibleColor.getRed(), rayVisibleColor.getGreen(), rayVisibleColor.getBlue(),
        rayVisibleColor.getAlpha() );

      // No intersection, so the light ray should just keep going
      this.addRay( new LightRay(
        CHARACTERISTIC_LENGTH / 2,
        incidentRay.tail,

        // If the light ray gets too long, it will cause rendering artifacts like #219
        incidentRay.tail.plus( incidentRay.directionUnitVector.times( 2E-4 ) ),
        n1,
        wavelengthInN1,
        incidentRay.wavelength * 1E9,
        incidentRay.power,
        rayColor,
        waveWidth,
        0,
        true,
        false,
        this.laserViewProperty.value,
        'prism'
      ) );
    }
  }

  /**
   * Find the nearest intersection between a light ray and the set of prisms in the play area
   * @param incidentRay - model of the ray
   * @param prisms
   * @returns - returns the intersection if one was found or null if no intersections
   */
  private getIntersection( incidentRay: ColoredRay, prisms: Prism[] ): Intersection | null {
    let allIntersections: Intersection[] = [];
    prisms.forEach( prism => {
      prism.getIntersections( incidentRay ).forEach( ( intersection: Intersection ) => allIntersections.push( intersection ) );
    } );

    // Get the closest one (which would be hit first)
    allIntersections = _.sortBy( allIntersections, allIntersection => allIntersection.point.distance( incidentRay.tail ) );
    return allIntersections.length === 0 ? null : allIntersections[ 0 ];
  }

  /**
   */
  public clear(): void {
    this.intersections.clear();
  }
}

bendingLight.register( 'PrismsModel', PrismsModel );

export default PrismsModel;