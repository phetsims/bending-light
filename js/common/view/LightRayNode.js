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
  var Line = require( 'SCENERY/nodes/Line' );
  var Color = require( 'SCENERY/util/Color' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Ray2 = require( 'DOT/Ray2' );

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {LightRay} lightRay - model of light ray
   * @constructor
   */
  function LightRayNode( modelViewTransform, lightRay ) {

    this.lightRay = lightRay;
    var color = this.lightRay.color;
    this.modelViewTransform = modelViewTransform;

    // Update the view coordinates for the start and end of this ray
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

    // Light ray color
    var rayColor = new Color( color.getRed(), color.getGreen(), color.getBlue(), Math.sqrt( lightRay.powerFraction ) );

    Line.call( this, this.viewStart, this.viewEnd, {
      lineWidth: modelViewTransform.modelToViewDeltaX( lightRay.getRayWidth() ),
      stroke: rayColor
    } );
  }

  return inherit( Line, LightRayNode, {

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