// Copyright 2015, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved.
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
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinate frames
   * @param {Laser} laser - model of laser
   * @param {number} dx - length of horizontal arrow
   * @param {number} dy - length of vertical arrow
   * @param {Property.<boolean>} showDragHandlesProperty - determines whether to show arrows
   * @param {number} laserImageWidth - width of the laser
   * @constructor
   */
  function TranslationDragHandle( modelViewTransform, laser, dx, dy, showDragHandlesProperty, laserImageWidth ) {

    Node.call( this );

    showDragHandlesProperty.linkAttribute( this, 'visible' );

    var arrowNode = new ArrowNode( 0, 0, 0, 0, {
      headHeight: 16,
      headWidth: 16,
      tailWidth: 8,
      fill: '#33FF00',
      doubleHead: true
    } );
    this.addChild( arrowNode );

    arrowNode.setTailAndTip( -dx, -dy, +dx, +dy );

    // update the location when laser pivot or emission point change
    Property.multilink( [ laser.pivotProperty, laser.emissionPointProperty, showDragHandlesProperty ],
      function( laserPivot, laserEmission ) {
        if ( showDragHandlesProperty.get() ) {
          var laserAngle = -laser.getAngle();
          var magnitude = laserImageWidth * 0.35;
          var viewDeltaX = magnitude * Math.cos( laserAngle );
          var viewDeltaY = magnitude * Math.sin( laserAngle );
          var tailX = modelViewTransform.modelToViewX( laserEmission.x ) + viewDeltaX;
          var tailY = modelViewTransform.modelToViewY( laserEmission.y ) + viewDeltaY;
          arrowNode.setTranslation( tailX, tailY );
        }
      } );
  }

  return inherit( Node, TranslationDragHandle );
} );