// Copyright 2002-2015, University of Colorado
/**
 * Graphic that depicts how the laser may be moved.
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
  var Image = require( 'SCENERY/nodes/Image' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );

  //images
  var laserImage = require( 'image!BENDING_LIGHT/laser.png' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinate frames
   * @param {Laser} laser
   * @param {Number} dx
   * @param {Number} dy
   * @param {Property<Boolean>} showDragHandles
   * @constructor
   */
  function TranslationDragHandle( modelViewTransform, laser, dx, dy, showDragHandles ) {
    Node.call( this );
    var translationDragHandle = this;
    showDragHandles.link( function( show ) {
      translationDragHandle.setVisible( show );
    } );
    var image = new Image( laserImage );
    //Update the location when laser pivot or emission point change
    Property.multilink( [ laser.pivotProperty, laser.emissionPointProperty ],
      function() {
        translationDragHandle.removeAllChildren();
        var laserEmissionViewPoint = modelViewTransform.modelToViewPosition( laser.emissionPoint );
        var viewDelta = Vector2.createPolar( image.getWidth() / 2, -laser.getAngle() );
        var tailX = laserEmissionViewPoint.x + viewDelta.x;
        var tailY = laserEmissionViewPoint.y + viewDelta.y;
        var counterClockwiseDragArrow = new ArrowNode( tailX, tailY, tailX + dx, tailY + dy, {
          headHeight: 20,
          headWidth: 20,
          tailWidth: 10,
          fill: '#33FF00'
        } );
        translationDragHandle.addChild( counterClockwiseDragArrow );
      } );
  }

  return inherit( Node, TranslationDragHandle );
} );