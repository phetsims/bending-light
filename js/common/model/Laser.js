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
   * @param distanceFromPivot
   * @param angle
   * @param topLeftQuadrant
   * @constructor
   */
  function Laser( distanceFromPivot, angle, topLeftQuadrant ) {
    this.laserColor = new LaserColor();
    PropertySet.call( this, {
        //point to be pivoted about, and at which the laser points
        pivot: new Vector2( 0, 0 ),
        color: this.laserColor.getColor( WAVELENGTH_RED ),
        //True if the laser is activated and emitting light
        on: false,
        wave: false,
        //Model the point where light comes out of the laser
        //where the light comes from
        emissionPoint: Vector2.createPolar( distanceFromPivot, angle )
      }
    );


    //Prevent laser from going to 90 degrees when in wave mode, should go until laser bumps into edge.
    /*var clampAngle = new SimpleObserver().withAnonymousClassBody( {
     update: function() {
     if (wave.get() && getAngle() > MAX_ANGLE_IN_WAVE_MODE && topLeftQuadrant) {
     setAngle(MAX_ANGLE_IN_WAVE_MODE);
     }
     }
     });
     wave.addObserver(clampAngle);*/

  }

  return inherit( PropertySet, Laser, {
      //Reset all parts of the laser
      resetAll: function() {
        PropertySet.prototype.reset.call( this );
        // this.resetLocation();
      },
      //Called if the laser is dropped out of bounds
      resetLocation: function() {
        this.emissionPoint.reset();
        this.pivotProperty.reset();
      },
      translate1: function( delta ) {
        this.translate( delta.getWidth(), delta.getHeight() );
      },
      translate: function( dx, dy ) {
        this.emissionPoint.set( this.emissionPoint.plus( dx, dy ) );
        this.pivot.set( this.pivot.plus( dx, dy ) );
      },
      getDirectionUnitVector: function() {
        return this.pivot.minus( this.emissionPoint ).normalized();
      },
      //Rotate about the fixed pivot
      setAngle: function( angle ) {
        var distFromPivot = this.pivot.distance( this.emissionPoint );
        this.emissionPoint = Vector2.createPolar( distFromPivot, angle ).plus(
          this.pivot );
      },
      getAngle: function() {
        //TODO: why is this backwards by 180 degrees?
        return this.getDirectionUnitVector().angle() + Math.PI;
      },
      getDistanceFromPivot: function() {
        return this.emissionPoint.minus( this.pivot ).magnitude();
      },
      getWavelength: function() {
        return this.laserColor.getWavelength();
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

