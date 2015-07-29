// Copyright 2002-2015, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved (in one direction).
 * It is only shown when the cursor is over the laser and is non-interactive.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var CurvedArrowShape = require( 'SCENERY_PHET/CurvedArrowShape' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Path = require( 'SCENERY/nodes/Path' );

  // images
  var laserImage = require( 'image!BENDING_LIGHT/laser.png' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Laser} laser - model of laser
   * @param {number} deltaAngle - deltaAngle in radians
   * @param {Property.<boolean>} showDragHandlesProperty - determines whether to show arrows
   * @param {function} notAtMax - function that determines whether the laser is already at the max angle (if at the max
   * angle then that drag handle disappears)
   * @constructor
   */
  function RotationDragHandle( modelViewTransform, laser, deltaAngle, showDragHandlesProperty, notAtMax ) {

    Node.call( this );
    var rotationDragHandle = this;

    // temporary property to help determine whether the drag handle should be shown
    var notAtMaximumProperty = new DerivedProperty( [
        laser.emissionPointProperty,
        laser.pivotProperty,
        showDragHandlesProperty ],
      function() {
        return notAtMax( laser.getAngle() ) && showDragHandlesProperty.get();
      } );

    // show the drag handle if the "show drag handles" is true and if
    // the laser isn't already at the max angle.
    notAtMaximumProperty.linkAttribute( rotationDragHandle, 'visible' );

    var image = new Image( laserImage, { scale: 0.58 } );
    var dragArrow = new Path( null, { fill: '#33FF00', stroke: 'black' } );
    this.addChild( dragArrow );
    var EPSILON = 0.6;
    var arrowHeadHeight = deltaAngle > 0 ? -7 : 7;
    var isArrowDirectionAntiClockWise = deltaAngle > 0;
    var startAngleOffset = deltaAngle * (1 - EPSILON);
    var endAngleOffset = deltaAngle * 1.1;
    var update = function() {
      var radius = modelViewTransform.modelToViewDeltaX( laser.getDistanceFromPivot() ) + image.getWidth() * 0.85;
      var startAngle = -laser.getAngle() - startAngleOffset;
      var endAngle = -laser.getAngle() - endAngleOffset;
      var counterClockwiseDragArrow = new CurvedArrowShape( radius, startAngle, endAngle, {
        doubleHead: false,
        headWidth: 13.6,
        headHeight: arrowHeadHeight,
        tailWidth: 7.6,
        anticlockwise: isArrowDirectionAntiClockWise
      } );
      dragArrow.setShape( counterClockwiseDragArrow );
      var dragArrowX = modelViewTransform.modelToViewX( laser.pivot.x );
      var dragArrowY = modelViewTransform.modelToViewY( laser.pivot.y );
      dragArrow.setTranslation( dragArrowX, dragArrowY );
    };

    // update the shape when the laser moves
    laser.emissionPointProperty.link( update );
  }

  return inherit( Node, RotationDragHandle );
} );