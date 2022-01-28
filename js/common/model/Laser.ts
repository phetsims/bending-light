// Copyright 2015-2021, University of Colorado Boulder

/**
 * Model for the laser, which emits LightRays.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import LaserColor from '../view/LaserColor.js';
import ColorModeEnum from './ColorModeEnum.js';

class Laser {
  readonly topLeftQuadrant: boolean;

  // true if the laser is activated and emitting light
  readonly onProperty: Property<boolean>;
  readonly waveProperty: Property<boolean>;
  readonly colorModeProperty: EnumerationProperty<ColorModeEnum>;
  readonly emissionPointProperty: Property<Vector2>;
  readonly colorProperty: IReadOnlyProperty<LaserColor>;
  readonly wavelengthProperty: Property<number>;

  // laser direction vector
  private readonly directionUnitVector: Vector2 = new Vector2( 0, 0 );

  // point to be pivoted about, and at which the laser points
  readonly pivotProperty: Vector2Property;

  /**
   * @param wavelengthProperty - wavelength of light
   * @param distanceFromPivot - distance from laser pivot point
   * @param angle - laser angle
   * @param topLeftQuadrant - specifies whether laser in topLeftQuadrant
   */
  constructor( wavelengthProperty: Property<number>, distanceFromPivot: number, angle: number, topLeftQuadrant: boolean ) {

    this.topLeftQuadrant = topLeftQuadrant;
    this.pivotProperty = new Vector2Property( new Vector2( 0, 0 ) );
    this.onProperty = new BooleanProperty( false );
    this.waveProperty = new BooleanProperty( false );
    this.colorModeProperty = new EnumerationProperty( ColorModeEnum.SINGLE_COLOR );
    this.emissionPointProperty = new Vector2Property( Vector2.createPolar( distanceFromPivot, angle ) ); // @public model the point where light comes out of the laser where the light comes from
    this.colorProperty = new DerivedProperty( [ wavelengthProperty ], ( wavelength: number ) => new LaserColor( wavelength ) );
    this.wavelengthProperty = wavelengthProperty;

    this.waveProperty.link( () => {

      // prevent laser from going to 90 degrees when in wave mode, should go until laser bumps into edge.
      if ( this.waveProperty.value && this.getAngle() > BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE && topLeftQuadrant ) {
        this.setAngle( BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE );
      }
    } );
  }

  // Restore to initial values.
  reset() {
    this.pivotProperty.reset();
    this.onProperty.reset();
    this.waveProperty.reset();
    this.colorModeProperty.reset();
    this.emissionPointProperty.reset();
  }

  /**
   * Translate the laser in model
   * @param deltaX - amount of space in x direction laser to be translated
   * @param deltaY - amount of space in y direction laser to be translated
   */
  translate( deltaX: number, deltaY: number ) {

    // Caution -- For reasons unknown to @samreid, if the order of the following instructions is switched, the
    // laser will rotate while being dragged, see #221
    this.pivotProperty.value = this.pivotProperty.value.plusXY( deltaX, deltaY );
    this.emissionPointProperty.value = this.emissionPointProperty.value.plusXY( deltaX, deltaY );
  }

  /**
   * Determines the unit vector of light ray
   */
  getDirectionUnitVector(): Vector2 {
    const magnitude = this.pivotProperty.value.distance( this.emissionPointProperty.value );
    this.directionUnitVector.x = ( this.pivotProperty.value.x - this.emissionPointProperty.value.x ) / magnitude;
    this.directionUnitVector.y = ( this.pivotProperty.value.y - this.emissionPointProperty.value.y ) / magnitude;
    return this.directionUnitVector;
  }

  /**
   * Rotate about the fixed pivot
   * @param angle - angle to be rotated
   */
  setAngle( angle: number ) {
    const distFromPivot = this.pivotProperty.value.distance( this.emissionPointProperty.value );
    this.emissionPointProperty.value = new Vector2(
      distFromPivot * Math.cos( angle ) + this.pivotProperty.value.x,
      distFromPivot * Math.sin( angle ) + this.pivotProperty.value.y
    );
  }

  /**
   * Determines the angle of the laser
   */
  getAngle(): number {
    return this.getDirectionUnitVector().angle + Math.PI;
  }

  /**
   * Determines the distance of laser from pivot point
   */
  getDistanceFromPivot(): number {
    return this.pivotProperty.value.distance( this.emissionPointProperty.value );
  }

  /**
   * Determines the wavelength of the laser
   */
  getWavelength(): number {
    return this.colorProperty.get().wavelength;
  }

  /**
   * Determines the wavelength of the laser
   */
  getFrequency(): number {
    return BendingLightConstants.SPEED_OF_LIGHT / this.getWavelength();
  }
}

bendingLight.register( 'Laser', Laser );

export default Laser;