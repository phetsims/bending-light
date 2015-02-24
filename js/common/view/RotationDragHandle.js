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
 // var DerivedProperty = require( 'AXON/DerivedProperty' );
  //var CurvedArrowShape = require( 'SCENERY_PHET/CurvedArrowShape' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Vector2 = require( 'DOT/Vector2' );
  //var Shape = require( 'KITE/Shape' );
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );

  //images
  var laserImage = require( 'image!BENDING_LIGHT/laser.png' );


  /**
   *
   * @param {ModelViewTransform2}modelViewTransform
   * @param {Laser}laser
   * @param {Number}deltaAngleDegrees
   * @param showDragHandles
   * @param notAtMax
   * @constructor
   */
  function RotationDragHandle( modelViewTransform, laser, deltaAngleDegrees, showDragHandles, notAtMax ) {
    Node.call( this );
    var rotationDragHandle = this;
  /*  //Temporary property to help determine whether the drag handle should be shown
    var notAtMaximum = new DerivedProperty( [ laser.emissionPointProperty, laser.pivotProperty ], function() {
      return notAtMax( laser.getAngle() );
    } );
    //Show the drag handle if the "show drag handles" is true and if
    // the laser isn't already at the max angle.

    showDragHandles = notAtMaximum;*/
    showDragHandles.link( function( show ) {
        rotationDragHandle.setVisible( show );
    } );
    var image = new Image( laserImage,{scale:0.7} );
    var dragArrow = new Path( null, { fill: '#33FF00',stroke:'black' } );
    this.addChild( dragArrow );

    // convert radian to degree
    function toRadians( inDegrees ) {
      return inDegrees * (Math.PI / 180);
    }

   var update = function() {
      //Draw a curved shape with an arc
      var EPSILON = 0.1;
      var distance = modelViewTransform.modelToViewDeltaX( laser.getDistanceFromPivot() ) +
                     image.getWidth() * 0.85;
      var viewOrigin = modelViewTransform.modelToViewPosition( laser.pivot );
      var laserAngleInDegrees = laser.getAngle() * 180 / Math.PI;
      /*      var arcX = -distance + viewOrigin.x;
       var arcY = -distance + viewOrigin.y;
       var arcWidth = 2 * distance;
       var arcStartAngle = laserAngleInDegrees;
       var arcEndAngle = deltaAngleDegrees;
       //var arc = new Arc2D.Double( , , 2 * distance, 2 * distance, laserAngleInDegrees, deltaAngleDegrees, Arc2D.OPEN );
       var arcShape = Shape.arc(
       arcX, arcY, 30, toRadians(arcStartAngle), toRadians(arcEndAngle), false
       );*/
      var arrowTail = viewOrigin.plus( Vector2.createPolar( distance, toRadians( -laserAngleInDegrees - deltaAngleDegrees * ( 1 - EPSILON ) ) ) );
      var arrowTip = viewOrigin.plus( Vector2.createPolar( distance, toRadians( -laserAngleInDegrees - deltaAngleDegrees * 1.1 ) ) );
      var newArrowShape = new ArrowShape( arrowTail.x, arrowTail.y, arrowTip.x, arrowTip.y );
      dragArrow.setShape( newArrowShape );
    };
    //Update the shape when the laser moves
    laser.emissionPointProperty.link( function() {
      update();
    } );
  }

  return inherit( Node, RotationDragHandle );
} );