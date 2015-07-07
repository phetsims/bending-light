// Copyright 2002-2015, University of Colorado Boulder

/**
 * Node that depicts a the normal vector at a light-ray / medium interface intersection.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
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
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Intersection} intersection
   * @constructor
   */
  function IntersectionNode( modelViewTransform, intersection ) {

    Node.call( this );
    var centerX = modelViewTransform.modelToViewX( intersection.point.x );
    var centerY = modelViewTransform.modelToViewY( intersection.point.y );
    var normalX = modelViewTransform.modelToViewDeltaX( intersection.unitNormal.x );
    var normalY = modelViewTransform.modelToViewDeltaY( intersection.unitNormal.y );
    var normalMagnitude = Math.sqrt( normalX * normalX + normalY * normalY );
    var unitNormalX = normalX / normalMagnitude;
    var unitNormalY = normalY / normalMagnitude;
    var length = 100;//in stage coordinates

    // Show a dotted line of the normal at the interface between two mediums where the laser struck
    this.addChild( new Path( new Shape()
      .moveTo( centerX + unitNormalX * length / 2, centerY + unitNormalY * length / 2 )
      .lineTo( centerX + unitNormalX * -length / 2, centerY + unitNormalY * -length / 2 ), {
      stroke: 'black',
      lineDash: [ 10, 5 ]
    } ) );
  }

  return inherit( Node, IntersectionNode, {} );
} );