// Copyright 2002-2012, University of Colorado
/**
 * Model for the "prism break" tab, in which the user can move the laser and many prisms.
 *
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
  var DivergingLens = require( 'BENDING_LIGHT/prisms/model/DivergingLens' );
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

  //constants
  var CHARACTERISTIC_LENGTH = 650E-9;
  var SPEED_OF_LIGHT = 2.99792458E8;
  var WAVELENGTH_RED = 650E-9;

  /**
   *
   * @constructor
   */
  function PrismBreakModel() {


    this.prisms = new ObservableArray( [] );

    //show multiple beams to help show how lenses work
    this.manyRaysProperty = new Property( 1 );

    //If false, will hide non TIR reflections
    this.showReflectionsProperty = new Property( false );
    this.showNormalsProperty = new Property( false );
    this.showProtractorProperty = new Property( false );

    //List of intersections, which can be shown graphically
    this.intersections = new ObservableArray();

    this.mediumColorFactory = new MediumColorFactory();

    //Environment the laser is in
    this.environmentMediumProperty = new Property( new Medium( Shape.rect( -1, 0, 2, 1 ), BendingLightModel.AIR,
      this.mediumColorFactory.getColor( BendingLightModel.AIR.getIndexOfRefractionForRedLight() ) ) );

    //Material that comprises the prisms
    this.prismMediumProperty = new Property( new Medium( Shape.rect( -1, -1, 2, 1 ), BendingLightModel.GLASS,
      this.mediumColorFactory.getColor( BendingLightModel.GLASS.getIndexOfRefractionForRedLight() ) ) );


    //Draggable and rotatable protractor
    this.protractorModel = new ProtractorModel( 0, 0 );

    var prismsBreakModel = this;
    BendingLightModel.call( this, Math.PI, false,
      BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT * 0.9 );

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
      this.laserViewProperty ], function() {
      prismsBreakModel.clear();
      prismsBreakModel.updateModel();
      prismsBreakModel.dirty = true;
    } );
    //Coalesce repeat updates so work is not duplicated  in white light node.
    this.dirty = true;
  }

  return inherit( BendingLightModel, PrismBreakModel, {

    resetAll: function() {
      this.prisms.clear();
      this.manyRaysProperty.reset();
      this.environmentMediumProperty.reset();
      this.prismMediumProperty.reset();
      this.showReflectionsProperty.reset();
      this.protractorModel.reset();
      this.showNormalsProperty.reset();
      this.showProtractorProperty.reset();
      BendingLightModel.prototype.resetAll.call( this );
    },
    /**
     * List of prism prototypes that can be created in the sim
     * @returns {Array}
     */
    getPrismPrototypes: function() {
      var prismsTypes = [];

      //characteristic length scale
      var a = CHARACTERISTIC_LENGTH * 10;

      prismsTypes.push( new Prism( new Polygon( 1,//attach at bottom right
        [ new Vector2( -a / 2, -a / 2 ),
          new Vector2( a / 2, -a / 2 ),
          new Vector2( a / 2, a / 2 ),
          new Vector2( -a / 2, a / 2 ) ] ) ) );

      //Triangle
      prismsTypes.push( new Prism( new Polygon(
        1,//attach at bottom right
        [ new Vector2( -a / 2, -a / (2 * Math.sqrt( 3 )) ),
          new Vector2( a / 2, -a / (2 * Math.sqrt( 3 )) ),
          new Vector2( 0, a / Math.sqrt( 3 ) ) ]
      ) ) );

      //Trapezoid
      prismsTypes.push( new Prism( new Polygon( 1,//attach at bottom right
        [ new Vector2( -a / 2, -a * Math.sqrt( 3 ) / 4 ),
          new Vector2( a / 2, -a * Math.sqrt( 3 ) / 4 ),
          new Vector2( a / 4, a * Math.sqrt( 3 ) / 4 ),
          new Vector2( -a / 4, a * Math.sqrt( 3 ) / 4 ) ]
      ) ) );

      var radius = a / 2;

      //Continuous Circle
      prismsTypes.push( new Prism( new Circle( new Vector2(), radius ) ) );

      //SemiCircle
      prismsTypes.push( new Prism( new SemiCircle( 1, [ new Vector2( 0, radius ), new Vector2( 0, -radius ) ], radius ) ) );

      //DivergingLens
      prismsTypes.push( new Prism( new DivergingLens( 2,
        [
          new Vector2( -0.6 * radius, radius ),
          new Vector2( 0.6 * radius, radius ),
          new Vector2( 0.6 * radius, -radius ),
          new Vector2( -0.6 * radius, -radius )
        ], radius ) ) );
      return prismsTypes;

    },

    //Adds a prism to the model; doesn't signal a "prism added event", adding graphics must be handled by the client that added the prism.
    //This gives the client fine-grained control over creation of model elements and associated nodes, but future TODOs could investigate using standard
    //Model creation/notification scheme
    /**
     *
     * @param prism
     */
    addPrism: function( prism ) {
      this.prisms.add( prism );
    },
    /**
     *
     * @param prism
     */
    removePrism: function( prism ) {
      this.prisms.remove( prism );
    },
    getPrisms: function() {
      return this.prisms;
    },

    /**
     *
     * @param {Vector2} tail
     * @param {Vector2} directionUnitVector
     * @param {Number} power
     * @param {Boolean}laserInPrism
     */
    propagate: function( tail, directionUnitVector, power, laserInPrism ) {
      //Determines whether to use white light or single color light
      var mediumIndexOfRefraction;
      //this.model.laser.color.get() === WHITE_LIGHT
      if ( this.laser.colorModeProperty.value === 'white' ) {
        var min = VisibleColor.MIN_WAVELENGTH / 1E9;
        var max = VisibleColor.MAX_WAVELENGTH / 1E9;
        //This number sets the number of (equally spaced wavelength) rays to show in a white beam.  More rays looks better but is more computationally intensive.
        var dw = (max - min) / 16;

        for ( var wavelength = min; wavelength <= max; wavelength += dw ) {
          mediumIndexOfRefraction = laserInPrism ? this.prismMediumProperty.get().getIndexOfRefraction( wavelength ) :
                                    this.environmentMediumProperty.get().getIndexOfRefraction( wavelength );
          this.propagateTheRay( new Ray( tail, directionUnitVector, power,
            wavelength, mediumIndexOfRefraction, SPEED_OF_LIGHT / wavelength ), 0 );
        }
      }
      else {
        mediumIndexOfRefraction = laserInPrism ? this.prismMediumProperty.get().getIndexOfRefraction( this.laser.getWavelength() ) :
                                  this.environmentMediumProperty.get().getIndexOfRefraction( this.laser.getWavelength() );
        this.propagateTheRay( new Ray( tail, directionUnitVector, power, this.laser.getWavelength(),
          mediumIndexOfRefraction, this.laser.getFrequency() ), 0 );
      }
    },
    /**
     * Algorithm that computes the trajectories of the rays throughout the system
     */
    propagateRays: function() {

      if ( this.laser.on ) {
        var tail = this.laser.emissionPoint;
        var laserInPrism = this.isLaserInPrism();
        var directionUnitVector = this.laser.getDirectionUnitVector();
        if ( this.manyRaysProperty.get() === 1 ) {
          //This can be used to show the main central ray
          this.propagate( tail, directionUnitVector, 1.0, laserInPrism );
        }
        else {
          //Many parallel rays
          for ( var x = -WAVELENGTH_RED; x <= WAVELENGTH_RED * 1.1; x += WAVELENGTH_RED / 2 ) {
            var offset = directionUnitVector.rotated( Math.PI / 2 ).times( x );
            this.propagate( tail.plus( offset ), directionUnitVector, 1.0, laserInPrism );
          }
        }
      }
    },
    /**
     * Determine if the laser beam originates within a prism for purpose of
     * determining what index of refraction to use initially
     * @returns {boolean}
     */
    isLaserInPrism: function() {
      var emissionPoint = this.laser.emissionPoint;
      var isLaserInPrism = false;
      for ( var i = 0; i < this.prisms.length; i++ ) {
        isLaserInPrism = this.prisms.get( i ).contains( emissionPoint );
      }
      return isLaserInPrism;
    },

    /**
     * Recursive algorithm to compute the pattern of rays in the system.
     * This is the main computation of this model, rays are cleared beforehand
     * and this algorithm adds them as it goes
     *
     * @param incidentRay
     * @param count
     */
    propagateTheRay: function( incidentRay, count ) {
      var waveWidth = CHARACTERISTIC_LENGTH * 5;
      //Termination condition of we have reached too many iterations or
      // if the ray is very weak
      if ( count > 50 || incidentRay.power < 0.001 ) {
        return;
      }
      //Check for an intersection
      var intersection = this.getIntersection( incidentRay, this.prisms );
      var L = incidentRay.directionUnitVector;
      var n1 = incidentRay.mediumIndexOfRefraction;
      var wavelengthInN1 = incidentRay.wavelength / n1;
      if ( intersection !== null ) {
        //List the intersection in the model
        this.addIntersection( intersection );
        var pointOnOtherSide = intersection.getPoint().plus( incidentRay.directionUnitVector.times( 1E-12 ) );
        var outputInsidePrism = false;
        this.prisms.forEach( function( prism ) {
          if ( prism.shapeProperty.get().toShape().intersection(
              new Ray2( pointOnOtherSide, incidentRay.directionUnitVector ) ).length !== 0 ) {
            outputInsidePrism = true;
          }
        } );
        //Index of refraction of the other medium
        var n2 = outputInsidePrism ? this.prismMediumProperty.get().getIndexOfRefraction(
          incidentRay.getBaseWavelength() ) :
                 this.environmentMediumProperty.get().getIndexOfRefraction( incidentRay.getBaseWavelength() );
        //Precompute for readability
        var point = intersection.getPoint();
        var n = intersection.getUnitNormal();
        //Compute the output rays, see http://en.wikipedia.org/wiki/Snell's_law#Vector_form
        var cosTheta1 = n.dot( L.times( -1 ) );
        var cosTheta2Radicand = 1 - Math.pow( n1 / n2, 2 ) * (1 - Math.pow( cosTheta1, 2 ));
        var cosTheta2 = Math.sqrt( cosTheta2Radicand );
        var totalInternalReflection = cosTheta2Radicand < 0;
        var vReflect = L.plus( n.times( 2 * cosTheta1 ) );
        var vRefract = cosTheta1 > 0 ? L.times( n1 / n2 ).plus( n.times( n1 / n2 * cosTheta1 - cosTheta2 ) ) : L.times( n1 / n2 ).plus( n.times( n1 / n2 * cosTheta1 + cosTheta2 ) );
        var reflectedPower = totalInternalReflection ? 1 : Util.clamp( this.getReflectedPower( n1, n2, cosTheta1, cosTheta2 ), 0, 1 );
        var transmittedPower = totalInternalReflection ? 0 : Util.clamp( this.getTransmittedPower( n1, n2, cosTheta1, cosTheta2 ), 0, 1 );// clamp(value,min,max)
        //Create the new rays and propagate them recursively
        var reflected = new Ray( point.plus( incidentRay.directionUnitVector.times( -1E-12 ) ),
          vReflect, incidentRay.power * reflectedPower, incidentRay.wavelength,
          incidentRay.mediumIndexOfRefraction, incidentRay.frequency );
        var refracted = new Ray( point.plus( incidentRay.directionUnitVector.times( +1E-12 ) ),
          vRefract, incidentRay.power * transmittedPower, incidentRay.wavelength, n2,
          incidentRay.frequency );
        if ( this.showReflectionsProperty.get() || totalInternalReflection ) {
          this.propagateTheRay( reflected, count + 1 );
        }
        this.propagateTheRay( refracted, count + 1 );
        //Add the incident ray itself
        this.addRay( new LightRay( CHARACTERISTIC_LENGTH / 2, incidentRay.tail, intersection.getPoint(), n1,
          wavelengthInN1, incidentRay.power, new VisibleColor.wavelengthToColor( incidentRay.wavelength * 1E9 ),
          waveWidth, 0, null, true, false ) );
      }
      else {
        //No intersection, so the light ray should just keep going
        this.addRay( new LightRay( CHARACTERISTIC_LENGTH / 2, incidentRay.tail,
          incidentRay.tail.plus( incidentRay.directionUnitVector.times( 1 ) ), n1, wavelengthInN1,
          incidentRay.power, new VisibleColor.wavelengthToColor( incidentRay.wavelength * 1E9 ),
          waveWidth, 0, null, true, false ) );
      }
    },
    /**
     * Signify that another ray/interface collision occurred
     * @param intersection
     */
    addIntersection: function( intersection ) {
      this.intersections.add( intersection );
    },
    /**
     * Find the nearest intersection between a light ray and the set of prisms in the play area
     * @param incidentRay
     * @param prisms
     * @returns {null}
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
        return allIntersection.getPoint().distance( incidentRay.tail );
      } );
      return allIntersections.length === 0 ? null : allIntersections[ 0 ];
    },
    clear: function() {
      this.intersections.clear();
    }
  } );
} );

