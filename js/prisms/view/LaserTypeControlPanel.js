// Copyright  2002 - 2015. University of Colorado Boulder

/**
 * Control panel for  choosing whether it  single ray  or multiple ray.
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
   * @param {Property<number>} laserTypeProperty
   * @param {Object} [options] - options that can be passed on to the underlying node
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

    // Laser node icon first rectangle
    var laserNodeFirstRoundedRect = new Path( new Shape()
      .moveTo( 0, 0 )
      .lineTo( 3, 0 )
      .quadraticCurveTo( 5, 0, 5, 2 )
      .lineTo( 5, 23 )
      .quadraticCurveTo( 5, 25, 3, 25 )
      .lineTo( 0, 25 )
      .lineTo( 0, 0 ), {
      stroke: 'black',
      lineWidth: 0.3,
      fill: new LinearGradient( 0, 0, 0, 29 )
        .addColorStop( 0, '#4F4E50' )
        .addColorStop( 0.35, '#FBFCFC' )
        .addColorStop( 0.6, '#A8AAAD' )
        .addColorStop( 1, '#4F4E50' )
    } );

    // Laser node icon second rectangle
    var laserNodeSecondRoundedRect = new Path( new Shape()
      .moveTo( 5, 3 )
      .lineTo( 10, 3 )
      .quadraticCurveTo( 12, 3, 12, 5 )
      .lineTo( 12, 21 )
      .quadraticCurveTo( 12, 23, 10, 23 )
      .lineTo( 5, 23 )
      .lineTo( 5, 3 ), {
      stroke: 'black',
      lineWidth: 0.3,
      fill: new LinearGradient( 0, 0, 0, 27 )
        .addColorStop( 0, '#4F4E50' )
        .addColorStop( 0.4, '#FBFCFC' )
        .addColorStop( 0.6, '#A8AAAD' )
        .addColorStop( 1, '#4F4E50' )
    } );

    // Icon for the single ray  button
    var singleRayLine = new Path( new Shape().moveTo( 17, 15 ).lineTo( 49, 15 ), {
      stroke: 'red',
      lineWidth: 2
    } );
    var singleRayEmitterLaserIcon = new HBox( {
      children: [
        laserNodeFirstRoundedRect,
        laserNodeSecondRoundedRect,
        singleRayLine ]
    } );

    // Icon for multiple ray button
    var manyRaysStartX = 17;
    var manyRaysEndX = 49;
    var multiRaysLinesShape = new Shape();
    var manyRaysStartY = 6;
    for ( var i = 0; i < 5; i++ ) {
      multiRaysLinesShape.moveTo( manyRaysStartX, manyRaysStartY + i * 4 )
        .lineTo( manyRaysEndX, manyRaysStartY + i * 4 );
    }
    var multiRayLine = new Path( multiRaysLinesShape, { stroke: 'red', lineWidth: 2 } );
    var multipleRayEmitterLaserIcon = new HBox( {
      children: [
        laserNodeFirstRoundedRect,
        laserNodeSecondRoundedRect,
        multiRayLine ]
    } );

    var radioButtonContent = [
      { value: 1, node: singleRayEmitterLaserIcon },
      { value: 2, node: multipleRayEmitterLaserIcon }
    ];

    var radioButtonPanel = new Panel( new RadioButtonGroup( laserTypeProperty, radioButtonContent, {
      baseColor: 'white',
      spacing: 5
    } ), {
      stroke: 'black',
      lineWidth: 0
    } );

    this.addChild( radioButtonPanel );
    this.mutate( options );
  }

  return inherit( Node, LaserTypeControlPanel );
} );