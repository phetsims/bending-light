// Copyright 2015-2021, University of Colorado Boulder

/**
 * Model for the "intro" Screen, which has an upper and lower medium, interfacing at the middle of the screen,
 * and the laser at the top left shining toward the interface.  This is a subclass of BendingLightScreenView.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Ray2 from '../../../../dot/js/Ray2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Color from '../../../../scenery/js/util/Color.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import BendingLightModel from '../../common/model/BendingLightModel.js';
import IntensityMeter from '../../common/model/IntensityMeter.js';
import LightRay from '../../common/model/LightRay.js';
import Medium from '../../common/model/Medium.js';
import Reading from '../../common/model/Reading.js';
import Substance from '../../common/model/Substance.js';
import WaveParticle from '../../common/model/WaveParticle.js';

// constants
const CHARACTERISTIC_LENGTH = BendingLightConstants.WAVELENGTH_RED;

// If the ray is too long in this step, then webgl will have rendering artifacts, see #147
const BEAM_LENGTH = 1E-3;

class IntroModel extends BendingLightModel {

  /**
   * @param {Substance} bottomSubstance - state of bottom medium
   * @param {boolean} horizontalPlayAreaOffset - specifies center alignment
   * @param {Tandem} tandem
   */
  constructor( bottomSubstance, horizontalPlayAreaOffset, tandem ) {

    super( Math.PI * 3 / 4, true, BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT );

    // Top medium
    // TODO: Split this into topSubstanceProperty for phet-io
    const topMedium = new Medium( Shape.rect( -0.1, 0, 0.2, 0.1 ), Substance.AIR,
      this.mediumColorFactory.getColor( Substance.AIR.indexOfRefractionForRedLight ) );
    this.topMediumProperty = new Property( topMedium, {
      reentrant: true,
      tandem: tandem.createTandem( 'topMediumProperty' ),
      phetioType: Property.PropertyIO( Medium.MediumIO )
    } );

    // Bottom medium
    const bottomMedium = new Medium( Shape.rect( -0.1, -0.1, 0.2, 0.1 ), bottomSubstance,
      this.mediumColorFactory.getColor( bottomSubstance.indexOfRefractionForRedLight ) );
    this.bottomMediumProperty = new Property( bottomMedium, {
      reentrant: true,
      tandem: tandem.createTandem( 'bottomMediumProperty' ),
      phetioType: Property.PropertyIO( Medium.MediumIO )
    } );
    this.time = 0; // @public

    // Update the top medium index of refraction when top medium change
    // @public (read-only)
    this.indexOfRefractionOfTopMediumProperty = new DerivedProperty( [
        this.topMediumProperty,
        this.laser.colorProperty
      ],
      ( topMedium, color ) => topMedium.getIndexOfRefraction( color.wavelength ), {
        tandem: tandem.createTandem( 'indexOfRefractionOfTopMediumProperty' ),
        phetioType: DerivedProperty.DerivedPropertyIO( NumberIO )
      } );

    // Update the bottom medium index of refraction when bottom medium change
    // @public (read-only)
    this.indexOfRefractionOfBottomMediumProperty = new DerivedProperty( [
        this.bottomMediumProperty,
        this.laser.colorProperty
      ],
      ( bottomMedium, color ) => bottomMedium.getIndexOfRefraction( color.wavelength ), {
        tandem: tandem.createTandem( 'indexOfRefractionOfBottomMediumProperty' ),
        phetioType: DerivedProperty.DerivedPropertyIO( NumberIO )
      } );

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
    ], () => {

      // clear the accumulator in the intensity meter so it can sum up the newly created rays
      this.intensityMeter.clearRayReadings();
      this.updateModel();
      if ( this.laserViewProperty.value === 'wave' && this.laser.onProperty.value ) {
        if ( !this.allowWebGL ) {
          this.createInitialParticles();
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

  /**
   * Light rays were cleared from model before propagateRays was called, this creates them according to the laser and
   * mediums
   * @public
   */
  propagateRays() {
    if ( this.laser.onProperty.value ) {
      const tail = this.laser.emissionPointProperty.value;

      // Snell's law, see http://en.wikipedia.org/wiki/Snell's_law for definition of n1, n2, theta1, theta2
      // index in top medium
      const n1 = this.indexOfRefractionOfTopMediumProperty.get();

      // index of bottom medium
      const n2 = this.indexOfRefractionOfBottomMediumProperty.get();

      // angle from the up vertical
      const theta1 = this.laser.getAngle() - Math.PI / 2;

      // angle from the down vertical
      const theta2 = Math.asin( n1 / n2 * Math.sin( theta1 ) );

      // start with full strength laser
      const sourcePower = 1.0;

      // cross section of incident light, used to compute wave widths
      const a = CHARACTERISTIC_LENGTH * 4;

      // This one fixes the input beam to be a fixed width independent of angle
      const sourceWaveWidth = a / 2;

      // according to http://en.wikipedia.org/wiki/Wavelength
      const color = this.laser.colorProperty.get().getColor();
      const wavelengthInTopMedium = this.laser.colorProperty.get().wavelength / n1;

      // calculated wave width of reflected and refracted wave width.
      // specially used in in wave Mode
      const trapeziumWidth = Math.abs( sourceWaveWidth / Math.sin( this.laser.getAngle() ) );

      // since the n1 depends on the wavelength, when you change the wavelength,
      // the wavelengthInTopMedium also changes (seemingly in the opposite direction)
      const incidentRay = new LightRay( trapeziumWidth, tail, new Vector2( 0, 0 ), n1, wavelengthInTopMedium,
        this.laser.getWavelength() * 1E9, sourcePower, color, sourceWaveWidth, 0.0, true, false, this.laserViewProperty.value, 'incident' );

      const rayAbsorbed = this.addAndAbsorb( incidentRay, 'incident' );
      if ( !rayAbsorbed ) {
        const thetaOfTotalInternalReflection = Math.asin( n2 / n1 );
        let hasTransmittedRay = isNaN( thetaOfTotalInternalReflection ) ||
                                theta1 < thetaOfTotalInternalReflection;

        // reflected
        // assuming perpendicular beam polarization, compute percent power
        let reflectedPowerRatio;
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
        const hasReflectedRay = reflectedPowerRatio >= 0.005;
        if ( hasReflectedRay ) {
          const reflectedRay = new LightRay(
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
          const transmittedWavelength = incidentRay.wavelength / n2 * n1;
          if ( !( isNaN( theta2 ) || !isFinite( theta2 ) ) ) {
            let transmittedPowerRatio = BendingLightModel.getTransmittedPower(
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
            const beamHalfWidth = a / 2;
            const extentInterceptedHalfWidth = beamHalfWidth / Math.sin( Math.PI / 2 - theta1 ) / 2;
            const transmittedBeamHalfWidth = Math.cos( theta2 ) * extentInterceptedHalfWidth;
            const transmittedWaveWidth = transmittedBeamHalfWidth * 2;
            const transmittedRay = new LightRay(
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
  }

  /**
   * Checks whether the intensity meter should absorb the ray, and if so adds a truncated ray.
   * If the intensity meter misses the ray, the original ray is added.
   * @private
   * @param {LightRay} ray - model of light ray
   * @param {string} rayType - 'incident', 'transmitted' or 'reflected'
   * @returns {boolean}
   */
  addAndAbsorb( ray, rayType ) {
    const angleOffset = rayType === 'incident' ? Math.PI : 0;

    // find intersection points with the intensity sensor
    const intersects = this.intensityMeter.enabledProperty.value ?
                       ray.getIntersections( this.intensityMeter.getSensorShape(), rayType ) : [];

    // if it intersected, then absorb the ray
    let rayAbsorbed = intersects.length > 0;
    if ( rayAbsorbed ) {
      let x;
      let y;
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

      const distance = Math.sqrt( x * x + y * y );
      const interrupted = new LightRay(
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
      const isForward = ray.toVector().dot( interrupted.toVector() ) > 0;
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
  }

  /**
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.topMediumProperty.reset();
    this.bottomMediumProperty.reset();
    this.intensityMeter.reset();
  }

  /**
   * Determine the velocity of the topmost light ray at the specified position, if one exists, otherwise None
   * @public
   * @param {Vector2} position - position where the velocity to be determined
   * @returns {Vector2}
   */
  getVelocity( position ) {
    const laserView = this.laserViewProperty.value;
    for ( let i = 0; i < this.rays.length; i++ ) {
      if ( this.rays.get( i ).contains( position, laserView === 'wave' ) ) {
        return this.rays.get( i ).getVelocityVector();
      }
    }
    return new Vector2( 0, 0 );
  }

  /**
   * Determine the wave value of the topmost light ray at the specified position, or None if none exists
   * @public
   * @param {Vector2} position - position where the wave value to be determined
   * @returns {Object|null}- returns object of time and magnitude if point is on ray otherwise returns null
   */
  getWaveValue( position ) {
    for ( let i = 0; i < this.rays.length; i++ ) {
      const ray = this.rays.get( i );
      if ( ray.contains( position, this.laserViewProperty.value === 'wave' ) ) {

        // map power to displayed amplitude
        const amplitude = Math.sqrt( ray.powerFraction );

        // find out how far the light has come, so we can compute the remainder of phases
        const rayUnitVector = ray.getUnitVector();
        const x = position.x - ray.tail.x;
        const y = position.y - ray.tail.y;
        const distanceAlongRay = rayUnitVector.x * x + rayUnitVector.y * y;
        const phase = ray.getCosArg( distanceAlongRay );

        // wave is a*cos(theta)
        return { time: ray.time, magnitude: amplitude * Math.cos( phase + Math.PI ) };
      }
    }
    return null;
  }

  /**
   * Called by the animation loop.
   * @protected
   */
  step() {

    if ( this.isPlayingProperty.value ) {
      this.updateSimulationTimeAndWaveShape( this.speedProperty.value );
    }
  }

  /**
   * Update simulation time and wave propagation.
   * @public
   */
  updateSimulationTimeAndWaveShape( speed ) {

    // Update the time
    this.time = this.time + ( speed === TimeSpeed.NORMAL ? 1E-16 : 0.5E-16 );

    // set time for each ray
    this.rays.forEach( ray => ray.setTime( this.time ) );
    if ( this.laser.onProperty.value && this.laserViewProperty.value === 'wave' ) {
      if ( !this.allowWebGL ) {
        this.propagateParticles();
      }
    }
  }

  /**
   * create the particles between light ray tail and and tip
   * @private
   */
  createInitialParticles() {

    let particleColor;
    let particleGradientColor;
    let j;
    for ( let k = 0; k < this.rays.length; k++ ) {
      const lightRay = this.rays.get( k );
      const directionVector = lightRay.getUnitVector();
      const wavelength = lightRay.wavelength;
      const angle = lightRay.getAngle();
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
      const lightRayInRay2Form = new Ray2( this.tailVector, directionVector );
      const distance = this.tipVector.distance( this.tailVector );
      const gapBetweenSuccessiveParticles = wavelength;
      particleColor = new Color( lightRay.color.getRed(), lightRay.color.getGreen(), lightRay.color.getBlue(),
        Math.sqrt( lightRay.powerFraction ) ).toCSS();
      particleGradientColor = new Color( 0, 0, 0, Math.sqrt( lightRay.powerFraction ) ).toCSS();

      // calculate the number of particles that can fit in the distance
      const numberOfParticles = Math.min( Math.ceil( distance / gapBetweenSuccessiveParticles ), 150 ) + 1;
      let waveParticleGap = 0;

      // create the wave particles
      for ( j = 0; j < numberOfParticles; j++ ) {
        lightRay.particles.push( new WaveParticle( lightRayInRay2Form.pointAtDistance( waveParticleGap ),
          lightRay.waveWidth, particleColor, particleGradientColor, angle, wavelength ) );
        waveParticleGap += gapBetweenSuccessiveParticles;
      }
    }
  }

  /**
   * Propagate the particles
   * @private
   */
  propagateParticles() {

    for ( let i = 0; i < this.rays.length; i++ ) {
      const lightRay = this.rays.get( i );
      const wavelength = lightRay.wavelength;
      const directionVector = lightRay.getUnitVector();
      const waveParticles = lightRay.particles;

      // Compute the total phase along the length of the ray.
      const totalPhaseOffsetInNumberOfWavelengths = lightRay.getPhaseOffset() / 2 / Math.PI;

      // Just keep the fractional part
      let phaseDiff = ( totalPhaseOffsetInNumberOfWavelengths % 1 ) * wavelength;
      let tailX;
      let tailY;
      const angle = lightRay.getAngle();
      if ( i === 0 ) {

        // for incident ray
        tailX = lightRay.tail.x;
        tailY = lightRay.tail.y;
      }
      else {

        // for reflected and refracted ray
        const distance = lightRay.trapeziumWidth / 2 * Math.cos( angle );
        phaseDiff = ( distance + phaseDiff ) % wavelength;
        tailX = lightRay.tail.x - ( directionVector.x * lightRay.trapeziumWidth / 2 * Math.cos( angle ) );
        tailY = lightRay.tail.y - ( directionVector.y * lightRay.trapeziumWidth / 2 * Math.cos( angle ) );
      }

      // Changing the wave particle position within the wave particle phase
      for ( let j = 0; j < waveParticles.length; j++ ) {
        const particle = waveParticles.get( j );
        particle.setX( tailX + ( directionVector.x * ( ( j * wavelength ) + phaseDiff ) ) );
        particle.setY( tailY + ( directionVector.y * ( ( j * wavelength ) + phaseDiff ) ) );
      }
    }
  }
}

bendingLight.register( 'IntroModel', IntroModel );

export default IntroModel;