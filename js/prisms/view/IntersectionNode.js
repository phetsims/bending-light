// Copyright 2002-2012, University of Colorado
/**
 * PNode that depicts a the normal vector at a light-ray / medium interface intersection.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  //var Color = require( 'SCENERY/util/Color' );
  //var Vector2 = require( 'DOT/Vector2' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   *
   * @param modelViewTransform
   * @param intersection
   * @constructor
   */
  function IntersectionNode( modelViewTransform, intersection ) {

    Node.call( this );
    //var center = modelViewTransform.modelToViewPosition( intersection.getPoint() );
    //var unitNormal = modelViewTransform.modelToViewDelta( intersection.getUnitNormal() ).normalized();
    //in stage coordinates
    // var length = 100;
    //Show a dotted line of the normal at the interface between two mediums where the laser struck
    /* this.addChild( new PhetPPath( new Line2D.Number( center.plus( unitNormal.times( length / 2 ) ).toPoint2D(), center.plus( unitNormal.times( -length / 2 ) ).toPoint2D() ), new BasicStroke( 2, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 1
     , new float[ ]{ 10, 5 },0),Color.darkGray).withAnonymousClassBody( {
     initializer: function() {
     } } ));*/
  }

  return inherit( Node, IntersectionNode, {} );
} );

