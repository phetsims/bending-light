// Copyright 2015, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved (in one direction).
 * It is only shown when the cursor is over the laser and is non-interactive.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var CurvedArrowShape = require( 'SCENERY_PHET/CurvedArrowShape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );

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
    var rotationDragHandle = this;

    // Property to help determine whether the drag handle should be shown
    var notAtMaximumProperty = new DerivedProperty( [
        laser.emissionPointProperty,
        laser.pivotProperty,
        showDragHandlesProperty
      ],
      function( emissionPoint, pivot, showDragHandles ) {
        return notAtMax( laser.getAngle() ) && showDragHandles;
      }
    );

    // Show the drag handle if the "show drag handles" is true and if the laser isn't already at the max angle.
    notAtMaximumProperty.linkAttribute( rotationDragHandle, 'visible' );

    // Add drag arrow path
    var dragArrow = new Path( null, { fill: '#33FF00', stroke: 'black' } );
    this.addChild( dragArrow );
    var arrowHeadHeight = deltaAngle > 0 ? -7 : 7;
    var isArrowDirectionAntiClockWise = deltaAngle > 0;

    // add arrow shape
    var radius = modelViewTransform.modelToViewDeltaX( laser.getDistanceFromPivot() ) + laserImageWidth * 0.85;

    // For the Prisms Screen
    if ( laser.getDistanceFromPivot() < 1E-14 ) {
      radius = 95;
      deltaAngle *= 2;
    }

    var startAngle = -laser.getAngle();
    var endAngle = -laser.getAngle() - deltaAngle;
    var counterClockwiseDragArrow = new CurvedArrowShape( radius, startAngle, endAngle, {
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
        var dragArrowX = modelViewTransform.modelToViewX( laser.pivot.x );
        var dragArrowY = modelViewTransform.modelToViewY( laser.pivot.y );

        dragArrow.setRotation( -laser.getAngle() + Math.PI + rotationArrowAngleOffset );
        dragArrow.setTranslation( dragArrowX, dragArrowY );
      }
    } );
  }

  return inherit( Node, RotationDragHandle );
} );