// Copyright 2015-2018, University of Colorado Boulder

/**
 * Model for the "intro" Screen, which has an upper and lower medium, interfacing at the middle of the screen,
 * and the laser at the top left shining toward the interface.  This is a subclass of BendingLightView.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var Color = require( 'SCENERY/util/Color' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntensityMeter = require( 'BENDING_LIGHT/common/model/IntensityMeter' );
  var LightRay = require( 'BENDING_LIGHT/common/model/LightRay' );
  var Medium = require( 'BENDING_LIGHT/common/model/Medium' );
  var Property = require( 'AXON/Property' );
  var Ray2 = require( 'DOT/Ray2' );
  var Reading = require( 'BENDING_LIGHT/common/model/Reading' );
  var Shape = require( 'KITE/Shape' );
  var Substance = require( 'BENDING_LIGHT/common/model/Substance' );
  var Vector2 = require( 'DOT/Vector2' );
  var WaveParticle = require( 'BENDING_LIGHT/common/model/WaveParticle' );

  // constants
  var CHARACTERISTIC_LENGTH = BendingLightConstants.WAVELENGTH_RED;

  // If the ray is too long in this step, then webgl will have rendering artifacts, see #147
  var BEAM_LENGTH = 1E-3;

  /**
   * @param {Substance} bottomSubstance - state of bottom medium
   * @param {boolean} horizontalPlayAreaOffset - specifies center alignment
   * @constructor
   */
  function IntroModel( bottomSubstance, horizontalPlayAreaOffset ) {

    var self = this;
    BendingLightModel.call( this, Math.PI * 3 / 4, true, BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT );

    // Top medium
    this.topMediumProperty = new Property( new Medium( Shape.rect( -0.1, 0, 0.2, 0.1 ), Substance.AIR,
      this.mediumColorFactory.getColor( Substance.AIR.indexOfRefractionForRedLight ) ), { reentrant: true } );

    // Bottom medium
    this.bottomMediumProperty = new Property( new Medium( Shape.rect( -0.1, -0.1, 0.2, 0.1 ), bottomSubstance,
      this.mediumColorFactory.getColor( bottomSubstance.indexOfRefractionForRedLight ) ), { reentrant: true } );
    this.time = 0; // @public

    // Update the top medium index of refraction when top medium change
    this.indexOfRefractionOfTopMediumProperty = new DerivedProperty( [
        this.topMediumProperty,
        self.laser.colorProperty
      ],
      function( topMedium, color ) {
        return topMedium.getIndexOfRefraction( color.wavelength );
      } ); // @public (read-only)

    // Update the bottom medium index of refraction when bottom medium change
    this.indexOfRefractionOfBottomMediumProperty = new DerivedProperty( [
        this.bottomMediumProperty,
        self.laser.colorProperty
      ],
      function( bottomMedium, color ) {
        return bottomMedium.getIndexOfRefraction( color.wavelength );
      } ); // @public (read-only)

    // @public (read-only)-model components
    this.intensityMeter = new IntensityMeter(
      -this.modelWidth * ( horizontalPlayAreaOffset ? 0.34 : 0.48 ),
      -this.modelHeight * 0.285,
      -this.modelWidth * ( horizontalPlayAreaOffset ? 0.282 : 0.421 ),
      -this.modelHeight * 0.312
    );

    Property.multilink( [
      this.laserViewProperty,
      this.laser.onProperty,
      this.intensityMeter.sensorPositionProperty,
      this.intensityMeter.enabledProperty,
      this.laser.emissionPointProperty,
      this.laser.colorProperty,
      this.indexOfRefractionOfBottomMediumProperty,
      this.indexOfRefractionOfTopMediumProperty
    ], function() {

      // clear the accumulator in the intensity meter so it can sum up the newly created rays
      self.intensityMeter.clearRayReadings();
      self.updateModel();
      if ( self.laserViewProperty.value === 'wave' && self.laser.onProperty.value ) {
        if ( !self.allowWebGL ) {
          self.createInitialParticles();
        }
      }
    } );

    // Note: vectors that are used in step function are created here to reduce Vector2 allocations
    // light ray tail position
    this.tailVector = new Vector2( 0, 0 ); // @private, for internal use only

    // light ray tip position
    this.tipVector = new Vector2( 0, 0 ); // @private, for internal use only

    // @public
    this.rotationArrowAngleOffset = -Math.PI / 4;
  }

  bendingLight.register( 'IntroModel', IntroModel );

  return inherit( BendingLightModel, IntroModel, {

    /**
     * Light rays were cleared from model before propagateRays was called, this creates them according to the laser and
     * mediums
     * @public
     */
    propagateRays: function() {

      if ( this.laser.onProperty.value ) {
        var tail = this.laser.emissionPointProperty.value;

        // Snell's law, see http://en.wikipedia.org/wiki/Snell's_law for definition of n1, n2, theta1, theta2
        // index in top medium
        var n1 = this.indexOfRefractionOfTopMediumProperty.get();

        // index of bottom medium
        var n2 = this.indexOfRefractionOfBottomMediumProperty.get();

        // angle from the up vertical
        var theta1 = this.laser.getAngle() - Math.PI / 2;

        // angle from the down vertical
        var theta2 = Math.asin( n1 / n2 * Math.sin( theta1 ) );

        // start with full strength laser
        var sourcePower = 1.0;

        // cross section of incident light, used to compute wave widths
        var a = CHARACTERISTIC_LENGTH * 4;

        // This one fixes the input beam to be a fixed width independent of angle
        var sourceWaveWidth = a / 2;

        // according to http://en.wikipedia.org/wiki/Wavelength
        var color = this.laser.colorProperty.get().getColor();
        var wavelengthInTopMedium = this.laser.colorProperty.get().wavelength / n1;

        // calculated wave width of reflected and refracted wave width.
        // specially used in in wave Mode
        var trapeziumWidth = Math.abs( sourceWaveWidth / Math.sin( this.laser.getAngle() ) );

        // since the n1 depends on the wavelength, when you change the wavelength,
        // the wavelengthInTopMedium also changes (seemingly in the opposite direction)
        var incidentRay = new LightRay( trapeziumWidth, tail, new Vector2( 0, 0 ), n1, wavelengthInTopMedium,
          this.laser.getWavelength() * 1E9, sourcePower, color, sourceWaveWidth, 0.0, true, false, this.laserViewProperty.value, 'incident' );

        var rayAbsorbed = this.addAndAbsorb( incidentRay, 'incident' );
        if ( !rayAbsorbed ) {
          var thetaOfTotalInternalReflection = Math.asin( n2 / n1 );
          var hasTransmittedRay = isNaN( thetaOfTotalInternalReflection ) ||
                                  theta1 < thetaOfTotalInternalReflection;

          // reflected
          // assuming perpendicular beam polarization, compute percent power
          var reflectedPowerRatio;
          if ( hasTransmittedRay ) {
            reflectedPowerRatio = BendingLightModel.getReflectedPower( n1, n2, Math.cos( theta1 ), Math.cos( theta2 ) );
          }
          else {
            reflectedPowerRatio = 1.0;
          }

          // If nothing is transmitted, do not create a 0 power transmitted ray, see #296
          if ( reflectedPowerRatio === 1.0 ) {
            hasTransmittedRay = false;
          }

          // make sure it has enough power to show up on the intensity meter, after rounding
          var hasReflectedRay = reflectedPowerRatio >= 0.005;
          if ( hasReflectedRay ) {
            var reflectedRay = new LightRay(
              trapeziumWidth,
              new Vector2( 0, 0 ),
              Vector2.createPolar( BEAM_LENGTH, Math.PI - this.laser.getAngle() ),
              n1,
              wavelengthInTopMedium,
              this.laser.getWavelength() * 1E9,
              reflectedPowerRatio * sourcePower,
              color,
              sourceWaveWidth,
              incidentRay.getNumberOfWavelengths(),
              true,
              true, this.laserViewProperty.value, 'reflected'
            );
            this.addAndAbsorb( reflectedRay, 'reflected' );
          }
          else {
            reflectedPowerRatio = 0;
          }

          // fire a transmitted ray if there wasn't total internal reflection
          if ( hasTransmittedRay ) {

            // transmitted
            // n2/n1 = L1/L2 => L2 = L1*n2/n1
            var transmittedWavelength = incidentRay.wavelength / n2 * n1;
            if ( !( isNaN( theta2 ) || !isFinite( theta2 ) ) ) {
              var transmittedPowerRatio = BendingLightModel.getTransmittedPower(
                n1,
                n2,
                Math.cos( theta1 ),
                Math.cos( theta2 )
              );
              if ( !hasReflectedRay ) {
                transmittedPowerRatio = 1;
              }

              // make the beam width depend on the input beam width, so that the same beam width is transmitted as was
              // intercepted
              var beamHalfWidth = a / 2;
              var extentInterceptedHalfWidth = beamHalfWidth / Math.sin( Math.PI / 2 - theta1 ) / 2;
              var transmittedBeamHalfWidth = Math.cos( theta2 ) * extentInterceptedHalfWidth;
              var transmittedWaveWidth = transmittedBeamHalfWidth * 2;
              var transmittedRay = new LightRay(
                trapeziumWidth,
                new Vector2( 0, 0 ),
                Vector2.createPolar( BEAM_LENGTH, theta2 - Math.PI / 2 ),
                n2,
                transmittedWavelength,
                this.laser.getWavelength() * 1E9,
                transmittedPowerRatio * sourcePower,
                color,
                transmittedWaveWidth,
                incidentRay.getNumberOfWavelengths(),
                true,
                true,
                this.laserViewProperty.value, 'transmitted' );
              this.addAndAbsorb( transmittedRay, 'transmitted' );
            }
          }
        }
      }
    },

    /**
     * Checks whether the intensity meter should absorb the ray, and if so adds a truncated ray.
     * If the intensity meter misses the ray, the original ray is added.
     * @private
     * @param {LightRay} ray - model of light ray
     * @param {string} rayType - 'incident', 'transmitted' or 'reflected'
     * @returns {boolean}
     */
    addAndAbsorb: function( ray, rayType ) {
      var angleOffset = rayType === 'incident' ? Math.PI : 0;

      // find intersection points with the intensity sensor
      var intersects = this.intensityMeter.enabledProperty.value ?
                       ray.getIntersections( this.intensityMeter.getSensorShape(), rayType ) : [];

      // if it intersected, then absorb the ray
      var rayAbsorbed = intersects.length > 0;
      if ( rayAbsorbed ) {
        var x;
        var y;
        assert && assert( intersects.length <= 2, 'too many intersections' );
        if ( intersects.length === 1 ) {

          // intersect point at sensor shape start position when laser within sensor region
          x = intersects[ 0 ].point.x;
          y = intersects[ 0 ].point.y;
        }
        if ( intersects.length === 2 ) {
          x = ( intersects[ 0 ].point.x + intersects[ 1 ].point.x ) / 2;
          y = ( intersects[ 0 ].point.y + intersects[ 1 ].point.y ) / 2;
        }

        var distance = Math.sqrt( x * x + y * y );
        var interrupted = new LightRay(
          ray.trapeziumWidth,
          ray.tail,
          Vector2.createPolar( distance, ray.getAngle() + angleOffset ),
          ray.indexOfRefraction,
          ray.wavelength,
          this.laser.getWavelength() * 1E9,
          ray.powerFraction,
          this.laser.colorProperty.get().getColor(),
          ray.waveWidth,
          ray.numWavelengthsPhaseOffset,
          false,
          ray.extendBackwards,
          this.laserViewProperty.value,
          rayType
        );

        // don't let the wave intersect the intensity meter if it is behind the laser emission point
        var isForward = ray.toVector().dot( interrupted.toVector() ) > 0;
        if ( interrupted.getLength() < ray.getLength() && isForward ) {
          this.addRay( interrupted );
        }
        else {
          this.addRay( ray );
          rayAbsorbed = false;
        }
      }
      else {
        this.addRay( ray );
      }
      if ( rayAbsorbed ) {
        this.intensityMeter.addRayReading( new Reading( ray.powerFraction ) );
      }
      else {
        this.intensityMeter.addRayReading( Reading.MISS );
      }
      return rayAbsorbed;
    },

    /**
     * @public
     * @override
     */
    reset: function() {
      BendingLightModel.prototype.reset.call( this );
      this.topMediumProperty.reset();
      this.bottomMediumProperty.reset();
      this.intensityMeter.reset();
    },

    /**
     * Determine the velocity of the topmost light ray at the specified position, if one exists, otherwise None
     * @public
     * @param {Vector2} position - position where the velocity to be determined
     * @returns {Vector2}
     */
    getVelocity: function( position ) {
      var laserView = this.laserViewProperty.value;
      for ( var i = 0; i < this.rays.length; i++ ) {
        if ( this.rays.get( i ).contains( position, laserView === 'wave' ) ) {
          return this.rays.get( i ).getVelocityVector();
        }
      }
      return new Vector2( 0, 0 );
    },

    /**
     * Determine the wave value of the topmost light ray at the specified position, or None if none exists
     * @public
     * @param {Vector2} position - position where the wave value to be determined
     * @returns {Object|null}- returns object of time and magnitude if point is on ray otherwise returns null
     */
    getWaveValue: function( position ) {
      var self = this;
      for ( var i = 0; i < this.rays.length; i++ ) {
        var ray = this.rays.get( i );
        if ( ray.contains( position, self.laserViewProperty.value === 'wave' ) ) {

          // map power to displayed amplitude
          var amplitude = Math.sqrt( ray.powerFraction );

          // find out how far the light has come, so we can compute the remainder of phases
          var rayUnitVector = ray.getUnitVector();
          var x = position.x - ray.tail.x;
          var y = position.y - ray.tail.y;
          var distanceAlongRay = rayUnitVector.x * x + rayUnitVector.y * y;
          var phase = ray.getCosArg( distanceAlongRay );

          // wave is a*cos(theta)
          return { time: ray.time, magnitude: amplitude * Math.cos( phase + Math.PI ) };
        }
      }
      return null;
    },

    /**
     * Called by the animation loop.
     * @protected
     */
    step: function() {

      if ( this.isPlayingProperty.value ) {
        this.updateSimulationTimeAndWaveShape( this.speedProperty.value );
      }
    },

    /**
     * Update simulation time and wave propagation.
     * @public
     */
    updateSimulationTimeAndWaveShape: function( speed ) {

      // Update the time
      this.time = this.time + ( speed === 'normal' ? 1E-16 : 0.5E-16 );
      var self = this;

      // set time for each ray
      this.rays.forEach( function( ray ) {
        ray.setTime( self.time );
      } );
      if ( this.laser.onProperty.value && this.laserViewProperty.value === 'wave' ) {
        if ( !this.allowWebGL ) {
          this.propagateParticles();
        }
      }
    },

    /**
     * create the particles between light ray tail and and tip
     * @private
     */
    createInitialParticles: function() {

      var particleColor;
      var particleGradientColor;
      var j;
      for ( var k = 0; k < this.rays.length; k++ ) {
        var lightRay = this.rays.get( k );
        var directionVector = lightRay.getUnitVector();
        var wavelength = lightRay.wavelength;
        var angle = lightRay.getAngle();
        if ( k === 0 ) {

          // calculating tip and tail for incident ray
          this.tipVector.x = lightRay.tip.x + directionVector.x * lightRay.trapeziumWidth / 2 * Math.cos( angle );
          this.tipVector.y = lightRay.tip.y + directionVector.y * lightRay.trapeziumWidth / 2 * Math.cos( angle );
          this.tailVector.x = lightRay.tail.x;
          this.tailVector.y = lightRay.tail.y;
        }
        else {

          // calculating tip and tail for reflected and refracted rays
          this.tipVector.x = ( 1 ) * Math.cos( angle );
          this.tipVector.y = ( 1 ) * Math.sin( angle );
          this.tailVector.x = lightRay.tail.x - directionVector.x * lightRay.trapeziumWidth / 2 * Math.cos( angle );
          this.tailVector.y = lightRay.tail.y - directionVector.y * lightRay.trapeziumWidth / 2 * Math.cos( angle );
        }
        var lightRayInRay2Form = new Ray2( this.tailVector, directionVector );
        var distance = this.tipVector.distance( this.tailVector );
        var gapBetweenSuccessiveParticles = wavelength;
        particleColor = new Color( lightRay.color.getRed(), lightRay.color.getGreen(), lightRay.color.getBlue(),
          Math.sqrt( lightRay.powerFraction ) ).toCSS();
        particleGradientColor = new Color( 0, 0, 0, Math.sqrt( lightRay.powerFraction ) ).toCSS();

        // calculate the number of particles that can fit in the distance
        var numberOfParticles = Math.min( Math.ceil( distance / gapBetweenSuccessiveParticles ), 150 ) + 1;
        var waveParticleGap = 0;

        // create the wave particles
        for ( j = 0; j < numberOfParticles; j++ ) {
          lightRay.particles.push( new WaveParticle( lightRayInRay2Form.pointAtDistance( waveParticleGap ),
            lightRay.waveWidth, particleColor, particleGradientColor, angle, wavelength ) );
          waveParticleGap += gapBetweenSuccessiveParticles;
        }
      }
    },

    /**
     * Propagate the particles
     * @private
     */
    propagateParticles: function() {

      for ( var i = 0; i < this.rays.length; i++ ) {
        var lightRay = this.rays.get( i );
        var wavelength = lightRay.wavelength;
        var directionVector = lightRay.getUnitVector();
        var waveParticles = lightRay.particles;

        // Compute the total phase along the length of the ray.
        var totalPhaseOffsetInNumberOfWavelengths = lightRay.getPhaseOffset() / 2 / Math.PI;

        // Just keep the fractional part
        var phaseDiff = ( totalPhaseOffsetInNumberOfWavelengths % 1 ) * wavelength;
        var tailX;
        var tailY;
        var angle = lightRay.getAngle();
        if ( i === 0 ) {

          // for incident ray
          tailX = lightRay.tail.x;
          tailY = lightRay.tail.y;
        }
        else {

          // for reflected and refracted ray
          var distance = lightRay.trapeziumWidth / 2 * Math.cos( angle );
          phaseDiff = ( distance + phaseDiff ) % wavelength;
          tailX = lightRay.tail.x - ( directionVector.x * lightRay.trapeziumWidth / 2 * Math.cos( angle ) );
          tailY = lightRay.tail.y - ( directionVector.y * lightRay.trapeziumWidth / 2 * Math.cos( angle ) );
        }

        // Changing the wave particle position within the wave particle phase
        for ( var j = 0; j < waveParticles.length; j++ ) {
          var particle = waveParticles.get( j );
          particle.setX( tailX + ( directionVector.x * ( ( j * wavelength ) + phaseDiff ) ) );
          particle.setY( tailY + ( directionVector.y * ( ( j * wavelength ) + phaseDiff ) ) );
        }
      }
    }
  } );
} );