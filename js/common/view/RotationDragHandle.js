// Copyright 2002-2015, University of Colorado
/**
 * Graphic that depicts how the laser may be moved (in one direction).
 * It is only shown when the cursor is over the laser and is non-interactive.
 *
 * @author Sam Reid
 * @author Chandrashekar bemagoni(Actual Concepts)
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

  //images
  var laserImage = require( 'image!BENDING_LIGHT/laser.png' );


  /**
   *
   * @param {ModelViewTransform2}modelViewTransform
   * @param {Laser}laser
   * @param {Number} deltaAngle - deltaAngle in radians
   * @param showDragHandles
   * @param notAtMax
   * @constructor
   */
  function RotationDragHandle( modelViewTransform, laser, deltaAngle, showDragHandles, notAtMax ) {
    Node.call( this );
    var rotationDragHandle = this;

    //Temporary property to help determine whether the drag handle should be shown
    var notAtMaximumProperty = new DerivedProperty( [ laser.emissionPointProperty, laser.pivotProperty, showDragHandles ], function() {
      return notAtMax( laser.getAngle() ) && ( showDragHandles.get() );
    } );

    //Show the drag handle if the "show drag handles" is true and if
    // the laser isn't already at the max angle.
    notAtMaximumProperty.link( function( show ) {
      rotationDragHandle.setVisible( show );
    } );
    var image = new Image( laserImage, { scale: 0.7 } );
    var dragArrow = new Path( null, { fill: '#33FF00', stroke: 'black' } );
    this.addChild( dragArrow );

    var update = function() {
      var EPSILON = 0.6;
      var radius = modelViewTransform.modelToViewDeltaX( laser.getDistanceFromPivot() ) + image.getWidth() * 0.85;
      var startAngle = -laser.getAngle() - deltaAngle * (1 - EPSILON);
      var endAngle = -laser.getAngle() - deltaAngle * 1.1;
      var counterClockwiseDragArrow = new CurvedArrowShape( radius, startAngle, endAngle, {
        doubleHead: false,
        headWidth: 12,
        headHeight: deltaAngle > 0 ? -10 : 10,
        tailWidth: 6,
        anticlockwise: deltaAngle > 0
      } );
      dragArrow.setShape( counterClockwiseDragArrow );
      dragArrow.setTranslation( modelViewTransform.modelToViewPosition( laser.pivot ) );
    };
    //Update the shape when the laser moves
    laser.emissionPointProperty.link( function() {
      update();
    } );
  }

  return inherit( Node, RotationDragHandle );
} );