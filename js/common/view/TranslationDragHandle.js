// Copyright 2002-2015, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved.
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
  var Image = require( 'SCENERY/nodes/Image' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Property = require( 'AXON/Property' );

  //images
  var laserImage = require( 'image!BENDING_LIGHT/laser.png' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinate frames
   * @param {Laser} laser - model of laser
   * @param {number} dx - length of horizontal arrow
   * @param {number} dy - length of vertical arrow
   * @param {Property<boolean>} showDragHandlesProperty
   * @constructor
   */
  function TranslationDragHandle( modelViewTransform, laser, dx, dy, showDragHandlesProperty ) {

    Node.call( this );
    var translationDragHandle = this;

    showDragHandlesProperty.linkAttribute( translationDragHandle, 'visible' );

    var image = new Image( laserImage );

    var counterClockwiseDragArrow = new ArrowNode( 0, 0, 0, 0, {
      headHeight: 16,
      headWidth: 16,
      tailWidth: 8,
      fill: '#33FF00',
      doubleHead: true
    } );
    translationDragHandle.addChild( counterClockwiseDragArrow );

    // update the location when laser pivot or emission point change
    Property.multilink( [ laser.pivotProperty, laser.emissionPointProperty ],
      function( laserPivot, laserEmission ) {
        var laserAngle = -laser.getAngle();
        var magnitude = image.getWidth() * 0.35;
        var viewDeltaX = magnitude * Math.cos( laserAngle );
        var viewDeltaY = magnitude * Math.sin( laserAngle );
        var tailX = modelViewTransform.modelToViewX( laserEmission.x ) + viewDeltaX;
        var tailY = modelViewTransform.modelToViewY( laserEmission.y ) + viewDeltaY;
        counterClockwiseDragArrow.setTailAndTip( tailX - dx, tailY - dy, tailX + dx, tailY + dy );
      } );
  }

  return inherit( Node, TranslationDragHandle );
} );