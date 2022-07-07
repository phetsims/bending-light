// Copyright 2015-2022, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved.
 * It is only shown when the cursor is over the laser and is non-interactive.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import Laser from '../model/Laser.js';

class TranslationDragHandle extends Node {

  /**
   * @param modelViewTransform - converts between model and view co-ordinate frames
   * @param laser - model of laser
   * @param dx - length of horizontal arrow
   * @param dy - length of vertical arrow
   * @param showDragHandlesProperty - determines whether to show arrows
   * @param laserImageWidth - width of the laser
   */
  public constructor( modelViewTransform: ModelViewTransform2, laser: Laser, dx: number, dy: number, showDragHandlesProperty: Property<boolean>, laserImageWidth: number ) {

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
    Multilink.multilink( [ laser.pivotProperty, laser.emissionPointProperty, showDragHandlesProperty ],
      ( laserPivot, laserEmission, showDragHandles ) => {
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