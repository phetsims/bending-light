// Copyright 2015-2019, University of Colorado Boulder

/**
 * Node that depicts a the normal vector at a light-ray / medium interface intersection.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import bendingLight from '../../bendingLight.js';

/**
 * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
 * @param {Intersection} intersection - specifies details of intersection point and unit normal
 * @param {Property.<string|Color>} strokeProperty - the stroke to use for the intersection node
 * @constructor
 */
function IntersectionNode( modelViewTransform, intersection, strokeProperty ) {

  const centerX = modelViewTransform.modelToViewX( intersection.point.x );
  const centerY = modelViewTransform.modelToViewY( intersection.point.y );
  const normalX = modelViewTransform.modelToViewDeltaX( intersection.unitNormal.x );
  const normalY = modelViewTransform.modelToViewDeltaY( intersection.unitNormal.y );
  const normalMagnitude = Math.sqrt( normalX * normalX + normalY * normalY );
  const unitNormalX = normalX / normalMagnitude;
  const unitNormalY = normalY / normalMagnitude;
  const length = 100;//in stage coordinates

  // Show a dotted line of the normal at the interface between two mediums where the laser struck
  const x1 = centerX + unitNormalX * length / 2;
  const y1 = centerY + unitNormalY * length / 2;
  const x2 = centerX + unitNormalX * -length / 2;
  const y2 = centerY + unitNormalY * -length / 2;
  Line.call( this, x1, y1, x2, y2, {
    stroke: strokeProperty.value,
    lineDash: [ 10, 5 ]
  } );

  const handle = strokeProperty.linkAttribute( this, 'stroke' );

  // @public - dispose of the IntersectionNode, getting rid of the attached listeners
  this.dispose = function() {
    strokeProperty.unlink( handle );
  };
}

bendingLight.register( 'IntersectionNode', IntersectionNode );

inherit( Line, IntersectionNode );
export default IntersectionNode;