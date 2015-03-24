// Copyright 2002-2012, University of Colorado
/**
 * Node that depicts a the normal vector at a light-ray / medium interface intersection.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   *
   * @param modelViewTransform
   * @param intersection
   * @constructor
   */
  function IntersectionNode( modelViewTransform, intersection ) {

    Node.call( this );
    var center = modelViewTransform.modelToViewPosition( intersection.getPoint() );
    var unitNormal = modelViewTransform.modelToViewDelta( intersection.getUnitNormal() ).normalized();
    var length = 100;//in stage coordinates
    //Show a dotted line of the normal at the interface between two mediums where the laser struck
    this.addChild( new Path( new Shape()
      .moveToPoint( center.plus( unitNormal.times( length / 2 ) ) )
      .lineToPoint( center.plus( unitNormal.times( -length / 2 ) ) ), { stroke: 'black', lineDash: [ 10, 5 ] } ) );
  }

  return inherit( Node, IntersectionNode, {} );
} );

