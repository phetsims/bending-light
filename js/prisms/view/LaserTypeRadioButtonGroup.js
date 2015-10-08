// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Shape = require( 'KITE/Shape' );
  var Image = require( 'SCENERY/nodes/Image' );

  // images
  var laserImage = require( 'image!BENDING_LIGHT/laser.png' );

  /**
   *
   * @constructor
   */
  function LaserTypeRadioButtonGroup( radioButtonAdapterProperty, options ) {


    var laserImageNode = new Image( laserImage, {
      scale: 0.6,
      clipArea: Shape.rectangle( 100, 0, 44, 100 )
    } );

    var lineWidth = 37;
    var redLineAt = function( y ) {
      return new Line( 0, 0, lineWidth, 0, {
        stroke: 'red',
        lineWidth: 2,
        centerY: laserImageNode.centerY + y,
        left: laserImageNode.centerX
      } );
    };

    var dy = 6.25;
    var padding = 2;// vertical padding above the laser in the white light radio button
    var overallScale = 0.875;
    RadioButtonGroup.call( this, radioButtonAdapterProperty, [ {
      value: 'singleColor',
      node: new Node( {
        scale: overallScale,
        children: [
          redLineAt( 0 ),
          laserImageNode
        ]
      } )
    }, {
      value: 'singleColor5x',
      node: new Node( {
        scale: overallScale,
        children: [
          redLineAt( 0 ),
          redLineAt( -dy ),
          redLineAt( -dy * 2 ),
          redLineAt( +dy ),
          redLineAt( +dy * 2 ),
          laserImageNode
        ]
      } )
    }, {
      value: 'white',
      node: new Node( {
        scale: overallScale,
        children: [
          new Rectangle( 60, -padding, 50, laserImageNode.height + padding * 2, { fill: '#261f21' } ),
          new Line( 0, 0, lineWidth, 0, {
            stroke: 'white',
            lineWidth: 2,
            centerY: laserImageNode.centerY,
            left: laserImageNode.centerX
          } ),
          laserImageNode
        ]
      } )
    } ], {
      orientation: 'horizontal',
      baseColor: 'white',
      selectedStroke: '#3291b8',
      selectedLineWidth: 2.5
    } );

    this.mutate( options );
  }

  return inherit( RadioButtonGroup, LaserTypeRadioButtonGroup );
} );