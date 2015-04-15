// Copyright 2002-2015, University of Colorado Boulder
/**
 * View for drawing a single light ray.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );
  var Line = require( 'KITE/segments/Line' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform , Transform between model and view coordinate frames
   * @param {LightRay} lightRay
   * @constructor
   */
  function LightRayNode( modelViewTransform, lightRay ) {

    Node.call( this );
    this.lightRay = lightRay;
    var color = this.lightRay.getColor();
    this.modelViewTransform = modelViewTransform;

    // update the view coordinates for the start and end of this ray
    this.viewStart = modelViewTransform.modelToViewPosition( this.lightRay.tip );
    this.viewEnd = modelViewTransform.modelToViewPosition( this.lightRay.tail );

    var path = new Path( new Shape().moveTo( this.viewStart.x, this.viewStart.y )
      .lineTo( this.viewEnd.x, this.viewEnd.y ), {
      fill: new Color( color.getRed(), color.getGreen(), color.getBlue(),
        Math.sqrt( lightRay.getPowerFraction() ) ),
      lineWidth: modelViewTransform.modelToViewDeltaX( lightRay.getRayWidth() ),
      stroke: new Color( color.getRed(), color.getGreen(), color.getBlue(),
        Math.sqrt( lightRay.getPowerFraction() ) )
    } );
    // add the PPath
    this.addChild( path );
    // user cannot interact with the light ray directly
    this.setPickable( false );
  }

  return inherit( Node, LightRayNode, {
    /**
     * Get the line traversed by this light ray in view coordinates,
     * for usage with the Bresenham algorithm in the WhiteLightNode
     * @public
     * @returns {Line}
     */
    getLine: function() {
      return new Line( this.viewStart, this.viewEnd );
    },

    /**
     * @public
     * @returns {*|Element.color|*}
     */
    getColor: function() {
      return this.lightRay.getColor();
    },

    /**
     * @public
     * @returns {LightWaveNode.lightRay|*}
     */
    getLightRay: function() {
      return this.lightRay;
    }
  } );
} );

