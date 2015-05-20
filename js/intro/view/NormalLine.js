// Copyright 2002-2015, University of Colorado Boulder

/**
 * The normal line is a graphic that indicates the point of intersection of the light ray and
 * the perpendicular angle at the interface.
 *
 * @author Sam Reid
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
   * @param {number} height -height of normal
   * @param {number} on
   * @param {number} off
   * @param {Object} [options ]
   * @constructor
   */
  function NormalLine( height, on, off, options ) {
    Node.call( this );

    // normal Line
    var shape = new Shape()
      .moveTo( 0, 0 )  //x1,y1
      .lineTo( 0, height ); //x2,y2

    this.addChild( new Path( shape, { stroke: 'black', lineDash: [ on, off ] } ) );
    this.mutate( options );

  }

  return inherit( Node, NormalLine );
} );

