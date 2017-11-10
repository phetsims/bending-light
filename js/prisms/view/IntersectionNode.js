// Copyright 2015-2017, University of Colorado Boulder

/**
 * Node that depicts a the normal vector at a light-ray / medium interface intersection.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Intersection} intersection - specifies details of intersection point and unit normal
   * @param {Property.<string|Color>} strokeProperty - the stroke to use for the intersection node
   * @constructor
   */
  function IntersectionNode( modelViewTransform, intersection, strokeProperty ) {

    var centerX = modelViewTransform.modelToViewX( intersection.point.x );
    var centerY = modelViewTransform.modelToViewY( intersection.point.y );
    var normalX = modelViewTransform.modelToViewDeltaX( intersection.unitNormal.x );
    var normalY = modelViewTransform.modelToViewDeltaY( intersection.unitNormal.y );
    var normalMagnitude = Math.sqrt( normalX * normalX + normalY * normalY );
    var unitNormalX = normalX / normalMagnitude;
    var unitNormalY = normalY / normalMagnitude;
    var length = 100;//in stage coordinates

    // Show a dotted line of the normal at the interface between two mediums where the laser struck
    var x1 = centerX + unitNormalX * length / 2;
    var y1 = centerY + unitNormalY * length / 2;
    var x2 = centerX + unitNormalX * -length / 2;
    var y2 = centerY + unitNormalY * -length / 2;
    Line.call( this, x1, y1, x2, y2, {
      stroke: strokeProperty.value,
      lineDash: [ 10, 5 ]
    } );

    var handle = strokeProperty.linkAttribute( this, 'stroke' );

    // @public - dispose of the IntersectionNode, getting rid of the attached listeners
    this.dispose = function() {
      strokeProperty.unlink( handle );
    };
  }

  bendingLight.register( 'IntersectionNode', IntersectionNode );
  
  return inherit( Line, IntersectionNode );
} );