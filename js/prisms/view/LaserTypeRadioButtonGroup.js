//  Copyright 2002-2015, University of Colorado Boulder

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
  function LaserTypeRadioButtonGroup( radioButtonAdapterProperty ) {


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
    RadioButtonGroup.call( this, radioButtonAdapterProperty, [ {
      value: 'singleColor',
      node: new Node( {
        children: [
          redLineAt( 0 ),
          laserImageNode
        ]
      } )
    }, {
      value: 'singleColor5x',
      node: new Node( {
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
        children: [
          new Rectangle( 70, 0, 40, laserImageNode.height, { fill: 'gray' } ),
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
      baseColor: 'white'
    } );
  }

  return inherit( RadioButtonGroup, LaserTypeRadioButtonGroup );
} );