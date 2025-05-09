// Copyright 2015-2024, University of Colorado Boulder

/**
 * Wrapper around a shape with convenience methods for computing intersections, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Disposable from '../../../../axon/js/Disposable.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import bendingLight from '../../bendingLight.js';
import BendingLightCircle from './BendingLightCircle.js';
import ColoredRay from './ColoredRay.js';
import Intersection from './Intersection.js';
import Polygon from './Polygon.js';
import SemiCircle from './SemiCircle.js';

export default class Prism extends Disposable {
  public readonly shapeProperty: Property<Polygon | BendingLightCircle | SemiCircle>;
  public readonly positionProperty: Vector2Property;
  public readonly typeName: string;
  public translatedShape: Polygon | BendingLightCircle | SemiCircle;

  /**
   * @param shape
   * @param typeName for keeping track of how many of each kind there are, to remove from toolbox
   */
  public constructor( shape: Polygon | BendingLightCircle | SemiCircle, typeName: string ) {
    super();

    this.shapeProperty = new Property( shape );

    // overall translation
    this.positionProperty = new Vector2Property( new Vector2( 0, 0 ), {
      valueComparisonStrategy: 'equalsFunction'
    } );

    this.typeName = typeName;
    this.translatedShape = this.shapeProperty.value.getTranslatedInstance( 0, 0 );

    const updateTranslatedShape = () => {
      this.translatedShape = this.shapeProperty.value.getTranslatedInstance( this.positionProperty.value.x, this.positionProperty.value.y );
    };
    this.positionProperty.link( updateTranslatedShape );
    this.shapeProperty.link( updateTranslatedShape );

    this.disposeEmitter.addListener( () => {
      this.positionProperty.unlink( updateTranslatedShape );
      this.shapeProperty.unlink( updateTranslatedShape );
      this.shapeProperty.dispose();
      this.positionProperty.dispose();
    } );
  }

  /**
   * Translate prism by the specified amount
   * @param deltaX - amount of space in x direction the prism to be translated
   * @param deltaY - amount of space in y direction the prism to be translated
   */
  public translate( deltaX: number, deltaY: number ): void {
    this.positionProperty.value = this.positionProperty.value.plusXY( deltaX, deltaY );
  }

  public getTranslatedShape(): Polygon | BendingLightCircle | SemiCircle {
    return this.translatedShape;
  }

  /**
   * Compute the intersections of the specified ray with this polygon's edges
   * @param incidentRay - model of the ray
   */
  public getIntersections( incidentRay: ColoredRay ): Intersection[] {
    return this.getTranslatedShape().getIntersections( incidentRay );
  }

  /**
   * Determines whether shape contains given point or not
   */
  public contains( point: Vector2 ): boolean {
    return this.getTranslatedShape().containsPoint( point );
  }

  /**
   * Creates a copy of the prism
   */
  public copy(): Prism {
    return new Prism( this.shapeProperty.get().getTranslatedInstance( 0, 0 ), this.typeName );
  }

  /**
   * Rotate prism by the specified angle
   * @param deltaAngle - angle to be rotated
   */
  public rotate( deltaAngle: number ): void {
    this.shapeProperty.set( this.shapeProperty.get().getRotatedInstance( deltaAngle, this.shapeProperty.get().getRotationCenter() ) );
  }
}

bendingLight.register( 'Prism', Prism );