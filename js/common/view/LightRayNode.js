// Copyright 2002-2015, University of Colorado
/**
 * Node for drawing a single light ray.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  //var Line = require( 'SCENERY/nodes/Line' );
  var Vector2 = require( 'DOT/Vector2' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param lightRay
   * @constructor
   */
  function LightRayNode( modelViewTransform, lightRay ) {

    Node.call( this );
    this.lightRay = lightRay;
    var color = this.lightRay.getColor();
    this.modelViewTransform = modelViewTransform;
    //Update the view coordinates for the start and end of this ray
    this.viewStart = modelViewTransform.modelToViewPosition( this.lightRay.tip );
    this.viewEnd = modelViewTransform.modelToViewPosition( this.lightRay.tail );

    var path = new Path( new Shape().moveTo( this.viewStart.x, this.viewStart.y )
      .lineTo( this.viewEnd.x, this.viewEnd.y ), {
      fill: new Color( color.getRed(), color.getGreen(), color.getBlue(),
        Math.sqrt( lightRay.getPowerFraction() ) ),
      lineWidth: 3,
      stroke: new Color( color.getRed(), color.getGreen(), color.getBlue(),
        Math.sqrt( lightRay.getPowerFraction() ) )
    } );
    //Add the PPath
    this.addChild( path );
    //User cannot interact with the light ray directly
    this.setPickable( false );
  }

  return inherit( Node, LightRayNode, {
    /**
     * Get the line traversed by this light ray in view coordinates,
     * for usage with the Bresenham algorithm in the WhiteLightNode
     * @returns {Vector2}
     */
    getLine: function() {
      return new Vector2( this.viewStart, this.viewEnd );
    },
    getColor: function() {
      return this.lightRay.getColor();
    },
    getLightRay: function() {
      return this.lightRay;
    }
  } );
} );

