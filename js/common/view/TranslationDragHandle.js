// Copyright 2015-2020, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved.
 * It is only shown when the cursor is over the laser and is non-interactive.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import bendingLight from '../../bendingLight.js';

class TranslationDragHandle extends Node {

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinate frames
   * @param {Laser} laser - model of laser
   * @param {number} dx - length of horizontal arrow
   * @param {number} dy - length of vertical arrow
   * @param {Property.<boolean>} showDragHandlesProperty - determines whether to show arrows
   * @param {number} laserImageWidth - width of the laser
   * @constructor
   */
  constructor( modelViewTransform, laser, dx, dy, showDragHandlesProperty, laserImageWidth ) {

    super();

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

    // update the position when laser pivot or emission point change
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
}

bendingLight.register( 'TranslationDragHandle', TranslationDragHandle );

export default TranslationDragHandle;