// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for drawing a single light ray.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
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
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {LightRay} lightRay - model of light ray
   * @constructor
   */
  function LightRayNode( modelViewTransform, lightRay ) {

    Node.call( this, { pickable: false } );
    this.lightRay = lightRay;
    var color = this.lightRay.color;
    this.modelViewTransform = modelViewTransform;

    // update the view coordinates for the start and end of this ray
    this.viewStart = modelViewTransform.modelToViewPosition( this.lightRay.tip );
    this.viewEnd = modelViewTransform.modelToViewPosition( this.lightRay.tail );

    // Restricted the light ray view coordinates (start and end )within the specific window(rectangle) area to support in firefox browser
    // Note : if the values are to long rays rendering different directions
    // TODO : need to find out , why firefox behaving differently
    var shape = new Rectangle( -100000, -100000, 200000, 200000 );
    if ( !shape.getShape().containsPoint( this.viewStart ) ) {
      var intersection = shape.getShape().intersection(
        new Ray2( this.viewEnd, this.viewStart.minus( this.viewEnd ).normalize() ) );
      if ( intersection.length ) {
        this.viewStart = intersection[ 0 ].point;
      }
    }

    // light ray color
    var rayColor = new Color( color.getRed(), color.getGreen(), color.getBlue(), Math.sqrt( lightRay.powerFraction ) );

    var lightRayPath = new Path( new Shape().moveToPoint( this.viewStart )
      .lineToPoint( this.viewEnd ), {
      lineWidth: modelViewTransform.modelToViewDeltaX( lightRay.getRayWidth() ),
      stroke: rayColor
    } );

    // add the Path
    this.addChild( lightRayPath );
  }

  return inherit( Node, LightRayNode, {

    /**
     * Get the line traversed by this light ray in view coordinates, for usage with the Bresenham algorithm in the
     * WhiteLightNode
     * @public
     * @returns {Line}
     */
    getLine: function() {
      return new Line( this.viewStart, this.viewEnd );
    },

    /**
     * Get the color of the light ray
     * @public
     * @returns {Color}
     */
    getColor: function() {
      return this.lightRay.color;
    }
  } );
} );
