// Copyright 2015-2019, University of Colorado Boulder

/**
 * Model for the laser, which emits LightRays.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LaserColor = require( 'BENDING_LIGHT/common/view/LaserColor' );
  const Property = require( 'AXON/Property' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  /**
   * @param {Property.<number>} wavelengthProperty - wavelength of light
   * @param {number} distanceFromPivot - distance from laser pivot point
   * @param {number} angle - laser angle
   * @param {boolean} topLeftQuadrant - specifies whether laser in topLeftQuadrant
   * @constructor
   */
  function Laser( wavelengthProperty, distanceFromPivot, angle, topLeftQuadrant ) {

    this.topLeftQuadrant = topLeftQuadrant;
    const self = this;
    this.pivotProperty = new Vector2Property( new Vector2( 0, 0 ) ); // @public, point to be pivoted about, and at which the laser points
    this.onProperty = new Property( false ); // @public, true if the laser is activated and emitting light
    this.waveProperty = new Property( false ); // @public
    this.colorModeProperty = new Property( 'singleColor' ); // @public
    this.emissionPointProperty = new Vector2Property( Vector2.createPolar( distanceFromPivot, angle ) ); // @public model the point where light comes out of the laser where the light comes from

    // @public (read-only)
    this.colorProperty = new DerivedProperty( [ wavelengthProperty ], function( wavelength ) {
      return new LaserColor( wavelength );
    } );

    // @public (read-only)
    this.wavelengthProperty = wavelengthProperty;

    // laser direction vector
    this.directionUnitVector = new Vector2( 0, 0 ); // @private, for internal use only.

    this.waveProperty.link( function() {

      // prevent laser from going to 90 degrees when in wave mode, should go until laser bumps into edge.
      if ( self.waveProperty.value && self.getAngle() > BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE && topLeftQuadrant ) {
        self.setAngle( BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE );
      }
    } );
  }

  bendingLight.register( 'Laser', Laser );

  return inherit( Object, Laser, {

    /**
     * Restore to initial values.
     */
    reset: function() {
      this.pivotProperty.reset();
      this.onProperty.reset();
      this.waveProperty.reset();
      this.colorModeProperty.reset();
      this.emissionPointProperty.reset();
    },

    /**
     * Translate the laser in model
     * @public
     * @param {number} deltaX - amount of space in x direction laser to be translated
     * @param {number} deltaY - amount of space in y direction laser to be translated
     */
    translate: function( deltaX, deltaY ) {

      // Caution -- For reasons unknown to @samreid, if the order of the following instructions is switched, the
      // laser will rotate while being dragged, see #221
      this.pivotProperty.value = this.pivotProperty.value.plusXY( deltaX, deltaY );
      this.emissionPointProperty.value = this.emissionPointProperty.value.plusXY( deltaX, deltaY );
    },

    /**
     * Determines the unit vector of light ray
     * @public
     * @returns {Vector2}
     */
    getDirectionUnitVector: function() {
      const magnitude = this.pivotProperty.value.distance( this.emissionPointProperty.value );
      this.directionUnitVector.x = (this.pivotProperty.value.x - this.emissionPointProperty.value.x) / magnitude;
      this.directionUnitVector.y = (this.pivotProperty.value.y - this.emissionPointProperty.value.y) / magnitude;
      return this.directionUnitVector;
    },

    /**
     * Rotate about the fixed pivot
     * @param {number} angle - angle to be rotated
     * @public
     */
    setAngle: function( angle ) {
      const distFromPivot = this.pivotProperty.value.distance( this.emissionPointProperty.value );
      this.emissionPointProperty.value = new Vector2(
        distFromPivot * Math.cos( angle ) + this.pivotProperty.value.x,
        distFromPivot * Math.sin( angle ) + this.pivotProperty.value.y
      );
    },

    /**
     * Determines the angle of the laser
     * @returns {number}
     * @public
     */
    getAngle: function() {
      return this.getDirectionUnitVector().angle + Math.PI;
    },

    /**
     * Determines the distance of laser from pivot point
     * @returns {number}
     * @public
     */
    getDistanceFromPivot: function() {
      return this.pivotProperty.value.distance( this.emissionPointProperty.value );
    },

    /**
     * Determines the wavelength of the laser
     * @returns {number}
     * @public
     */
    getWavelength: function() {
      return this.colorProperty.get().wavelength;
    },

    /**
     * Determines the wavelength of the laser
     * @returns {number}
     * @public
     */
    getFrequency: function() {
      return BendingLightConstants.SPEED_OF_LIGHT / this.getWavelength();
    }
  } );
} );
