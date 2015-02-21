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
   *LinearGradient
   * @param laserTypeProperty
   * @param options
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

    var radioButtonGroup = new RadioButtonGroup( laserTypeProperty, radioButtonContent, {
    } );

    var radioButtonPanel = new Panel( radioButtonGroup, {
      stroke: 'black',
      lineWidth: 0
    } );

    this.addChild( radioButtonPanel );
    this.mutate( options );
  }

  //Create an icon for the single ray  button
  var createSingleRayIcon = function() {
    var shape1 = new Shape().moveTo( 28, 25 ).lineTo( 28, 51 ).lineTo( 33, 50 ).lineTo( 32, 24 ).close();
    var shape2 = new Shape().moveTo( 33, 27 ).lineTo( 33, 50 ).lineTo( 42, 49 ).lineTo( 42, 27 ).close();
    var shape3 = new Shape().moveTo( 43, 57 ).lineTo( 75, 40 ).close();
    var path1 = new Path( shape1, { fill: '#a4a6a9' } );
    var path2 = new Path( shape2, { fill: '#a4a6a9' } );
    var path3 = new Path( shape3, { stroke: 'red', lineWidth: 4 } );
    return new HBox( { children: [ path1, path2, path3 ] } );
  };

  //Create an icon for multiple ray button
  var createMultipleRayIcon = function() {
    var shape1 = new Shape().moveTo( 28, 25 ).lineTo( 28, 51 ).lineTo( 33, 50 ).lineTo( 32, 24 ).close();
    var shape2 = new Shape().moveTo( 33, 27 ).lineTo( 33, 50 ).lineTo( 42, 49 ).lineTo( 42, 27 ).close();
    var shape3 = new Shape().moveTo( 43, 57 ).lineTo( 75, 40 ).close();
    var path1 = new Path( shape1, {
      stroke: 'black', fill: new LinearGradient( 0, 0, 0, 30 )
        .addColorStop( 0.3, '#cfcfd1' )
        .addColorStop( 0.5, '#fof1f1' )
        .addColorStop( 0.7, '#a4a6a9' )
        .addColorStop( 0.9, '#59595b' )
    } );
    var path2 = new Path( shape2, {
      stroke: 'black', fill: new LinearGradient( 0, 0, 0, 25 )
        .addColorStop( 0.3, 'red' )
        .addColorStop( 0.5, 'blue' )
        .addColorStop( 0.7, 'green' )
        .addColorStop( 0.9, 'black' )
    } );
    var path3 = new Path( shape3, { stroke: 'red', lineWidth: 4 } );
    console.log( path2.height );
    return new HBox( { children: [ path1, path2, path3 ] } );
  };


  return inherit( Node, LaserTypeControlPanel );
} );
