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
  var Shape = require( 'KITE/Shape' );
  var Ray2 = require( 'DOT/Ray2' );

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {LightRay} lightRay - model of light ray
   * @constructor
   */
  function LightRayNode( modelViewTransform, lightRay ) {

    var color = lightRay.color;

    // Update the view coordinates for the start and end of this ray
    var viewStart = modelViewTransform.modelToViewPosition( lightRay.tip );
    var viewEnd = modelViewTransform.modelToViewPosition( lightRay.tail );

    // Restricted the light ray view coordinates (start and end )within the specific window(rectangle) area to support in firefox browser
    // Note : if the values are to long rays rendering different directions
    // TODO : need to find out , why firefox behaving differently
    var shape = Shape.rectangle( -100000, -100000, 200000, 200000 );
    if ( !shape.containsPoint( viewStart ) ) {
      var intersection = shape.intersection( new Ray2( viewEnd, viewStart.minus( viewEnd ).normalize() ) );
      if ( intersection.length ) {
        viewStart = intersection[ 0 ].point;
      }
    }

    // Light ray color
    var rayColor = new Color( color.getRed(), color.getGreen(), color.getBlue(), Math.sqrt( lightRay.powerFraction ) );

    Line.call( this, viewStart, viewEnd, {
      lineWidth: modelViewTransform.modelToViewDeltaX( lightRay.getRayWidth() ),
      stroke: rayColor
    } );
  }

  return inherit( Line, LightRayNode );
} );