// Copyright 2002-2012, University of Colorado
/**
 * Model for the "intro" tab, which has an upper and lower medium, interfacing at the middle of the screen, and the laser at the top left shining toward the interface.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
//  var IntensityMeter = require( 'BENDING_LIGHT/common/model/IntensityMeter' );
  var MediumState = require( 'BENDING_LIGHT/common/model/MediumState' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  //var LightRay = require( 'BENDING_LIGHT/common/model/LightRay' );
  var Medium = require( 'BENDING_LIGHT/common/model/Medium' );
  var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var LaserView = require( 'BENDING_LIGHT/common/view/LaserView' );

  // var MISS = IntensityMeter.Reading.MISS;

  /**
   *
   * @param clock
   * @constructor
   */
  function IntroModel( clock ) {

    BendingLightModel.call( this, clock, Math.PI * 3 / 4, true/*, DEFAULT_LASER_DISTANCE_FROM_PIVOT*/ );
    this.mediumColorFactory = new MediumColorFactory();
    this.topMedium = new Property( new Medium( Shape.rect( -1, 0, 2, 0.3 ), BendingLightModel.AIR,
      this.mediumColorFactory.getColor( BendingLightModel.AIR.getIndexOfRefractionForRedLight() ) ) );

    this.bottomMedium = new Property( new Medium( Shape.rect( -1, -0.3, 2, 0.3 ), BendingLightModel.WATER,
      this.mediumColorFactory.getColor( BendingLightModel.WATER.getIndexOfRefractionForRedLight() ) ) );
  }

  return inherit( BendingLightModel, IntroModel, {

    //Light rays were cleared from model before propagateRays was called,
    // this creates them according to the laser and mediums
    propagateRays: function() {
      //Relatively large regions to keep track of which side the light is on
      var bottom = new Rectangle( -10, -10, 20, 10 );
      var top = new Rectangle( -10, 0, 20, 10 );
      if ( laser.on.get() ) {
        var tail = new Vector2( laser.emissionPoint.get() );
        //index in top medium
        var n1 = this.getN1();
        //index of bottom medium
        var n2 = this.getN2();
        //Angle from the up vertical
        var theta1 = laser.getAngle() - Math.PI / 2;
        //Angle from the down vertical
        var theta2 = asin( n1 / n2 * sin( theta1 ) );
        //Start with full strength laser
        var sourcePower = 1.0;
        //cross section of incident light, used to compute wave widths
        var a = CHARACTERISTIC_LENGTH * 5;
        //This one fixes the input beam to be a fixed width independent of angle
        var sourceWaveWidth = a / 2;
        //According to http://en.wikipedia.org/wiki/Wavelength
        var color = laser.color.get().getColor();
        var wavelengthInTopMedium = laser.color.get().getWavelength() / n1;
        //Since the n1 depends on the wavelength, when you change the wavelength, the wavelengthInTopMedium also changes (seemingly in the opposite direction)
        var incidentRay = new LightRay( tail, new Vector2(), n1, wavelengthInTopMedium, sourcePower, color, sourceWaveWidth, 0.0, bottom, true, false );
        var rayAbsorbed = this.addAndAbsorb( incidentRay );
        if ( !rayAbsorbed ) {
          var thetaOfTotalInternalReflection = asin( n2 / n1 );
          var hasTransmittedRay = Number.isNaN( thetaOfTotalInternalReflection ) || theta1 < thetaOfTotalInternalReflection;
          //assuming perpendicular beam polarization, compute percent power
          var reflectedPowerRatio;
          if ( hasTransmittedRay ) {
            reflectedPowerRatio = getReflectedPower( n1, n2, Math.cos( theta1 ), Math.cos( theta2 ) );
          }
          else {
            reflectedPowerRatio = 1.0;
          }
          var reflectedWaveWidth = sourceWaveWidth;
          this.addAndAbsorb( new LightRay( new Vector2(), createPolar( 1, Math.PI - laser.getAngle() ), n1, wavelengthInTopMedium, reflectedPowerRatio * sourcePower, color, reflectedWaveWidth, incidentRay.getNumberOfWavelengths(), bottom, true, false ) );
          // Fire a transmitted ray if there wasn't total internal reflection
          if ( hasTransmittedRay ) {
            //n2/n1 = L1/L2 => L2 = L1*n2/n1
            var transmittedWavelength = incidentRay.getWavelength() / n2 * n1;
            if ( Number.isNaN( theta2 ) || Number.isInfinite( theta2 ) ) {
            }
            else {
              var transmittedPowerRatio = getTransmittedPower( n1, n2, cos( theta1 ), cos( theta2 ) );
              //Make the beam width depend on the input beam width, so that the same beam width is transmitted as was intercepted
              var beamHalfWidth = a / 2;
              var extentInterceptedHalfWidth = beamHalfWidth / Math.sin( Math.PI / 2 - theta1 ) / 2;
              var transmittedBeamHalfWidth = Math.cos( theta2 ) * extentInterceptedHalfWidth;
              var transmittedWaveWidth = transmittedBeamHalfWidth * 2;
              var transmittedRay = new LightRay( new Vector2(), createPolar( 1, theta2 - Math.PI / 2 ), n2, transmittedWavelength, transmittedPowerRatio * sourcePower, color, transmittedWaveWidth, incidentRay.getNumberOfWavelengths(), top, true, true );
              Math.addAndAbsorb( transmittedRay );
            }
          }
        }
        //For wave view
        incidentRay.moveToFront();
      }
    },
    //Get the top medium index of refraction

    getN1: function() {
      return this.topMedium.get().getIndexOfRefraction( laser.color.get().getWavelength() );
    },
    //Get the bottom medium index of refraction

    getN2: function() {
      return this.bottomMedium.get().getIndexOfRefraction( laser.color.get().getWavelength() );
    },
    /**
     * Checks whether the intensity meter should absorb the ray, and if so adds a truncated ray.
     * If the intensity meter misses the ray, the original ray is added.
     * @param ray
     * @returns {*}
     */
    addAndAbsorb: function( ray ) {
      var rayAbsorbed = ray.intersects( this.intensityMeter.getSensorShape() ) && this.intensityMeter.enabled.get();
      if ( rayAbsorbed ) {
        //Find intersection points with the intensity sensor
        var intersects = getLineCircleIntersection( this.intensityMeter.getSensorShape(), ray.toLine2D() );
        //If it intersected, then absorb the ray
        if ( intersects != null && intersects[ 0 ] != null && intersects[ 1 ] != null ) {
          var x = intersects[ 0 ].getX() + intersects[ 1 ].getX();
          var y = intersects[ 0 ].getY() + intersects[ 1 ].getY();
          var interrupted = new LightRay( ray.tail, new Vector2( x / 2, y / 2 ), ray.indexOfRefraction, ray.getWavelength(), ray.getPowerFraction(), laser.color.get().getColor(), ray.getWaveWidth(), ray.getNumWavelengthsPhaseOffset(), ray.getOppositeMedium(), false, ray.extendBackwards );
          //don't let the wave intersect the intensity meter if it is behind the laser emission point
          var isForward = ray.toVector2D().dot( interrupted.toVector2D() ) > 0;
          if ( interrupted.getLength() < ray.getLength() && isForward ) {
            addRay( interrupted );
          }
          else {
            addRay( ray );
            rayAbsorbed = false;
          }
        }
      }
      else {
        addRay( ray );
      }
      if ( rayAbsorbed ) {
        this.intensityMeter.addRayReading( new IntensityMeter.Reading( ray.getPowerFraction() ) );
      }
      else {
        this.intensityMeter.addRayReading( MISS );
      }
      return rayAbsorbed;
    },
    resetAll: function() {
      BendingLightModel.prototype.resetAll.call( this );
      this.topMedium.reset();
      this.bottomMedium.reset();
    },
    /**
     * Determine the velocity of the topmost light ray at the specified position, if one exists, otherwise None
     * @param position
     * @returns {*}
     */
    getVelocity: function( position ) {
      for ( var ray in rays ) {
        if ( ray.contains( position, laserView.get() == LaserView.WAVE ) ) {
          return new Option.Some( ray.getVelocityVector() );
        }
      }
      return new Option.None();
    },
    /**
     * Determine the wave value of the topmost light ray at the specified position, or None if none exists
     * @param position
     * @returns {*}
     */
    getWaveValue: function( position ) {
      for ( var ray in rays ) {
        if ( ray.contains( position, laserView.get() == LaserView.WAVE ) ) {
          //Map power to displayed amplitude
          var amplitude = Math.sqrt( ray.getPowerFraction() );
          //Find out how far the light has come, so we can compute the remainder of phases
          var distanceAlongRay = ray.getUnitVector().dot( new Vector2( ray.tail.toPoint2D(), position.toPoint2D() ) );
          var phase = ray.getCosArg( distanceAlongRay );
          //Wave is a*cos(theta)
          return new Option.Some( amplitude * Math.cos( phase + Math.PI ) );
        }
      }
      return new Option.None();
    }
  } );
} );

