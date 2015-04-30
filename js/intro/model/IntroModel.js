// Copyright 2002-2015, University of Colorado Boulder
/**
 * Model for the "intro" Screen, which has an upper and lower medium, interfacing at the middle of the screen,
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
  var Reading = require( 'BENDING_LIGHT/common/model/Reading' );
  var WaveParticle = require( 'BENDING_LIGHT/common/model/WaveParticle' );
  var Ray2 = require( 'DOT/Ray2' );
  var Color = require( 'SCENERY/util/Color' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );

  //constants
  var CHARACTERISTIC_LENGTH = BendingLightConstants.WAVELENGTH_RED;

  /**
   *
   * @param {MediumState} bottomMediumState
   * @param {boolean} centerOffsetLeft
   * @constructor
   */
  function IntroModel( bottomMediumState, centerOffsetLeft ) {
    var introModel = this;
    BendingLightModel.call( this, Math.PI * 3 / 4, true, BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT, centerOffsetLeft );
    this.topMediumProperty = new Property( new Medium( Shape.rect( -1, 0, 2, 1 ), BendingLightModel.AIR,
      MediumColorFactory.getColor( BendingLightModel.AIR.getIndexOfRefractionForRedLight() ) ) );
    this.bottomMediumProperty = new Property( new Medium( Shape.rect( -1, -1, 2, 1 ), bottomMediumState,
      MediumColorFactory.getColor( bottomMediumState.getIndexOfRefractionForRedLight() ) ) );
    this.time = 0;
    Property.multilink( [
      this.laserViewProperty,
      this.laser.onProperty,
      this.intensityMeter.sensorPositionProperty,
      this.topMediumProperty,
      this.bottomMediumProperty,
      this.laser.emissionPointProperty,
      this.intensityMeter.enabledProperty,
      this.laser.colorProperty
    ], function() {
      introModel.updateModel();
      if ( introModel.laserViewProperty.value === 'wave' && introModel.laser.onProperty.value ) {
        if ( !introModel.allowWebGL ) {
          introModel.createInitialParticles();
        }
      }
    } );

    // Note: vectors that are used in step function are created here to reduce Vector2 allocations
    // vector for light Ray
    this.waveVector = new Vector2( 0, 0 );
    // light ray tail position
    this.tailVector = new Vector2( 0, 0 );
    // light ray tip position
    this.tipVector = new Vector2( 0, 0 );

    this.simDisplayWindowHeightInModel = 0;
  }

  return inherit( BendingLightModel, IntroModel, {
    /**
     * Light rays were cleared from model before propagateRays was called,
     * this creates them according to the laser and mediums
     */
    propagateRays: function() {
      //Relatively large regions to keep track of which side the light is on
      var bottom = 0;//new Rectangle( -10, -10, 20, 10 );
      var top = 0;//new Rectangle( -10, 0, 20, 10 );
      if ( this.laser.on ) {
        var tail = this.laser.emissionPoint;

        //Snell's law, see http://en.wikipedia.org/wiki/Snell's_law for definition of n1, n2, theta1, theta2
        //index in top medium
        var n1 = this.getN1();

        // index of bottom medium
        var n2 = this.getN2();

        // angle from the up vertical
        var theta1 = this.laser.getAngle() - Math.PI / 2;

        // angle from the down vertical
        var theta2 = Math.asin( n1 / n2 * Math.sin( theta1 ) );

        // start with full strength laser
        var sourcePower = 1.0;

        // cross section of incident light, used to compute wave widths
        var a = CHARACTERISTIC_LENGTH * 4;
        //This one fixes the input beam to be a fixed width independent of angle
        var sourceWaveWidth = a / 2;

        // according to http://en.wikipedia.org/wiki/Wavelength
        var color = this.laser.color.getColor();
        var wavelengthInTopMedium = this.laser.color.getWavelength() / n1;

        // calculated wave width of reflected and refracted wave width.
        // specially used in in wave Mode
        var trapeziumWidth = Math.abs( sourceWaveWidth / Math.sin( this.laser.getAngle() ) );

        // since the n1 depends on the wavelength, when you change the wavelength,
        // the wavelengthInTopMedium also changes (seemingly in the opposite direction)
        var incidentRay = new LightRay( trapeziumWidth, tail, new Vector2( 0, 0 ),
          n1, wavelengthInTopMedium, sourcePower, color, sourceWaveWidth,
          0.0, bottom, true, false );
        var rayAbsorbed = this.addAndAbsorb( incidentRay );
        if ( !rayAbsorbed ) {
          var thetaOfTotalInternalReflection = Math.asin( n2 / n1 );
          var hasTransmittedRay = isNaN( thetaOfTotalInternalReflection ) ||
                                  theta1 < thetaOfTotalInternalReflection;
          // reflected
          // assuming perpendicular beam polarization, compute percent power
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
            color, sourceWaveWidth,
            incidentRay.getNumberOfWavelengths(),
            bottom,
            true,
            true ) );

          // fire a transmitted ray if there wasn't total internal reflection
          if ( hasTransmittedRay ) {

            // transmitted
            // n2/n1 = L1/L2 => L2 = L1*n2/n1
            var transmittedWavelength = incidentRay.getWavelength() / n2 * n1;
            if ( isNaN( theta2 ) || !isFinite( theta2 ) ) {
            }
            else {
              var transmittedPowerRatio = this.getTransmittedPower( n1, n2, Math.cos( theta1 ), Math.cos( theta2 ) );

              // make the beam width depend on the input beam width, so that the same beam width is transmitted as was
              var beamHalfWidth = a / 2;
              var extentInterceptedHalfWidth = beamHalfWidth / Math.sin( Math.PI / 2 - theta1 ) / 2;
              var transmittedBeamHalfWidth = Math.cos( theta2 ) * extentInterceptedHalfWidth;
              var transmittedWaveWidth = transmittedBeamHalfWidth * 2;
              // intercepted
              var transmittedRay = new LightRay( trapeziumWidth, new Vector2( 0, 0 ),
                Vector2.createPolar( 1, theta2 - Math.PI / 2 ), n2,
                transmittedWavelength, transmittedPowerRatio * sourcePower,
                color, transmittedWaveWidth, incidentRay.getNumberOfWavelengths(),
                top, true, true ); //todo: using extendBackwards param to fix the shapes near y=0
              this.addAndAbsorb( transmittedRay );
            }
          }
        }

      }
    },

    /**
     * Get the top medium index of refraction
     *
     * @returns {number}
     */
    getN1: function() {
      return this.topMediumProperty.get().getIndexOfRefraction( this.laser.color.getWavelength() );
    },

    /**
     * Get the bottom medium index of refraction
     *
     * @returns {number}
     */
    getN2: function() {
      return this.bottomMediumProperty.get().getIndexOfRefraction( this.laser.color.getWavelength() );
    },

    /**
     * Checks whether the intensity meter should absorb the ray, and if so adds a truncated ray.
     * If the intensity meter misses the ray, the original ray is added.
     *
     * @param {LightRay} ray
     * @returns {boolean}
     */
    addAndAbsorb: function( ray ) {

      // find intersection points with the intensity sensor
      var intersects = ray.getIntersections( this.intensityMeter.getSensorShape() );

      // if it intersected, then absorb the ray
      var rayAbsorbed = this.intensityMeter.enabled && intersects.length > 0;
      if ( rayAbsorbed ) {
        if ( intersects !== null && intersects.length > 1 ) {
          var x = intersects[ 0 ].point.x + intersects[ 1 ].point.x;
          var y = intersects[ 0 ].point.y + intersects[ 1 ].point.y;
          var interrupted = new LightRay( ray.trapeziumWidth, ray.tail, new Vector2( x / 2, y / 2 ),
            ray.indexOfRefraction, ray.getWavelength(), ray.getPowerFraction(), this.laser.color.getColor(),
            ray.getWaveWidth(), ray.getNumWavelengthsPhaseOffset(), ray.oppositeMedium, false, ray.extendBackwards );

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
        this.intensityMeter.addRayReading( new Reading( ray.getPowerFraction() ) );
      }
      else {
        this.intensityMeter.addRayReading( Reading.MISS );
      }
      return rayAbsorbed;
    },

    /**
     * @public
     */
    resetAll: function() {
      BendingLightModel.prototype.resetAll.call( this );
      this.topMediumProperty.reset();
      this.bottomMediumProperty.reset();
    },

    /**
     * Determine the velocity of the topmost light ray at the specified position, if one exists, otherwise None
     *
     * @public
     * @param {Vector2} position
     * @returns {Vector2}
     */
    getVelocity: function( position ) {
      var laserViewProperty = this.laserViewProperty;
      var velocity = new Vector2( 0, 0 );
      this.rays.forEach( function( ray ) {
        if ( ray.contains( position, laserViewProperty.value === 'wave' ) ) {
          velocity = ray.getVelocityVector();
        }
      } );
      return velocity;
    },

    /**
     * Determine the wave value of the topmost light ray at the specified position, or None if none exists
     *
     * @public
     * @param {Vector2} position
     * @returns {*}
     */
    getWaveValue: function( position ) {
      var waveValue = null;
      var introModel = this;
      this.rays.forEach( function( ray ) {
        if ( ray.contains( position, introModel.laserViewProperty.value === 'wave' ) ) {

          // map power to displayed amplitude
          var amplitude = Math.sqrt( ray.getPowerFraction() );

          // find out how far the light has come, so we can compute the remainder of phases
          var rayUnitVector = ray.getUnitVector();
          var x = position.x - ray.tail.x;
          var y = position.y - ray.tail.y;
          var distanceAlongRay = rayUnitVector.x * x + rayUnitVector.y * y;
          var phase = ray.getCosArg( distanceAlongRay );

          // wave is a*cos(theta)
          waveValue = [ ray.getTime(), amplitude * Math.cos( phase + Math.PI ) ];
        }
      } );
      return waveValue;
    },

    /**
     * Called by the animation loop.
     */
    step: function() {

      if ( this.isPlaying ) {
        this.stepInternal();
        var particleDeltaFactor = this.speed === 'normal' ? 20 : 45;
        if ( this.laser.on && this.laserViewProperty.value === 'wave' ) {
          if ( !this.allowWebGL ) {
            this.propagateParticles( particleDeltaFactor );
          }
        }
      }
    },

    stepInternal: function() {
      this.time = this.time + (this.speed === 'normal' ? 1E-16 : 0.5E-16);
      var introModel = this;
      this.rays.forEach( function( ray ) {
        ray.setTime( introModel.time );
      } );
    },

    /**
     * add  a particle
     */
    addParticle: function() {
      var particleColor;
      var particleGradientColor;
      var lightRayToPropagate;
      for ( var k = 0; k < this.rays.length; k++ ) {
        lightRayToPropagate = this.rays.get( k );
        var angle = lightRayToPropagate.getAngle();
        particleColor = new Color( lightRayToPropagate.color.getRed(), lightRayToPropagate.color.getGreen(),
          lightRayToPropagate.color.getBlue(), Math.sqrt( lightRayToPropagate.getPowerFraction() ) );
        particleGradientColor = new Color( 0, 0, 0, Math.sqrt( lightRayToPropagate.getPowerFraction() ) );
        var viewWavelength = lightRayToPropagate.getWavelength();
        var vector = lightRayToPropagate.toVector2D();
        var directionVectorX = vector.x / vector.magnitude();
        var directionVectorY = vector.y / vector.magnitude();

        this.waveVector.x = directionVectorX * viewWavelength;
        this.waveVector.y = directionVectorY * viewWavelength;
        var particlePosition = new Vector2( 0, 0 );
        if ( k === 0 ) {

          //var lastX = lightRayToPropagate.particles.get( lightRayToPropagate.particles.length - 1 ).position.x;
          //var lastY = lightRayToPropagate.particles.get( lightRayToPropagate.particles.length - 1 ).position.y;
          //particlePosition.x = lastX - (directionVectorX * lightRayToPropagate.getWavelength());
          //particlePosition.y = lastY - (directionVectorY * lightRayToPropagate.getWavelength());
          particlePosition.x = lightRayToPropagate.tail.x;// - (directionVectorX * lightRayToPropagate.getWavelength());
          particlePosition.y = lightRayToPropagate.tail.y;// - (directionVectorY * lightRayToPropagate.getWavelength());
        }
        else {
          particlePosition.x = lightRayToPropagate.tail.x - (directionVectorX * lightRayToPropagate.trapeziumWidth / 2 * Math.cos( angle ));
          particlePosition.y = lightRayToPropagate.tail.y - (directionVectorY * lightRayToPropagate.trapeziumWidth / 2 * Math.cos( angle ));
        }
        lightRayToPropagate.particles.push( new WaveParticle(
          particlePosition,
          lightRayToPropagate.getWaveWidth(),
          particleColor.toCSS(),
          particleGradientColor.toCSS(),
          angle,
          this.waveVector.magnitude() ) );
      }
    },

    /**
     * create the particles between light ray tail and and tip
     */
    createInitialParticles: function() {
      var lightRayInRay2Form;
      var lightRayToPropagate;
      var particleColor;
      var particleGradientColor;
      var j;
      for ( var k = 0; k < this.rays.length; k++ ) {
        lightRayToPropagate = this.rays.get( k );
        var directionVector = lightRayToPropagate.toVector2D().normalized();
        var viewWavelength = lightRayToPropagate.getWavelength();
        var angle = lightRayToPropagate.getAngle();
        if ( k === 0 ) {
          this.tipVector.x = lightRayToPropagate.tip.x + directionVector.x * lightRayToPropagate.trapeziumWidth / 2 * Math.cos( angle );
          this.tipVector.y = lightRayToPropagate.tip.y + directionVector.y * lightRayToPropagate.trapeziumWidth / 2 * Math.cos( angle );
          this.tailVector.x = lightRayToPropagate.tail.x;
          this.tailVector.y = lightRayToPropagate.tail.y;
        }
        else {
          // magnitude * Math.cos( angle ), magnitude * Math.sin( angle )
          this.tipVector.x = ( 1 ) * Math.cos( angle );
          this.tipVector.y = ( 1 ) * Math.sin( angle );
          this.tailVector.x = lightRayToPropagate.tail.x -
                              (directionVector.x * lightRayToPropagate.trapeziumWidth / 2 * Math.cos( angle ) );
          this.tailVector.y = lightRayToPropagate.tail.y - ( directionVector.y * lightRayToPropagate.trapeziumWidth / 2 * Math.cos( angle ) );
        }
        lightRayInRay2Form = new Ray2( this.tailVector, directionVector );
        var distance = this.tipVector.distance( this.tailVector );
        var gapBetweenSuccessiveParticles = viewWavelength;
        particleColor = new Color( lightRayToPropagate.color.getRed(), lightRayToPropagate.color.getGreen(), lightRayToPropagate.color.getBlue(),
          Math.sqrt( lightRayToPropagate.getPowerFraction() ) ).toCSS();
        particleGradientColor = new Color( 0, 0, 0, Math.sqrt( lightRayToPropagate.getPowerFraction() ) ).toCSS();
        var numberOfParticles = Math.min( Math.ceil( distance / gapBetweenSuccessiveParticles ), 150 ) + 1;// : this.simDisplayWindowHeight;
        var waveParticleGap = 0;
        var particleWidth = lightRayToPropagate.getWaveWidth();

        for ( j = 0; j < numberOfParticles; j++ ) {
          lightRayToPropagate.particles.push( new WaveParticle( lightRayInRay2Form.pointAtDistance( waveParticleGap ), particleWidth, particleColor, particleGradientColor, angle, viewWavelength ) );
          waveParticleGap += gapBetweenSuccessiveParticles;
        }
      }

    },

    /**
     *
     * @param {number} particleDeltaFactor
     */
    propagateParticles: function( particleDeltaFactor ) {
      var particle;
      var particlesToRemove = [];
      var reflectedParticlesToRemove = [];
      var refractedParticlesToRemove = [];
      var waveParticles = [];
      for ( var i = 0; i < this.rays.length; i++ ) {
        var lightRayToPropagate = this.rays.get( i );
        var lightRayBounds = lightRayToPropagate.getWaveBounds();
        waveParticles = lightRayToPropagate.particles;
        var lightRayAngle = lightRayToPropagate.getAngle();
        var deltaX = lightRayToPropagate.wavelength / particleDeltaFactor * Math.cos( lightRayAngle );
        var deltaY = lightRayToPropagate.wavelength / particleDeltaFactor * Math.sin( lightRayAngle );
        waveParticles = lightRayToPropagate.particles;

        for ( var j = 0; j < waveParticles.length; j++ ) {
          particle = waveParticles.get( j );
          particle.position.x = particle.position.x + deltaX;
          particle.position.y = particle.position.y + deltaY;
          if ( (i === 0 && particle.position.y + particle.height <= lightRayBounds[ 3 ].y) &&
               (particle.position.x + particle.width / 2 * Math.abs( Math.sin( particle.angle ) ) - particle.height * Math.cos( particle.angle ) + 0.1 * particle.height) >= lightRayBounds[ 3 ].x ) {
            particlesToRemove.push( particle );
          }
          var yOffsetToDeleteParticle = 3 * particle.width;
          if ( i === 1 && particle.position.y >= this.simDisplayWindowHeightInModel / 2 + yOffsetToDeleteParticle ) {
            reflectedParticlesToRemove.push( particle );
          }
          if ( i === 2 && particle.position.y <= -this.simDisplayWindowHeightInModel / 2 - yOffsetToDeleteParticle ) {
            refractedParticlesToRemove.push( particle );
          }
        }
      }
      if ( particlesToRemove.length > 0 ) {
        this.rays.get( 0 ).particles.removeAll( particlesToRemove );
        this.addParticle();
      }
      if ( reflectedParticlesToRemove.length > 0 ) {
        this.rays.get( 1 ).particles.removeAll( reflectedParticlesToRemove );
      }
      if ( refractedParticlesToRemove.length > 0 ) {
        this.rays.get( 2 ).particles.removeAll( refractedParticlesToRemove );
      }
    }
  } );
} );