// Copyright 2015-2017, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved.
 * It is only shown when the cursor is over the laser and is non-interactive.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );

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

    const arrowNode = new ArrowNode( 0, 0, 0, 0, {
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
          const laserAngle = -laser.getAngle();
          const magnitude = laserImageWidth * 0.35;
          const viewDeltaX = magnitude * Math.cos( laserAngle );
          const viewDeltaY = magnitude * Math.sin( laserAngle );
          const tailX = modelViewTransform.modelToViewX( laserEmission.x ) + viewDeltaX;
          const tailY = modelViewTransform.modelToViewY( laserEmission.y ) + viewDeltaY;
          arrowNode.setTranslation( tailX, tailY );
        }
      } );
  }

  bendingLight.register( 'TranslationDragHandle', TranslationDragHandle );
  
  return inherit( Node, TranslationDragHandle );
} );