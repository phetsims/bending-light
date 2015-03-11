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
  //var ShapeDifference = require( 'BENDING_LIGHT/prisms/model/ShapeDifference' );
  //var ShapeIntersection = require( 'BENDING_LIGHT/prisms/model/ShapeIntersection' );
//  var Circle = require( 'BENDING_LIGHT/prisms/model/Circle' );
  var Polygon = require( 'BENDING_LIGHT/prisms/model/Polygon' );
  // var Intersection = require( 'BENDING_LIGHT/prisms/model/Intersection' );
  var Ray = require( 'BENDING_LIGHT/prisms/model/Ray' );
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


    this.prisms = new ObservableArray( [], {
      allowDuplicates: true
    } );

    //show multiple beams to help show how lenses work
    this.manyRays = new Property( 1 );

    //If false, will hide non TIR reflections
    this.showReflections = new Property( false );
    this.showNormals = new Property( false );
    this.showProtractor = new Property( false );

    //List of intersections, which can be shown graphically
    this.intersections = new ObservableArray();

    this.mediumColorFactory = new MediumColorFactory();

    //Environment the laser is in
    this.environmentMedium = new Property( new Medium( Shape.rect( -1, 0, 2, 1 ), BendingLightModel.AIR,
      this.mediumColorFactory.getColor( BendingLightModel.AIR.getIndexOfRefractionForRedLight() ) ) );

    //Material that comprises the prisms
    this.prismMedium = new Property( new Medium( Shape.rect( -1, -1, 2, 1 ), BendingLightModel.GLASS,
      this.mediumColorFactory.getColor( BendingLightModel.GLASS.getIndexOfRefractionForRedLight() ) ) );


    //Draggable and rotatable protractor
    this.protractorModel = new ProtractorModel( 0, 0 );

    var prismsBreakModel = this;
    BendingLightModel.call( this, Math.PI, false,
      BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT * 0.9 );

    Property.multilink( [ this.manyRays, this.environmentMedium ], function() {
      prismsBreakModel.updateModel();
    } );

  }

  return inherit( BendingLightModel, PrismBreakModel, {

    resetAll: function() {
      this.prisms.clear();
      this.manyRays.reset();
      this.environmentMedium.reset();
      this.prismMedium.reset();
      this.showReflections.reset();
      this.protractorModel.reset();
      this.showNormals.reset();
      this.showProtractor.reset();
      BendingLightModel.prototype.resetAll.call( this );
    },
    //List of prism prototypes that can be created in the sim
    getPrismPrototypes: function() {
      var prismsTypes = [];

      //characteristic length scale
      var a = CHARACTERISTIC_LENGTH * 10;
      //characteristic length scale
      //attach at bottom right
      var b = a / 4;


      prismsTypes.push( new Prism( new Polygon( 3,//attach at bottom right
        [ new Vector2(),
          new Vector2( 0, a ),
          new Vector2( a, a ),
          new Vector2( a, 0 ) ] ) ) );

      //Triangle
      prismsTypes.push( new Prism( new Polygon(
        1,//attach at bottom right
        [ new Vector2(),
          new Vector2( a, 0 ),
          new Vector2( a / 2, a * Math.sqrt( 3 ) / 2.0 ) ]
      ) ) );

      //Trapezoid
      prismsTypes.push( new Prism( new Polygon( 1,//attach at bottom right
        [ new Vector2(),
          new Vector2( a, 0 ),
          new Vector2( a / 2 + b, a * Math.sqrt( 3 ) / 2.0 ),
          new Vector2( a / 2 - b, a * Math.sqrt( 3 ) / 2.0 ) ]
      ) ) );

      /*      var radius = a / 2;

       //Continuous Circle
       prismsTypes.push( new Prism( new Circle( new Vector2(), radius ) ) );
       var polygonArray = [ new Vector2( 0, radius ),
       new Vector2( 0, -radius ),
       new Vector2( -radius, -radius ),
       new Vector2( -radius, radius ) ];
       //Continuous Semicircle
       prismsTypes.push( new Prism( new ShapeIntersection(
       new Circle( new Vector2(), radius ), new Polygon( polygonArray, 1 ) ) ) );

       //Continuous Diverging Lens
       prismsTypes.push( new Prism( new ShapeDifference( new Polygon( [
       new Vector2( 0, -radius ),
       new Vector2( radius * ( 0.6 / 0.5 ), -radius ),
       new Vector2( radius * ( 0.6 / 0.5 ), radius ),
       new Vector2( 0, radius ) ], 1 ), new Circle( new Vector2(), radius ) ) ) );*/
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
    removePrism: function( prism ) {
      /*      this.prisms.remove( prism );
       prism.shape.get().removeObserver( this.updateModel );
       this.updateModel();*/
      //this.prims
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
      if ( false ) {
        var min = VisibleColor.MIN_WAVELENGTH / 1E9;
        var max = VisibleColor.MAX_WAVELENGTH / 1E9;
        //This number sets the number of (equally spaced wavelength) rays to show in a white beam.  More rays looks better but is more computationally intensive.
        var dw = (max - min) / 16;

        for ( var wavelength = min; wavelength <= max; wavelength += dw ) {
          mediumIndexOfRefraction = laserInPrism ? this.prismMedium.get().getIndexOfRefraction( wavelength ) :
                                    this.environmentMedium.get().getIndexOfRefraction( wavelength );
          this.propagateTheRay( new Ray( tail, directionUnitVector, power,
            wavelength, mediumIndexOfRefraction, SPEED_OF_LIGHT / wavelength ), 0 );
        }
      }
      else {
        mediumIndexOfRefraction = laserInPrism ? this.prismMedium.get().getIndexOfRefraction( this.laser.getWavelength() ) :
                                  this.environmentMedium.get().getIndexOfRefraction( this.laser.getWavelength() );
        this.propagateTheRay( new Ray( tail, directionUnitVector, power, this.laser.getWavelength(),
          mediumIndexOfRefraction, this.laser.getFrequency() ), 0 );
      }
    },
    //Algorithm that computes the trajectories of the rays throughout the system
    propagateRays: function() {

      if ( this.laser.on ) {
        var tail = this.laser.emissionPoint;
        var laserInPrism = false;//this.isLaserInPrism();
        var directionUnitVector = this.laser.getDirectionUnitVector();
        if ( this.manyRays.get() === 1 ) {
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
    //Determine if the laser beam originates within a prism for purpose of
    // determining what index of refraction to use initially

    isLaserInPrism: function() {
      for ( var prism in this.prisms ) {
        if ( prism.contains( this.laser.emissionPoint ) ) {
          return true;
        }
      }
      return false;
    },

//Recursive algorithm to compute the pattern of rays in the system.
// This is the main computation of this model, rays are cleared beforehand
// and this algorithm adds them as it goes

    propagateTheRay: function( incidentRay, count ) {
      var waveWidth = CHARACTERISTIC_LENGTH * 5;
      //Termination condition of we have reached too many iterations or
      // if the ray is very weak
      if ( count > 50 || incidentRay.power < 0.001 ) {
        return;
      }
      //Check for an intersection
      var intersection = null;//this.getIntersection( incidentRay, this.prisms );
      var L = incidentRay.directionUnitVector;
      var n1 = incidentRay.mediumIndexOfRefraction;
      var wavelengthInN1 = incidentRay.wavelength / n1;
      if ( intersection !== null ) {
        //List the intersection in the model
        this.addIntersection( intersection );
        var pointOnOtherSide = intersection.getPoint().plus(
          incidentRay.directionUnitVector.getInstanceOfMagnitude( 1E-12 ) );
        var outputInsidePrism = false;
        for ( var prism in this.prisms ) {
          if ( prism.contains( pointOnOtherSide ) ) {
            outputInsidePrism = true;
          }
        }
        //Index of refraction of the other medium
        var n2 = outputInsidePrism ? this.prismMedium.get().getIndexOfRefraction(
          incidentRay.getBaseWavelength() ) :
                 this.environmentMedium.get().getIndexOfRefraction( incidentRay.getBaseWavelength() );
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
        if ( this.showReflections || totalInternalReflection ) {
          this.propagateRay( reflected, count + 1 );
        }
        this.propagateTheRay( refracted, count + 1 );
        //Add the incident ray itself
        this.addRay( new LightRay( CHARACTERISTIC_LENGTH / 2, incidentRay.tail, new Vector2( 0, 0 ), n1,
          wavelengthInN1, incidentRay.power,
          new VisibleColor.wavelengthToColor( incidentRay.wavelength * 1E9 ),
          waveWidth, 0, null, true, false ) );
      }
      else {
        //No intersection, so the light ray should just keep going
        this.addRay( new LightRay( CHARACTERISTIC_LENGTH / 2,
          incidentRay.tail,
          incidentRay.tail.plus( incidentRay.directionUnitVector.times( 1 ) ),
          n1,
          wavelengthInN1,
          incidentRay.power,
          new VisibleColor.wavelengthToColor( incidentRay.wavelength * 1E9 ),
          waveWidth,
          0,
          null,
          true,
          false ) );
      }
    },
    //Signify that another ray/interface collision occurred

    addIntersection: function( intersection ) {
      this.intersections.add( intersection );
    },
    //  Add a listener that will be notified when light hits an interface
    addIntersectionListener: function( listener ) {
      //intersectionListeners.add( listener );
    },
    //Find the nearest intersection between a light ray and the set of prisms in the play area

    getIntersection: function( incidentRay, prisms ) {
      var allIntersections = [];
      for ( var prism in prisms ) {
        allIntersections.addAll( prism.getIntersections( incidentRay ) );
      }
      /*// Get the closest one (which would be hit first)
       Collections.sort( allIntersections, new Comparator().withAnonymousClassBody( {
       compare: function( o1, o2 ) {
       return Number.compare( o1.getPoint().distance( incidentRay.tail ), o2.getPoint().distance( incidentRay.tail ) );
       }
       } ) );*/
      return allIntersections.size() === 0 ? null : allIntersections.get( 0 );
    }
    /*  clearModel: function() {
     this.intersections.clear();
     }*/
  } );
} );

