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
  // var LightRay = require( 'BENDING_LIGHT/common/model/LightRay' );
  //var Medium = require( 'BENDING_LIGHT/common/model/Medium' );
  //var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );
  //var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );

  /**
   *
   * @constructor
   */
  function PrismBreakModel() {


    this.prisms = [];

    //show multiple beams to help show how lenses work
    this.manyRays = new Property( false );

    //Environment the laser is in
    //this.environment = new Property( new Medium( new Rectangle.Number( -1, 0, 2, 1 ), AIR, MediumColorFactory.getColor( AIR.getIndexOfRefractionForRedLight() ) ) );

    //Material that comprises the prisms
    //this.prismMedium = new Property( new Medium( new Rectangle.Number( -1, -1, 2, 1 ), GLASS, MediumColorFactory.getColor( GLASS.getIndexOfRefractionForRedLight() ) ) );

    //If false, will hide non TIR reflections
    this.showReflections = new Property( false );

    //List of intersections, which can be shown graphically
    this.intersections = [];
    //Listen for creation of intersections to show them


    this.intersectionListeners = [];
    //Draggable and rotatable protractor

    //private
    // this.protractorModel = new ProtractorModel( 0, 0 );
    //Listener that updates the model when the prism shapes change,
    // keep a reference to it so it can be removed to avoid memory leaks on removePrism()


    BendingLightModel.call( this, Math.PI, false, BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT * 0.9 );
    //Recompute the model when any dependencies change

  }

  return inherit( BendingLightModel, PrismBreakModel, {
    resetAll: function() {

    }
  } );
} );

