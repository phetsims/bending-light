// Copyright 2015-2019, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved (in one direction).
 * It is only shown when the cursor is over the laser and is non-interactive.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import inherit from '../../../../phet-core/js/inherit.js';
import CurvedArrowShape from '../../../../scenery-phet/js/CurvedArrowShape.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import bendingLight from '../../bendingLight.js';

/**
 * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
 * @param {Laser} laser - model of laser
 * @param {number} deltaAngle - deltaAngle in radians
 * @param {Property.<boolean>} showDragHandlesProperty - determines whether to show arrows
 * @param {function} notAtMax - function that determines whether the laser is already at the max angle (if at the max
 * angle then that drag handle disappears)
 * @param {number} laserImageWidth - width of the laser
 * @param {number} rotationArrowAngleOffset - for unknown reasons the rotation arrows are off by PI/4 on the
 *                                            intro/more-tools screen, so account for that here.
 * @constructor
 */
function RotationDragHandle( modelViewTransform, laser, deltaAngle, showDragHandlesProperty, notAtMax,
                             laserImageWidth, rotationArrowAngleOffset ) {

  Node.call( this );
  const self = this;

  // Property to help determine whether the drag handle should be shown
  const notAtMaximumProperty = new DerivedProperty( [
      laser.emissionPointProperty,
      laser.pivotProperty,
      showDragHandlesProperty
    ],
    function( emissionPoint, pivot, showDragHandles ) {
      return notAtMax( laser.getAngle() ) && showDragHandles;
    }
  );

  // Show the drag handle if the "show drag handles" is true and if the laser isn't already at the max angle.
  notAtMaximumProperty.linkAttribute( self, 'visible' );

  // Add drag arrow path
  const dragArrow = new Path( null, { fill: '#33FF00', stroke: 'black' } );
  this.addChild( dragArrow );
  const arrowHeadHeight = deltaAngle > 0 ? -7 : 7;
  const isArrowDirectionAntiClockWise = deltaAngle > 0;

  // add arrow shape
  let radius = modelViewTransform.modelToViewDeltaX( laser.getDistanceFromPivot() ) + laserImageWidth * 0.85;

  // For the Prisms Screen
  if ( laser.getDistanceFromPivot() < 1E-14 ) {
    radius = 95;
    deltaAngle *= 2;
  }

  const startAngle = -laser.getAngle();
  const endAngle = -laser.getAngle() - deltaAngle;
  const counterClockwiseDragArrow = new CurvedArrowShape( radius, startAngle, endAngle, {
    doubleHead: false,
    headWidth: 13.6,
    headHeight: arrowHeadHeight,
    tailWidth: 7.6,
    anticlockwise: isArrowDirectionAntiClockWise
  } );
  dragArrow.setShape( counterClockwiseDragArrow );

  // Update the shape when the laser moves
  Property.multilink( [ laser.emissionPointProperty, showDragHandlesProperty ], function() {
    if ( showDragHandlesProperty.get() ) {
      const dragArrowX = modelViewTransform.modelToViewX( laser.pivotProperty.value.x );
      const dragArrowY = modelViewTransform.modelToViewY( laser.pivotProperty.value.y );

      dragArrow.setRotation( -laser.getAngle() + Math.PI + rotationArrowAngleOffset );
      dragArrow.setTranslation( dragArrowX, dragArrowY );
    }
  } );
}

bendingLight.register( 'RotationDragHandle', RotationDragHandle );

inherit( Node, RotationDragHandle );
export default RotationDragHandle;