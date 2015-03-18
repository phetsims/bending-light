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
  var Reading = require( 'BENDING_LIGHT/common/model/Reading' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var EventTimer = require( 'PHET_CORE/EventTimer' );
  var WaveParticle = require( 'BENDING_LIGHT/common/model/WaveParticle' );
  var Ray2 = require( 'DOT/Ray2' );
  var Color = require( 'SCENERY/util/Color' );

  // var MISS = IntensityMeter.Reading.MISS;
  var CHARACTERISTIC_LENGTH = 650E-9;

  /**
   *
   * @param bottomMediumState
   * @constructor
   */
  function IntroModel( bottomMediumState ) {
    var introModel = this;
    BendingLightModel.call( this, Math.PI * 3 / 4, true, BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT );
    this.mediumColorFactory = new MediumColorFactory();
    this.topMedium = new Property( new Medium( Shape.rect( -1, 0, 2, 1 ), BendingLightModel.AIR,
      this.mediumColorFactory.getColor( BendingLightModel.AIR.getIndexOfRefractionForRedLight() ) ) );
    this.bottomMedium = new Property( new Medium( Shape.rect( -1, -0.001, 2, 0.001 ), bottomMediumState,
      this.mediumColorFactory.getColor( bottomMediumState.getIndexOfRefractionForRedLight() ) ) );

    this.waveParticles = new ObservableArray();
    this.reflectedWaveParticles = new ObservableArray();
    this.refractedWaveParticles = new ObservableArray();
    Property.multilink( [ this.laserViewProperty, this.laser.onProperty, this.intensityMeter.sensorPositionProperty,
      this.laser.emissionPointProperty, this.topMedium, this.bottomMedium, this.laser.pivotProperty, this.laser.emissionPointProperty,
      this.intensityMeter.enabledProperty, this.laser.colorProperty
    ], function() {
      introModel.updateModel();
      introModel.waveParticles.clear();
      introModel.reflectedWaveParticles.clear();
      introModel.refractedWaveParticles.clear();
      if ( introModel.laserViewProperty.value === 'wave' && introModel.laser.onProperty.value ) {
        introModel.createInitialsParticles();
      }
    } );

    this.simDisplayWindowHeight = 504;
    this.simDisplayWindowHeightInModel = 0;
    // call stepInternal at a rate of 10 times per second
    this.timer = new EventTimer( new EventTimer.ConstantEventModel( 1, Math.random ), function() {
      if ( introModel.laser.on && introModel.laserViewProperty.value === 'wave' ) {
        introModel.addParticle();
      }
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
        var color = this.laser.color.getColor();
        var wavelengthInTopMedium = this.laser.color.getWavelength() / n1;

        // calculated wave width of reflected and refracted wave width.
        // specially used in in wave Mode
        //var initialPoint = this.laser.emissionPoint;
        // var finalPoint = this.laser.pivot;
        /* var angle = new Vector2( finalPoint.x - initialPoint.x,
         finalPoint.y - initialPoint.y ).angle();*/
        var trapeziumWidth = Math.abs( sourceWaveWidth / Math.sin( this.laser.getAngle() ) );

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
                top, true, false ); //todo: using extendBackwards param to fix the shapes near y=0
              this.addAndAbsorb( transmittedRay );
            }
          }
        }

      }
    },
    //Get the top medium index of refraction

    getN1: function() {
      return this.topMedium.get().getIndexOfRefraction( this.laser.color.getWavelength() );
    },
    //Get the bottom medium index of refraction

    getN2: function() {
      return this.bottomMedium.get().getIndexOfRefraction( this.laser.color.getWavelength() );
    },
    /**
     * Checks whether the intensity meter should absorb the ray, and if so adds a truncated ray.
     * If the intensity meter misses the ray, the original ray is added.
     * @param ray
     * @returns {*}
     */
    addAndAbsorb: function( ray ) {
      //Find intersection points with the intensity sensor
      var intersects = ray.getIntersections( this.intensityMeter.getSensorShape() );
      //If it intersected, then absorb the ray
      var rayAbsorbed = this.intensityMeter.enabled && intersects.length > 0;
      if ( rayAbsorbed ) {
        if ( intersects !== null && intersects.length > 1 ) {
          var x = intersects[ 0 ].point.x + intersects[ 1 ].point.x;
          var y = intersects[ 0 ].point.y + intersects[ 1 ].point.y;
          var interrupted = new LightRay( ray.trapeziumWidth, ray.tail, new Vector2( x / 2, y / 2 ),
            ray.indexOfRefraction, ray.getWavelength(), ray.getPowerFraction(), this.laser.color.getColor(), ray.getWaveWidth(), ray.getNumWavelengthsPhaseOffset(), ray.oppositeMedium, false, ray.extendBackwards );
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
    },
    /**
     * Called by the animation loop.
     * @param {Number} dt -- time in seconds
     */
    step: function( dt ) {
      // prevent sudden dt bursts when the user comes back to the tab after a while
      dt = ( dt > 0.04 ) ? 0.04 : dt;

      if ( this.isPlaying ) {
        var adjustedDT = this.speed === 'normal' ? dt : dt * 0.33;
        this.timer.step( adjustedDT );
        if ( this.laser.on ) {
          this.propagateParticles( adjustedDT );
        }

      }
    },

    // add  a particle
    addParticle: function() {
      var particleColor;
      var lightRayToPropagate;
      for ( var k = 0; k < this.rays.length; k++ ) {
        lightRayToPropagate = this.rays.get( k );
        var angle = lightRayToPropagate.extendBackwards ? Math.abs( lightRayToPropagate.getAngle() ) : Math.PI / 2;
        particleColor = new Color( 0, 0, 0, Math.sqrt( lightRayToPropagate.getPowerFraction() ) );
        if ( k === 0 ) {
          this.waveParticles.push( new WaveParticle( this.laser.emissionPoint, lightRayToPropagate.getWaveWidth(), particleColor.toCSS(), angle ) );
        }
        if ( k === 1 ) {
          this.reflectedWaveParticles.push( new WaveParticle( this.laser.pivot, lightRayToPropagate.trapeziumWidth, particleColor.toCSS(), angle ) );
        }
        if ( k === 2 ) {
          this.refractedWaveParticles.push( new WaveParticle( this.laser.pivot, lightRayToPropagate.trapeziumWidth, particleColor.toCSS(), angle ) );

        }
      }
    },
    // create the particles between light ray tail and and tip
    createInitialsParticles: function() {
      var lightRayInRay2Form;
      var lightRayToPropagate;
      var particleColor;
      var j;
      for ( var k = 0; k < this.rays.length; k++ ) {
        lightRayToPropagate = this.rays.get( k );
        var tip = k === 0 ? Vector2.createPolar( 1, lightRayToPropagate.getAngle() ) : lightRayToPropagate.tip;
        lightRayInRay2Form = new Ray2( lightRayToPropagate.tail, tip );
        //var startPoint = lightRayToPropagate.tail;
        // var endPoint = lightRayToPropagate.tip;
        //  var distance = endPoint.distance( startPoint );
        var newDistance = 5.597222222222222e-7;
        var angle = lightRayToPropagate.extendBackwards ? Math.abs( lightRayToPropagate.getAngle() ) : Math.PI / 2;
        particleColor = new Color( 0, 0, 0, Math.sqrt( lightRayToPropagate.getPowerFraction() ) );
        var numberOfParticles = ( k === 0 ) ? 10 : this.simDisplayWindowHeight;
        var typesOfParticles = [ this.waveParticles, this.reflectedWaveParticles, this.refractedWaveParticles ];
        for ( j = 0; j < numberOfParticles; j++ ) {
          typesOfParticles[ k ].push( new WaveParticle( lightRayInRay2Form.pointAtDistance( newDistance ), lightRayToPropagate.getWaveWidth(), particleColor.toCSS(), angle ) );
          newDistance += 5.597222222222222e-7;
        }
      }

    },


    /**
     * propagates the particles.
     */
    propagateParticles: function() {
      var particle;
      var delta;
      var particlesToRemove = [];
      var reflectedParticlesToRemove = [];
      var refractionParticleToRemove = [];
      var typesOfParticles = [ this.waveParticles, this.reflectedWaveParticles, this.refractedWaveParticles ];
      for ( var i = 0; i < this.rays.length; i++ ) {
        delta = Vector2.createPolar( this.rays.get( i ).wavelength / 20, this.rays.get( i ).getAngle() );
        for ( var j = 0; j < typesOfParticles[ i ].length; j++ ) {
          particle = typesOfParticles[ i ].get( j );
          particle.position = particle.position.plus( delta );
          if ( particle.position.y <= 0 && i === 0 ) {
            particlesToRemove.push( particle );
          }
          if ( i === 1 && particle.position.y >= Math.abs( this.simDisplayWindowHeightInModel / 2 ) ) {
            reflectedParticlesToRemove.push( particle );
          }
          if ( i === 2 && particle.position.y <= this.simDisplayWindowHeightInModel / 2 ) {
            refractionParticleToRemove.push( particle );
          }
        }
      }
      if ( particlesToRemove.length > 0 ) {
        this.waveParticles.removeAll( particlesToRemove );
      }
      if ( reflectedParticlesToRemove.length > 0 ) {
        this.reflectedWaveParticles.removeAll( particlesToRemove );
      }
      if ( refractionParticleToRemove.length > 0 ) {
        this.refractedWaveParticles.removeAll( particlesToRemove );
      }

    }
  } );
} );
