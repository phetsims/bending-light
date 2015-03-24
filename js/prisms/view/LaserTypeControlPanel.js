// Copyright (c) 2002 - 2015. University of Colorado Boulder

/**
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  /**
   *
   * @param {Property<Number>}laserTypeProperty
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function LaserTypeControlPanel( laserTypeProperty, options ) {

    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#eeeeee  ',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );
    var radioButtonContent = [
      { value: 1, node: createSingleRayIcon() },
      { value: 2, node: createMultipleRayIcon() }
    ];

    var radioButtonPanel = new Panel( new RadioButtonGroup( laserTypeProperty,
      radioButtonContent, {  baseColor: 'white' } ), {
      stroke: 'black',
      lineWidth: 0
    } );

    this.addChild( radioButtonPanel );
    this.mutate( options );
  }

// laser node icon first rectangle
  var laserNodeFirstRoundedRect = new Path( new Shape().roundRect( 0, 0, 7, 29, 2, 1 ), {
    stroke: 'black',
    lineWidth: 0.3,
    fill: new LinearGradient( 0, 0, 0, 29 )
      .addColorStop( 0, '#4F4E50' )
      .addColorStop( 0.35, '#FBFCFC' )
      .addColorStop( 0.6, '#A8AAAD' )
      .addColorStop( 1, '#4F4E50' )
  } );
  // laser node icon second rectangle
  var laserNodeSecondRoundedRect = new Path( new Shape().roundRect( 7, 3, 9, 24, 2, 1 ), {
    stroke: 'black',
    lineWidth: 0.3,
    fill: new LinearGradient( 0, 0, 0, 27 )
      .addColorStop( 0, '#4F4E50' )
      .addColorStop( 0.4, '#FBFCFC' )
      .addColorStop( 0.6, '#A8AAAD' )
      .addColorStop( 1, '#4F4E50' )
  } );
  //Create an icon for the single ray  button
  var createSingleRayIcon = function() {
    var singleRayLine = new Path( new Shape().moveTo( 17, 15 ).lineTo( 49, 15 ).close(), { stroke: 'red', lineWidth: 2 } );
    return new HBox( { children: [ laserNodeFirstRoundedRect, laserNodeSecondRoundedRect, singleRayLine ] } );
  };

  //Create an icon for multiple ray button
  var createMultipleRayIcon = function() {

    var manyRaysStartX = 17;
    var manyRaysEndX = 49;
    var multiRaysLinesShape = new Shape();
    var manyRaysStartY = 6;
    for ( var i = 0; i < 5; i++ ) {
      multiRaysLinesShape.moveTo( manyRaysStartX, manyRaysStartY + i * 4 )
        .lineTo( manyRaysEndX, manyRaysStartY + i * 4 );
    }
    var multiRayLine = new Path( multiRaysLinesShape, { stroke: 'red', lineWidth: 2 } );
    return new HBox( { children: [ laserNodeFirstRoundedRect, laserNodeSecondRoundedRect, multiRayLine ] } );
  };


  return inherit( Node, LaserTypeControlPanel );
} );
