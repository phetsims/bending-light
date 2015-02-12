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
  var Shape = require( 'KITE/Shape' );

  //images
  var laserImage = require( 'image!BENDING_LIGHT/laser.png' );


  function RotationDragHandle( modelViewTransform, laser, deltaAngle, showDragHandles, notAtMax ) {
    Node.call( this );
    var rotationDragHandle = this;
    //Temporary property to help determine whether the drag handle should be shown
    var notAtMaximum = new DerivedProperty( [ laser.emissionPointProperty, laser.pivotProperty ], function() {
      return notAtMax( laser.getAngle() );
    } );
    //Show the drag handle if the "show drag handles" is true and if
    // the laser isn't already at the max angle.
    var showArrow = showDragHandles.and( notAtMaximum );
    showDragHandles.link( function( show ) {
        rotationDragHandle.setVisible( show );
      }
    );
    var image = new Image( laserImage );
    var dragArrow = new Path( null, {
      fill: 'green'
    } );
    this.addChild( dragArrow );

    //Update the Node
    var update = function() {
      var EPSILON = 0.1;
      var startPoint = modelViewTransform.modelToViewPosition( laser.emissionPoint.minus( laser.pivot ) );
      var radius = modelViewTransform.modelToViewDeltaX( laser.getDistanceFromPivot() ) + image.getWidth() * 0.85;
      var startAngle = -laser.getAngle() - deltaAngle * (1 - EPSILON);
      var endAngle = -laser.getAngle() - deltaAngle * 1.1;
      var counterClockwiseDragArrow = new CurvedArrowShape( radius, startAngle, endAngle, {
        headWidth: 20,
        headHeight: 20,
        tailWidth: 10
      } );
      dragArrow.setShape( counterClockwiseDragArrow );
      rotationDragHandle.setTranslation( startPoint.x, startPoint.y );

    };
    //Update the shape when the laser moves
    laser.emissionPointProperty.link( function() {
      update();
    } );
  }

  return inherit( Node, RotationDragHandle );
} );