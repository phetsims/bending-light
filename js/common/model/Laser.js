// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model for the laser, which emits LightRays.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni(Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LaserColor = require( 'BENDING_LIGHT/common/view/LaserColor' );
  var Vector2 = require( 'DOT/Vector2' );
  var PropertySet = require( 'AXON/PropertySet' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );

  /**
   *
   * @param {number} distanceFromPivot - distance from laser pivot point
   * @param {number} angle - laser angle
   * @param {Boolean} topLeftQuadrant
   * @constructor
   */
  function Laser( distanceFromPivot, angle, topLeftQuadrant ) {

    this.topLeftQuadrant = topLeftQuadrant;
    var laser = this;
    PropertySet.call( this, {
      pivot: new Vector2( 0, 0 ), // point to be pivoted about, and at which the laser points
      color: new LaserColor.OneColor( BendingLightConstants.WAVELENGTH_RED ),
      on: false,    // true if the laser is activated and emitting light
      wave: false,
      colorMode: 'singleColor',
      // model the point where light comes out of the laser
      // where the light comes from
      emissionPoint: Vector2.createPolar( distanceFromPivot, angle )
    } );

    // reusable vectors to avoid to many vector allocations
    // vector to store new laser emission point
    this.newEmissionPoint = new Vector2( 0, 0 );

    // vector for to store new laser pivot point
    this.newPivotPoint = new Vector2( 0, 0 );

    // laser direction vector
    this.directionUnitVector = new Vector2( 0, 0 );

    this.waveProperty.link( function() {
      // prevent laser from going to 90 degrees when in wave mode, should go until laser bumps into edge.
      if ( laser.wave && laser.getAngle() > BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE && topLeftQuadrant ) {
        laser.setAngle( BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE );
      }
    } );
  }

  return inherit( PropertySet, Laser, {

    /**
     * @public
     * @param {number} deltaX
     * @param {number} deltaY
     */
    translate: function( deltaX, deltaY ) {

      this.newEmissionPoint.x = this.emissionPoint.x + deltaX;
      this.newEmissionPoint.y = this.emissionPoint.y + deltaY;
      this.newPivotPoint.x = this.pivot.x + deltaX;
      this.newPivotPoint.y = this.pivot.y + deltaY;
      this.emissionPointProperty.set( this.newEmissionPoint );
      this.pivotProperty.set( this.newPivotPoint );
      this.emissionPointProperty._notifyObservers();
      this.pivotProperty._notifyObservers();
    },

    /**
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
     * @public
     * @param {number} angle
     */
    setAngle: function( angle ) {
      var distFromPivot = this.pivot.distance( this.emissionPoint );
      this.newEmissionPoint.x = distFromPivot * Math.cos( angle ) + this.pivot.x;
      this.newEmissionPoint.y = distFromPivot * Math.sin( angle ) + this.pivot.y;
      this.emissionPointProperty.set( this.newEmissionPoint );
      this.emissionPointProperty._notifyObservers();
    },

    /**
     * @public
     * @returns {number}
     */
    getAngle: function() {
      //TODO: why is this backwards by 180 degrees?
      return this.getDirectionUnitVector().angle() + Math.PI;
    },

    /**
     * @public
     * @returns {number}
     */
    getDistanceFromPivot: function() {
      return this.pivot.distance( this.emissionPoint );
    },

    /**
     * @public
     * @returns {number}
     */
    getWavelength: function() {
      return this.color.getWavelength();
    },

    /**
     * @public
     * @returns {number}
     */
    getFrequency: function() {
      return BendingLightConstants.SPEED_OF_LIGHT / this.getWavelength();
    }
  } );
} );
