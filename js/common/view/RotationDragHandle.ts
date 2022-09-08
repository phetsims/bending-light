// Copyright 2015-2022, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved (in one direction).
 * It is only shown when the cursor is over the laser and is non-interactive.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import CurvedArrowShape from '../../../../scenery-phet/js/CurvedArrowShape.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import Laser from '../model/Laser.js';

class RotationDragHandle extends Node {

  /**
   * @param modelViewTransform - Transform between model and view coordinate frames
   * @param laser - model of laser
   * @param deltaAngle - deltaAngle in radians
   * @param showDragHandlesProperty - determines whether to show arrows
   * @param notAtMax - function that determines whether the laser is already at the max angle (if at the max
   * angle then that drag handle disappears)
   * @param laserImageWidth - width of the laser
   * @param rotationArrowAngleOffset - for unknown reasons the rotation arrows are off by PI/4 on the
   *                                            intro/more-tools screen, so account for that here.
   */
  public constructor( modelViewTransform: ModelViewTransform2, laser: Laser, deltaAngle: number, showDragHandlesProperty: Property<boolean>, notAtMax: ( n: number ) => boolean,
                      laserImageWidth: number, rotationArrowAngleOffset: number ) {

    super();

    // Property to help determine whether the drag handle should be shown
    const notAtMaximumProperty = new DerivedProperty( [
        laser.emissionPointProperty,
        laser.pivotProperty,
        showDragHandlesProperty
      ],
      ( emissionPoint, pivot, showDragHandles ) => notAtMax( laser.getAngle() ) && showDragHandles
    );

    // Show the drag handle if the "show drag handles" is true and if the laser isn't already at the max angle.
    notAtMaximumProperty.linkAttribute( this, 'visible' );

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
    Multilink.multilink( [ laser.emissionPointProperty, showDragHandlesProperty ], () => {
      if ( showDragHandlesProperty.get() ) {
        const dragArrowX = modelViewTransform.modelToViewX( laser.pivotProperty.value.x );
        const dragArrowY = modelViewTransform.modelToViewY( laser.pivotProperty.value.y );

        dragArrow.setRotation( -laser.getAngle() + Math.PI + rotationArrowAngleOffset );
        dragArrow.setTranslation( dragArrowX, dragArrowY );
      }
    } );
  }
}

bendingLight.register( 'RotationDragHandle', RotationDragHandle );

export default RotationDragHandle;