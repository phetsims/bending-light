// Copyright 2015-2017, University of Colorado Boulder

/**
 * Radio button group for choosing between 1x monochromatic, 5x monochromatic or 1x white light.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );

  // images
  const laserImage = require( 'image!BENDING_LIGHT/laser.png' );

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

  bendingLight.register( 'LaserTypeRadioButtonGroup', LaserTypeRadioButtonGroup );
  
  return inherit( RadioButtonGroup, LaserTypeRadioButtonGroup );
} );