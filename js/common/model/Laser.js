// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model for the laser, which emits LightRays.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LaserColor = require( 'BENDING_LIGHT/common/view/LaserColor' );
  var Vector2 = require( 'DOT/Vector2' );
  var PropertySet = require( 'AXON/PropertySet' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

  /**
   * @param {Property.<number>} wavelengthProperty - wavelength of light
   * @param {number} distanceFromPivot - distance from laser pivot point
   * @param {number} angle - laser angle
   * @param {Boolean} topLeftQuadrant - specifies whether laser in topLeftQuadrant
   * @constructor
   */
  function Laser( wavelengthProperty, distanceFromPivot, angle, topLeftQuadrant ) {

    this.topLeftQuadrant = topLeftQuadrant;
    var laser = this;
    PropertySet.call( this, {
      pivot: new Vector2( 0, 0 ), // @public, point to be pivoted about, and at which the laser points
      on: false, // @public, true if the laser is activated and emitting light
      wave: false, // @public
      colorMode: 'singleColor', // @public

      // model the point where light comes out of the laser
      // where the light comes from
      emissionPoint: Vector2.createPolar( distanceFromPivot, angle ) // @public
    } );

    // @public (read-only)
    this.colorProperty = new DerivedProperty( [ wavelengthProperty ], function( wavelength ) {
      return new LaserColor( wavelength );
    } );

    // laser direction vector
    this.directionUnitVector = new Vector2( 0, 0 ); // @private, for internal use only.

    this.waveProperty.link( function() {

      // prevent laser from going to 90 degrees when in wave mode, should go until laser bumps into edge.
      if ( laser.wave && laser.getAngle() > BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE && topLeftQuadrant ) {
        laser.setAngle( BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE );
      }
    } );
  }

  return inherit( PropertySet, Laser, {

    /**
     * Translate the laser in model
     * @public
     * @param {number} deltaX - amount of space in x direction laser to be translated
     * @param {number} deltaY - amount of space in y direction laser to be translated
     */
    translate: function( deltaX, deltaY ) {

      // Caution -- For reasons unknown to @samreid, if the order of the following instructions is switched, the
      // laser will rotate while being dragged, see #221
      this.pivot = this.pivot.plusXY( deltaX, deltaY );
      this.emissionPoint = this.emissionPoint.plusXY( deltaX, deltaY );
    },

    /**
     * Determines the unit vector of light ray
     * @public
     * @returns {Vector2}
     */
    getDirectionUnitVector: function() {
      var magnitude = this.pivot.distance( this.emissionPoint );
      this.directionUnitVector.x = (this.pivot.x - this.emissionPoint.x) / magnitude;
      this.directionUnitVector.y = (this.pivot.y - this.emissionPoint.y) / magnitude;
      return this.directionUnitVector;
    },

    /**
     * Rotate about the fixed pivot
     * @param {number} angle - angle to be rotated
     * @public
     */
    setAngle: function( angle ) {
      var distFromPivot = this.pivot.distance( this.emissionPoint );
      this.emissionPoint = new Vector2(
        distFromPivot * Math.cos( angle ) + this.pivot.x,
        distFromPivot * Math.sin( angle ) + this.pivot.y
      );
    },

    /**
     * Determines the angle of the laser
     * @returns {number}
     * @public
     */
    getAngle: function() {
      return this.getDirectionUnitVector().angle() + Math.PI;
    },

    /**
     * Determines the distance of laser from pivot point
     * @returns {number}
     * @public
     */
    getDistanceFromPivot: function() {
      return this.pivot.distance( this.emissionPoint );
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
