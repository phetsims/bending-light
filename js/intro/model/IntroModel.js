// Copyright 2002-2015, University of Colorado
/**
 * Model for the "intro" tab, which has an upper and lower medium, interfacing at the middle of the screen,
 * and the laser at the top left shining toward the interface.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var LightRay = require( 'BENDING_LIGHT/common/model/LightRay' );
  var Medium = require( 'BENDING_LIGHT/common/model/Medium' );
  var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  // var MISS = IntensityMeter.Reading.MISS;
  var CHARACTERISTIC_LENGTH = 650E-9;

  /**
   *
   * @constructor
   */
  function IntroModel() {
    var introModel = this;
    BendingLightModel.call( this, Math.PI * 3 / 4, true, BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT );
    this.mediumColorFactory = new MediumColorFactory();
    this.topMedium = new Property( new Medium( Shape.rect( -1, 0, 2, 0.3 ), BendingLightModel.AIR,
      this.mediumColorFactory.getColor( BendingLightModel.AIR.getIndexOfRefractionForRedLight() ), 1 ) );
    this.bottomMedium = new Property( new Medium( Shape.rect( -1, -0.3, 2, 0.3 ), BendingLightModel.WATER,
      this.mediumColorFactory.getColor( BendingLightModel.WATER.getIndexOfRefractionForRedLight() ), 1.3 ) );
    Property.multilink( [ this.laserViewProperty, this.laser.onProperty,
      this.laser.emissionPointProperty, this.topMedium, this.bottomMedium
    ], function() {
      introModel.updateModel();
    } );
  }

  return inherit( BendingLightModel, IntroModel, {

    //Light rays were cleared from model before propagateRays was called,
    // this creates them according to the laser and mediums
    propagateRays: function() {
      //Relatively large regions to keep track of which side the light is on
      var bottom = 0;//new Rectangle( -10, -10, 20, 10 );
      var top = 0;//new Rectangle( -10, 0, 20, 10 );
      if ( this.laser.on ) {
        var tail = this.laser.emissionPoint;
        //index in top medium
        var n1 = this.getN1();
        //index of bottom medium
        var n2 = this.getN2();
        //Angle from the up vertical
        var theta1 = this.laser.getAngle() - Math.PI / 2;
        //Angle from the down vertical
        var theta2 = Math.asin( n1 / n2 * Math.sin( theta1 ) );
        //Start with full strength laser
        var sourcePower = 1.0;
        //cross section of incident light, used to compute wave widths
        var a = CHARACTERISTIC_LENGTH * 5;
        //This one fixes the input beam to be a fixed width independent of angle
        var sourceWaveWidth = a / 2;
        //According to http://en.wikipedia.org/wiki/Wavelength
        var color = this.laser.laserColor.getColor();
        var wavelengthInTopMedium = this.laser.laserColor.getWavelength() / n1;

        // calculated wave width of reflected and refracted wave width.
        // specially used in in wave Mode
        var initialPoint = this.laser.emissionPoint;
        var finalPoint = this.laser.pivot;
        var angle = new Vector2( finalPoint.x - initialPoint.x,
          finalPoint.y - initialPoint.y ).angle();
        var trapeziumWidth = Math.abs( sourceWaveWidth / Math.sin( angle ) );

        //Since the n1 depends on the wavelength, when you change the wavelength,
        // the wavelengthInTopMedium also changes (seemingly in the opposite direction)
        var incidentRay = new LightRay( trapeziumWidth, tail, new Vector2( 0, 0 ),
          n1, wavelengthInTopMedium, sourcePower, color, sourceWaveWidth,
          0.0, bottom, true, true );
        var rayAbsorbed = this.addAndAbsorb( incidentRay );
        if ( !rayAbsorbed ) {
          var thetaOfTotalInternalReflection = Math.asin( n2 / n1 );
          var hasTransmittedRay = isNaN( thetaOfTotalInternalReflection ) ||
                                  theta1 < thetaOfTotalInternalReflection;
          //assuming perpendicular beam polarization, compute percent power
          var reflectedPowerRatio;
          if ( hasTransmittedRay ) {
            reflectedPowerRatio = this.getReflectedPower( n1, n2, Math.cos( theta1 ), Math.cos( theta2 ) );
          }
          else {
            reflectedPowerRatio = 1.0;
          }
          this.addAndAbsorb( new LightRay( trapeziumWidth, new Vector2( 0, 0 ),
            Vector2.createPolar( 1, Math.PI - this.laser.getAngle() ),
            n1, wavelengthInTopMedium,
            reflectedPowerRatio * sourcePower,
            color, trapeziumWidth,
            incidentRay.getNumberOfWavelengths(),
            bottom,
            true,
            false ) );
          // Fire a transmitted ray if there wasn't total internal reflection
          if ( hasTransmittedRay ) {
            // n2/n1 = L1/L2 => L2 = L1*n2/n1
            var transmittedWavelength = incidentRay.getWavelength() / n2 * n1;
            if ( isNaN( theta2 ) || !isFinite( theta2 ) ) {
            }
            else {
              var transmittedPowerRatio = this.getTransmittedPower( n1, n2, Math.cos( theta1 ), Math.cos( theta2 ) );
              //Make the beam width depend on the input beam width, so that the same beam width is transmitted as was intercepted

              var transmittedRay = new LightRay( trapeziumWidth, new Vector2( 0, 0 ),
                Vector2.createPolar( 1, theta2 - Math.PI / 2 ), n2,
                transmittedWavelength, transmittedPowerRatio * sourcePower,
                color, trapeziumWidth, incidentRay.getNumberOfWavelengths(),
                top, true, true );
              this.addAndAbsorb( transmittedRay );
            }
          }
        }

      }
    },
    //Get the top medium index of refraction

    getN1: function() {
      //  return this.topMedium.get().getIndexOfRefraction( this.laser.laserColor.getWavelength() );
      return this.topMedium.get().mediumIndexOfRefraction;
    },
    //Get the bottom medium index of refraction

    getN2: function() {
      return this.bottomMedium.get().mediumIndexOfRefraction;
      // return this.bottomMedium.get().getIndexOfRefraction( this.laser.laserColor.getWavelength() );
    },
    /**
     * Checks whether the intensity meter should absorb the ray, and if so adds a truncated ray.
     * If the intensity meter misses the ray, the original ray is added.
     * @param ray
     * @returns {*}
     */
    addAndAbsorb: function( ray ) {
      var rayAbsorbed = false;//=ray.intersects( this.intensityMeter.getSensorShape() ) && this.intensityMeter.enabled.get();
      if ( rayAbsorbed ) {
        //Find intersection points with the intensity sensor
        var intersects = false;// getLineCircleIntersection( this.intensityMeter.getSensorShape(), ray.toLine2D() );
        //If it intersected, then absorb the ray
        if ( intersects !== null && intersects[ 0 ] !== null && intersects[ 1 ] !== null ) {
          var x = intersects[ 0 ].getX() + intersects[ 1 ].getX();
          var y = intersects[ 0 ].getY() + intersects[ 1 ].getY();
          var interrupted = new LightRay( ray.tail, new Vector2( x / 2, y / 2 ),
            ray.indexOfRefraction, ray.getWavelength(), ray.getPowerFraction(), this.laser.color.get().getColor(), ray.getWaveWidth(), ray.getNumWavelengthsPhaseOffset(), ray.getOppositeMedium(), false, ray.extendBackwards );
          //don't let the wave intersect the intensity meter if it is behind the laser emission point
          var isForward = ray.toVector2D().dot( interrupted.toVector2D() ) > 0;
          if ( interrupted.getLength() < ray.getLength() && isForward ) {
            this.addRay( interrupted );
          }
          else {
            this.addRay( ray );
            rayAbsorbed = false;
          }
        }
      }
      else {
        this.addRay( ray );
      }
      if ( rayAbsorbed ) {
        // this.intensityMeter.addRayReading( new IntensityMeter.Reading( ray.getPowerFraction() ) );
      }
      else {
        //this.intensityMeter.addRayReading( MISS );
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
      /* for ( var ray in this.rays ) {
       if ( ray.contains( position, this.laserView.get() === LaserView.WAVE ) ) {
       return */
      /*new Option.Some*/
      /*( ray.getVelocityVector() );
       }
       }*/
      // return new Option.None();
    },
    /**
     * Determine the wave value of the topmost light ray at the specified position,
     * or None if none exists
     * @param position
     * @returns {*}
     */
    getWaveValue: function( position ) {
      /* for ( var ray in this.rays ) {
       if ( ray.contains( position, laserView.get() === LaserView.WAVE ) ) {
       //Map power to displayed amplitude
       var amplitude = Math.sqrt( ray.getPowerFraction() );
       //Find out how far the light has come, so we can compute the remainder of phases
       var distanceAlongRay = ray.getUnitVector().dot( new Vector2( ray.tail.toPoint2D(), position.toPoint2D() ) );
       var phase = ray.getCosArg( distanceAlongRay );
       //Wave is a*cos(theta)
       return new Option.Some( amplitude * Math.cos( phase + Math.PI ) );
       }
       }
       return new Option.None();*/
    }
  } );
} );

