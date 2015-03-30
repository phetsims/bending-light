// Copyright 2002-2015, University of Colorado
/**
 * Model for the laser, which emits LightRays.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LaserColor = require( 'BENDING_LIGHT/common/view/LaserColor' );
  var Vector2 = require( 'DOT/Vector2' );
  var PropertySet = require( 'AXON/PropertySet' );
  var WAVELENGTH_RED = 650E-9;

  //so the refracted wave mode doesn't get too big because at angle = PI it would become infinite.
  // This value was determined by printing out actual angle values at runtime and sampling a good value.
  var MAX_ANGLE_IN_WAVE_MODE = 3.0194;
  var SPEED_OF_LIGHT = 2.99792458E8;

  /**
   *
   * @param {Number}  distanceFromPivot
   * @param {Number}  angle
   * @param {Boolean} topLeftQuadrant
   * @constructor
   */
  function Laser( distanceFromPivot, angle, topLeftQuadrant ) {
    this.topLeftQuadrant = topLeftQuadrant;
    var laser = this;
    PropertySet.call( this, {
        //point to be pivoted about, and at which the laser points
        pivot: new Vector2( 0, 0 ),
        color: new LaserColor.OneColor( WAVELENGTH_RED ),
        //True if the laser is activated and emitting light
        on: false,
        wave: false,
        colorMode: 'singleColor',
        //Model the point where light comes out of the laser
        //where the light comes from
        emissionPoint: Vector2.createPolar( distanceFromPivot, angle )
      }
    );

    // create vector initially and used to avoid to many vector allocations
    //  laser direction vector
    this.directionUnitVector = new Vector2( 0, 0 );
    this.waveProperty.link( function() {
      if ( laser.wave && laser.getAngle() > MAX_ANGLE_IN_WAVE_MODE && topLeftQuadrant ) {
        laser.setAngle( MAX_ANGLE_IN_WAVE_MODE );
      }
    } );
  }

  return inherit( PropertySet, Laser, {
      //Reset all parts of the laser
      resetAll: function() {
        PropertySet.prototype.reset.call( this );
        // this.resetLocation();
      },
      //Called if the laser is dropped out of bounds
      resetLocation: function() {
        this.emissionPointProperty.reset();
        this.pivotProperty.reset();
      },
      /**
       *
       * @param {Vector2} delta
       */
      translate: function( delta ) {
        this.emissionPoint.x = this.emissionPoint.x + delta.x;
        this.emissionPoint.y = this.emissionPoint.y + delta.y;
        this.pivot.x = this.pivot.x + delta.x;
        this.pivot.y = this.pivot.y + delta.y;
        this.emissionPointProperty._notifyObservers();
        this.pivotProperty._notifyObservers();
      },
      getDirectionUnitVector: function() {
        this.directionUnitVector.x = this.pivot.x - this.emissionPoint.x;
        this.directionUnitVector.y = this.pivot.y - this.emissionPoint.y;
        var magnitude = this.directionUnitVector.magnitude();
        this.directionUnitVector.x = this.directionUnitVector.x / magnitude;
        this.directionUnitVector.y = this.directionUnitVector.y / magnitude;
        return this.directionUnitVector;
      },

      /**
       * Rotate about the fixed pivot
       * @param {Number}angle
       */
      setAngle: function( angle ) {
        var distFromPivot = this.pivot.distance( this.emissionPoint );
        this.emissionPoint.x = distFromPivot * Math.cos( angle ) + this.pivot.x;
        this.emissionPoint.y = distFromPivot * Math.sin( angle ) + this.pivot.y;
        this.emissionPointProperty._notifyObservers();
      },
      getAngle: function() {
        //TODO: why is this backwards by 180 degrees?
        return this.getDirectionUnitVector().angle() + Math.PI;
      },
      getDistanceFromPivot: function() {
        this.directionUnitVector.x = this.emissionPoint.x - this.pivot.x;
        this.directionUnitVector.y = this.emissionPoint.y - this.pivot.y;
        return this.directionUnitVector.magnitude();
      },
      getWavelength: function() {
        return this.color.getWavelength();
      },
      getFrequency: function() {
        return SPEED_OF_LIGHT / this.getWavelength();
      }
    },
//statics
    {
      MAX_ANGLE_IN_WAVE_MODE: MAX_ANGLE_IN_WAVE_MODE
    } );
} );

