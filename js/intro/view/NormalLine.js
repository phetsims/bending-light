// Copyright 2015-2016, University of Colorado Boulder

/**
 * The normal line is a graphic that indicates the point of intersection of the light ray and
 * the perpendicular angle at the interface.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {number} height - height of normal
   * @param {array.<number>} lineDash
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function NormalLine( height, lineDash, options ) {
    Node.call( this );

    this.addChild( new Path( Shape.lineSegment( 0, 0, 0, height ), {
      stroke: 'black',
      lineDash: lineDash
    } ) );
    this.mutate( options );
  }

  bendingLight.register( 'NormalLine', NormalLine );
  
  return inherit( Node, NormalLine );
} );