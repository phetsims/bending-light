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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Ray2 = require( 'DOT/Ray2' );

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


    // Restricted the  light ray view coordinates (start and end )within the specific  window(rectangle) area to support in firefox browser
    // Note : if the values are to long rays rendering  different directions
    // Todo : need to find out , why firefox behaving differently
    var shape = new Rectangle( -100000, -100000, 200000, 200000 );
    if ( !shape.getShape().containsPoint( this.viewStart ) ) {
      var intersection = shape.getShape().intersection( new Ray2( this.viewEnd, this.viewStart.minus( this.viewEnd ).normalized() ) );
      if ( intersection.length ) {
        this.viewStart = intersection[ 0 ].point;
      }
    }

    // light ray color
    var rayColor = new Color( color.getRed(), color.getGreen(), color.getBlue(), Math.sqrt( lightRay.getPowerFraction() ) );

    var path = new Path( new Shape().moveTo( this.viewStart.x, this.viewStart.y )
      .lineTo( this.viewEnd.x, this.viewEnd.y ), {
      lineWidth: modelViewTransform.modelToViewDeltaX( lightRay.getRayWidth() ),
      stroke: rayColor
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
     * @returns {Color}
     */
    getColor: function() {
      return this.lightRay.getColor();
    },

    /**
     * @public
     * @returns {LightRay}
     */
    getLightRay: function() {
      return this.lightRay;
    }
  } );
} );

