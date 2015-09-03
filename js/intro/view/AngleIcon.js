//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The icon to be shown with the "Angles" checkbox.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  /**
   *
   * @constructor
   */
  function AngleIcon() {
    Node.call( this );

    var edgeLength = 15;

    // Same as the default laser angle
    var angle = Math.PI * 3 / 4 - Math.PI / 2;

    // a "V" shape with the right edge perfectly vertical and the left edge at an angle
    var shape = new Shape().moveTo( 0, 0 )
      .lineTo( 0, edgeLength )
      .lineTo( -edgeLength * Math.sin( angle ), -edgeLength * Math.cos( angle ) + edgeLength );
    this.addChild( new Path( shape, {
      stroke: 'black',
      lineWidth: 1
    } ) );

    // arc: function( centerX, centerY, radius, startAngle, endAngle, anticlockwise
    var overlapAngle = Math.PI / 12;
    var arc = new Shape().arc( 0, edgeLength, edgeLength * 0.55, 0 - Math.PI / 2 + overlapAngle, -angle - Math.PI / 2 - overlapAngle, true );
    this.addChild( new Path( arc, {
      stroke: 'black',
      lineWidth: 1
    } ) );
  }

  return inherit( Node, AngleIcon );
} );