// Copyright 2002-2012, University of Colorado
/**
 * Model for the laser, which emits LightRays.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  // var Dimension2D = require( 'java.awt.geom.Dimension2D' );
  var LaserColor = require( 'BENDING_LIGHT/common/view/LaserColor' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var WAVELENGTH_RED = 650E-9;

//so the refracted wave mode doesn't get too big because at angle = PI it would become infinite.
// This value was determined by printing out actual angle values at runtime and sampling a good value.
  var MAX_ANGLE_IN_WAVE_MODE = 3.0194;

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

    // this.emissionPoint = new Property( createPolar( distanceFromPivot, angle ) );
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
        translate( delta.getWidth(), delta.getHeight() );
      },
      translate: function( dx, dy ) {
        emissionPoint.set( emissionPoint.get().plus( dx, dy ) );
        pivot.set( pivot.get().plus( dx, dy ) );
      },
      getDirectionUnitVector: function() {
        return pivot.get().minus( emissionPoint.get() ).normalized();
      },
      //Rotate about the fixed pivot
      setAngle: function( angle ) {
        var distFromPivot = pivot.get().distance( emissionPoint.get() );
        this.emissionPoint.set( Vector2.createPolar( distFromPivot, angle ).plus( pivot.get() ) );
      },
      getAngle: function() {
        //TODO: why is this backwards by 180 degrees?
        return /*getDirectionUnitVector().getAngle() + */Math.PI;
      },
      getDistanceFromPivot: function() {
        return emissionPoint.get().minus( pivot.get() ).magnitude();
      },
      getWavelength: function() {
        return color.get().getWavelength();
      },
      getFrequency: function() {
        return BendingLightModel.SPEED_OF_LIGHT / this.getWavelength();
      }
    },
//statics
    {
      MAX_ANGLE_IN_WAVE_MODE: MAX_ANGLE_IN_WAVE_MODE
    } );
} );

