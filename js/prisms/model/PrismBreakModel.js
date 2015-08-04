// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model for the "prism " screen, in which the user can move the laser and many prisms.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Circle = require( 'BENDING_LIGHT/prisms/model/Circle' );
  var SemiCircle = require( 'BENDING_LIGHT/prisms/model/SemiCircle' );
  var Polygon = require( 'BENDING_LIGHT/prisms/model/Polygon' );
  var Ray = require( 'BENDING_LIGHT/prisms/model/Ray' );
  var Ray2 = require( 'DOT/Ray2' );
  var Property = require( 'AXON/Property' );
  var Util = require( 'DOT/Util' );
  var LightRay = require( 'BENDING_LIGHT/common/model/LightRay' );
  var Medium = require( 'BENDING_LIGHT/common/model/Medium' );
  var Prism = require( 'BENDING_LIGHT/prisms/model/Prism' );
  var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  var ProtractorModel = require( 'BENDING_LIGHT/common/model/ProtractorModel' );
  var Color = require( 'SCENERY/util/Color' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );

  // constants
  var WAVELENGTH_RED = BendingLightConstants.WAVELENGTH_RED;
  var CHARACTERISTIC_LENGTH = WAVELENGTH_RED;

  /**
   * @constructor
   */
  function PrismBreakModel() {

    this.prisms = new ObservableArray( [] ); // @public

    // Show multiple beams to help show how lenses work
    Property.addProperty( this, 'manyRays', 1 );

    // If false, will hide non TIR reflections
    Property.addProperty( this, 'showReflections', false );
    Property.addProperty( this, 'showNormals', false );
    this.showProtractorProperty = new Property( false ); // @public

    // List of intersections, which can be shown graphically
    this.intersections = new ObservableArray(); // @public

    // Environment the laser is in
    Property.addProperty( this, 'environmentMedium', new Medium( Shape.rect( -1, 0, 2, 1 ), BendingLightModel.AIR,
      MediumColorFactory.getColor( BendingLightModel.AIR.getIndexOfRefractionForRedLight() ) ) );

    // Material that comprises the prisms
    Property.addProperty( this, 'prismMedium', new Medium( Shape.rect( -1, -1, 2, 1 ), BendingLightModel.GLASS,
      MediumColorFactory.getColor( BendingLightModel.GLASS.getIndexOfRefractionForRedLight() ) ) );

    // Draggable and rotatable protractor
    this.protractorModel = new ProtractorModel( 0, 0 ); // @public

    var prismsBreakModel = this;
    BendingLightModel.call( this, Math.PI, false, BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT * 1.1 );

    Property.multilink( [ this.manyRaysProperty,
      this.environmentMediumProperty,
      this.showReflectionsProperty,
      this.prismMediumProperty,
      this.laser.onProperty,
      this.laser.pivotProperty,
      this.laser.emissionPointProperty,
      this.showNormalsProperty,
      this.laser.colorModeProperty,
      this.laser.colorProperty,
      this.laserViewProperty
    ], function() {
      prismsBreakModel.clear();
      prismsBreakModel.updateModel();
      prismsBreakModel.dirty = true;
    } );

    // coalesce repeat updates so work is not duplicated in white light node.
    this.dirty = true; // @public
  }

  return inherit( BendingLightModel, PrismBreakModel, {

    /**
     * @public
     * @override
     */
    reset: function() {
      BendingLightModel.prototype.reset.call( this );
      this.prisms.clear();
      this.manyRaysProperty.reset();
      this.environmentMediumProperty.reset();
      this.prismMediumProperty.reset();
      this.showReflectionsProperty.reset();
      this.protractorModel.reset();
      this.showNormalsProperty.reset();
      this.showProtractorProperty.reset();

    },

    /**
     * List of prism prototypes that can be created in the sim
     * @public
     * @returns {Array}
     */
    getPrismPrototypes: function() {
      var prismsTypes = [];

      // characteristic length scale
      var a = CHARACTERISTIC_LENGTH * 10;

      // attach at bottom right
      prismsTypes.push( new Prism( new Polygon( 2, [
        new Vector2( -a / 2, a / 2 ),
        new Vector2( a / 2, a / 2 ),
        new Vector2( a / 2, -a / 2 ),
        new Vector2( -a / 2, -a / 2 )
      ], 0 ) ) );

      // triangle, attach at bottom right
      prismsTypes.push( new Prism( new Polygon( 1, [
        new Vector2( -a / 2, -a / (2 * Math.sqrt( 3 )) ),
        new Vector2( a / 2, -a / (2 * Math.sqrt( 3 )) ),
        new Vector2( 0, a / Math.sqrt( 3 ) )
      ], 0 ) ) );

      // trapezoid, attach at bottom right
      prismsTypes.push( new Prism( new Polygon( 1, [
        new Vector2( -a / 2, -a * Math.sqrt( 3 ) / 4 ),
        new Vector2( a / 2, -a * Math.sqrt( 3 ) / 4 ),
        new Vector2( a / 4, a * Math.sqrt( 3 ) / 4 ),
        new Vector2( -a / 4, a * Math.sqrt( 3 ) / 4 )
      ], 0 ) ) );

      var radius = a / 2;

      // Continuous Circle
      prismsTypes.push( new Prism( new Circle( new Vector2(), radius ) ) );

      // SemiCircle
      prismsTypes.push( new Prism( new SemiCircle( 1, [
        new Vector2( 0, radius ),
        new Vector2( 0, -radius )
      ], radius ) ) );

      // DivergingLens
      prismsTypes.push( new Prism( new Polygon( 2, [
        new Vector2( -0.6 * radius, radius ),
        new Vector2( 0.6 * radius, radius ),
        new Vector2( 0.6 * radius, -radius ),
        new Vector2( -0.6 * radius, -radius )
      ], radius ) ) );
      return prismsTypes;
    },

    /**
     * Adds a prism to the model.
     * @public
     * @param {Prism} prism
     */
    addPrism: function( prism ) {
      this.prisms.add( prism );
    },

    /**
     * Removes a prism from the model
     * @public
     * @param {Prism} prism
     */
    removePrism: function( prism ) {
      this.prisms.remove( prism );
      this.updateModel();
    },

    /**
     * Determines whether white light or single color light
     * @private
     * @param {Vector2} tail - tail position of light ray
     * @param {Vector2} directionUnitVector - unit vector of the light ray
     * @param {number} power - amount of power this light has
     * @param {boolean} laserInPrism - specifies whether laser in prism
     */
    propagate: function( tail, directionUnitVector, power, laserInPrism ) {

      // Determines whether to use white light or single color light
      var mediumIndexOfRefraction;
      if ( this.laser.colorMode === 'white' ) {
        var min = VisibleColor.MIN_WAVELENGTH / 1E9;
        var max = VisibleColor.MAX_WAVELENGTH / 1E9;

        // This number sets the number of (equally spaced wavelength) rays to show in a white beam. More rays looks
        // better but is more computationally intensive.
        var dw = (max - min) / 16;

        for ( var wavelength = min; wavelength <= max; wavelength += dw ) {
          mediumIndexOfRefraction = laserInPrism ? this.prismMedium.getIndexOfRefraction( wavelength ) :
                                    this.environmentMedium.getIndexOfRefraction( wavelength );
          this.propagateTheRay( new Ray( tail, directionUnitVector, power, wavelength, mediumIndexOfRefraction,
            BendingLightConstants.SPEED_OF_LIGHT / wavelength ), 0 );
        }
      }
      else {
        mediumIndexOfRefraction = laserInPrism ?
                                  this.prismMedium.getIndexOfRefraction( this.laser.getWavelength() ) :
                                  this.environmentMedium.getIndexOfRefraction( this.laser.getWavelength() );
        this.propagateTheRay( new Ray( tail, directionUnitVector, power, this.laser.getWavelength(),
          mediumIndexOfRefraction, this.laser.getFrequency() ), 0 );
      }
    },

    /**
     * Algorithm that computes the trajectories of the rays throughout the system
     * @public
     */
    propagateRays: function() {

      if ( this.laser.on ) {
        var tail = this.laser.emissionPoint;
        var laserInPrism = this.isLaserInPrism();
        var directionUnitVector = this.laser.getDirectionUnitVector();
        if ( this.manyRays === 1 ) {

          // This can be used to show the main central ray
          this.propagate( tail, directionUnitVector, 1.0, laserInPrism );
        }
        else {

          // Many parallel rays
          for ( var x = -WAVELENGTH_RED; x <= WAVELENGTH_RED * 1.1; x += WAVELENGTH_RED / 2 ) {
            var offset = directionUnitVector.rotated( Math.PI / 2 ).multiplyScalar( x );
            this.propagate( offset.add( tail ), directionUnitVector, 1.0, laserInPrism );
          }
        }
      }
    },

    /**
     * Determine if the laser beam originates within a prism for purpose of determining what index of refraction to use
     * initially
     * @public
     * @returns {boolean}
     */
    isLaserInPrism: function() {
      var emissionPoint = this.laser.emissionPoint;
      for ( var i = 0; i < this.prisms.length; i++ ) {
        if ( this.prisms.get( i ).contains( emissionPoint ) ) {
          return true;
        }
      }
      return false;
    },

    /**
     * Recursive algorithm to compute the pattern of rays in the system. This is the main computation of this model,
     * rays are cleared beforehand and this algorithm adds them as it goes
     * @private
     * @param {Ray} incidentRay - model of the ray
     * @param {number} count - number of rays
     */
    propagateTheRay: function( incidentRay, count ) {
      var rayColor;
      var rayVisibleColor;
      var waveWidth = CHARACTERISTIC_LENGTH * 5;

      // Termination condition of we have reached too many iterations or if the ray is very weak
      if ( count > 50 || incidentRay.power < 0.001 ) {
        return;
      }

      // Check for an intersection
      var intersection = this.getIntersection( incidentRay, this.prisms );
      var L = incidentRay.directionUnitVector;
      var n1 = incidentRay.mediumIndexOfRefraction;
      var wavelengthInN1 = incidentRay.wavelength / n1;
      if ( intersection !== null ) {

        // List the intersection in the model
        this.addIntersection( intersection );
        var pointOnOtherSide = (incidentRay.directionUnitVector.times( 1E-12 )).add( intersection.point );
        var outputInsidePrism = false;
        var lightRayAfterIntersectionInRay2Form = new Ray2( pointOnOtherSide, incidentRay.directionUnitVector );
        this.prisms.forEach( function( prism ) {
          var intersection = prism.shape.shape.intersection( lightRayAfterIntersectionInRay2Form );
          if ( intersection.length % 2 === 1 ) {
            outputInsidePrism = true;
          }
        } );

        // Index of refraction of the other medium
        var n2 = outputInsidePrism ?
                 this.prismMedium.getIndexOfRefraction( incidentRay.getBaseWavelength() ) :
                 this.environmentMedium.getIndexOfRefraction( incidentRay.getBaseWavelength() );

        // Precompute for readability
        var point = intersection.point;
        var n = intersection.unitNormal;

        // Compute the output rays, see http://en.wikipedia.org/wiki/Snell's_law#Vector_form
        var cosTheta1 = n.dotXY( L.x * -1, L.y * -1 );
        var cosTheta2Radicand = 1 - Math.pow( n1 / n2, 2 ) * (1 - Math.pow( cosTheta1, 2 ));
        var cosTheta2 = Math.sqrt( cosTheta2Radicand );
        var totalInternalReflection = cosTheta2Radicand < 0;
        var vReflect = (n.times( 2 * cosTheta1 )).add( L );
        var vRefract = cosTheta1 > 0 ? (L.times( n1 / n2 )).addXY( n.x * ( n1 / n2 * cosTheta1 - cosTheta2 ), n.y * ( n1 / n2 * cosTheta1 - cosTheta2 ) )
          : (L.times( n1 / n2 )).addXY( n.x * ( n1 / n2 * cosTheta1 + cosTheta2 ), n.y * ( n1 / n2 * cosTheta1 + cosTheta2 ) );
        var reflectedPower = totalInternalReflection ? 1
          : Util.clamp( BendingLightModel.getReflectedPower( n1, n2, cosTheta1, cosTheta2 ), 0, 1 );
        var transmittedPower = totalInternalReflection ? 0
          : Util.clamp( BendingLightModel.getTransmittedPower( n1, n2, cosTheta1, cosTheta2 ), 0, 1 );// clamp(value,min,max)

        // Create the new rays and propagate them recursively
        var reflected = new Ray( ( incidentRay.directionUnitVector.times( -1E-12 )).add( point ), vReflect,
          incidentRay.power * reflectedPower, incidentRay.wavelength, incidentRay.mediumIndexOfRefraction,
          incidentRay.frequency );
        var refracted = new Ray( (incidentRay.directionUnitVector.times( +1E-12 )).add( point ), vRefract,
          incidentRay.power * transmittedPower, incidentRay.wavelength, n2, incidentRay.frequency );
        if ( this.showReflections || totalInternalReflection ) {
          this.propagateTheRay( reflected, count + 1 );
        }
        this.propagateTheRay( refracted, count + 1 );
        rayColor = new Color( 0, 0, 0, 0 );
        rayVisibleColor = VisibleColor.wavelengthToColor( incidentRay.wavelength * 1E9 );
        rayColor.set( rayVisibleColor.getRed(), rayVisibleColor.getGreen(), rayVisibleColor.getBlue(),
          rayVisibleColor.getAlpha() );

        // Add the incident ray itself
        this.addRay( new LightRay( CHARACTERISTIC_LENGTH / 2,
          incidentRay.tail,
          intersection.point,
          n1,
          wavelengthInN1,
          incidentRay.power,
          rayColor,
          waveWidth,
          0,
          true,
          false, this.laserView ) );
      }
      else {
        rayColor = new Color( 0, 0, 0, 0 );
        rayVisibleColor = VisibleColor.wavelengthToColor( incidentRay.wavelength * 1E9 );
        rayColor.set( rayVisibleColor.getRed(), rayVisibleColor.getGreen(), rayVisibleColor.getBlue(),
          rayVisibleColor.getAlpha() );

        // No intersection, so the light ray should just keep going
        this.addRay( new LightRay( CHARACTERISTIC_LENGTH / 2,
          incidentRay.tail,
          incidentRay.tail.plus( incidentRay.directionUnitVector ),
          n1,
          wavelengthInN1,
          incidentRay.power,
          rayColor,
          waveWidth,
          0,
          true,
          false, this.laserView ) );
      }
    },

    /**
     * Signify that another ray/interface collision occurred
     * @private
     * @param {Intersection} intersection - intersection of light ray with prism
     */
    addIntersection: function( intersection ) {
      this.intersections.add( intersection );
    },

    /**
     * Find the nearest intersection between a light ray and the set of prisms in the play area
     * @private
     * @param {Ray} incidentRay - model of the ray
     * @param {ObservableArray<Prism>} prisms
     * @returns {Intersection|null} - returns the intersection if one was found or null if no intersections
     */
    getIntersection: function( incidentRay, prisms ) {
      var allIntersections = [];
      prisms.forEach( function( prism ) {
        prism.getIntersections( incidentRay ).forEach( function( intersection ) {
          allIntersections.push( intersection );
        } );
      } );

      // Get the closest one (which would be hit first)
      allIntersections = _.sortBy( allIntersections, function( allIntersection ) {
        return allIntersection.point.distance( incidentRay.tail );
      } );
      return allIntersections.length === 0 ? null : allIntersections[ 0 ];
    },

    /**
     * @public
     */
    clear: function() {
      this.intersections.clear();
    }
  } );
} );