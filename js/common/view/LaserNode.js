// Copyright 2015-2020, University of Colorado Boulder

/**
 * Node for drawing the laser itself, including an on/off button and ability to rotate/translate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import inherit from '../../../../phet-core/js/inherit.js';
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import BooleanRoundStickyToggleButton from '../../../../sun/js/buttons/BooleanRoundStickyToggleButton.js';
import laserKnobImage from '../../../images/laser_knob_png.js';
import laserWithoutKnobImage from '../../../images/laser_png.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';

// constants
const dragRegionColor = new Color( 255, 0, 0, 0 );
const rotationRegionColor = new Color( 0, 0, 255, 0 );

/**
 * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
 * @param {Laser} laser - model for the laser
 * @param {Property.<boolean>} showRotationDragHandlesProperty - to show laser node rotate arrows
 * @param {Property.<boolean>} showTranslationDragHandlesProperty - to show laser node drag arrows
 * @param {function} clampDragAngle - function that limits the angle of laser to its bounds
 * @param {function} translationRegion - select from the entire region and front region which should be used for
 *                                       translating the laser
 * @param {function} rotationRegion - select from the entire region and back region which should be used for rotating
 *                                       the laser
 * @param {boolean} hasKnob - true if the laser should be shown with a knob
 * @param {Property.<Bounds2>} dragBoundsProperty - bounds that define where the laser may be dragged
 * @param {function} occlusionHandler - function that will move the laser out from behind a control panel if dropped
 *                                      there
 * @constructor
 */
function LaserNode( modelViewTransform, laser, showRotationDragHandlesProperty, showTranslationDragHandlesProperty,
                    clampDragAngle, translationRegion, rotationRegion, hasKnob, dragBoundsProperty,
                    occlusionHandler ) {

  const laserImage = hasKnob ? laserKnobImage : laserWithoutKnobImage;

  // @public (read-only), Used for radius and length of drag handlers
  this.laserImageWidth = laserImage.width;

  // When mousing over or starting to drag the laser, increment the over count.  If it is more than zero
  // then show the drag handles.  This ensures they will be shown whenever dragging or over, and they won't flicker
  const overCountProperty = new Property( 0 );
  overCountProperty.link( function( overCount ) {
    showRotationDragHandlesProperty.value = overCount > 0;
  } );

  Node.call( this, { cursor: 'pointer' } );
  const self = this;

  // add laser image
  const laserImageNode = new Image( laserImage, { scale: 0.58 } );
  this.addChild( laserImageNode );
  laserImageNode.rotateAround( laserImageNode.getCenter(), Math.PI );

  const lightImageWidth = laserImageNode.getWidth();
  const lightImageHeight = laserImageNode.getHeight();

  // drag handlers can choose which of these regions to use for drag events
  const fractionBackToRotateHandle = 34.0 / 177.0;
  const frontRectangle = Shape.rect( 0, 0, lightImageWidth * ( 1 - fractionBackToRotateHandle ), lightImageHeight );

  const backRectangle = Shape.rect( lightImageWidth * ( 1 - fractionBackToRotateHandle ), 0,
    lightImageWidth * fractionBackToRotateHandle, lightImageHeight );
  const fullRectangle = Shape.rect( 0, 0, lightImageWidth, lightImageHeight );

  // re usable vector to avoid vector allocation
  const emissionPointEndPosition = new Vector2( 0, 0 );

  // When the window reshapes, make sure the laser remains in the play area
  dragBoundsProperty.link( function( dragBounds ) {
    const center = laser.emissionPointProperty.value;
    const eroded = dragBounds.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );

    const newEmissionPoint = modelViewTransform.viewToModelBounds( eroded ).getClosestPoint( center.x, center.y );
    const delta = newEmissionPoint.minus( laser.emissionPointProperty.value );
    laser.translate( delta.x, delta.y );
  } );

  // add the drag region for translating the laser
  let start;
  const translationRegionPath = new Path( translationRegion( fullRectangle, frontRectangle ), {
    fill: dragRegionColor
  } );
  translationRegionPath.addInputListener( new SimpleDragHandler( {
    start: function( event ) {
      start = self.globalToParentPoint( event.pointer.point );
      showTranslationDragHandlesProperty.value = true;
    },
    drag: function( event ) {

      const laserNodeDragBounds = dragBoundsProperty.value.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );
      const laserDragBoundsInModelValues = modelViewTransform.viewToModelBounds( laserNodeDragBounds );

      const endDrag = self.globalToParentPoint( event.pointer.point );
      const deltaX = modelViewTransform.viewToModelDeltaX( endDrag.x - start.x );
      const deltaY = modelViewTransform.viewToModelDeltaY( endDrag.y - start.y );

      // position of final emission point with out constraining to bounds
      emissionPointEndPosition.setXY( laser.emissionPointProperty.value.x + deltaX, laser.emissionPointProperty.value.y + deltaY );

      // position of final emission point with constraining to bounds
      const emissionPointEndPositionInBounds = laserDragBoundsInModelValues.closestPointTo( emissionPointEndPosition );

      const translateX = emissionPointEndPositionInBounds.x - laser.emissionPointProperty.value.x;
      const translateY = emissionPointEndPositionInBounds.y - laser.emissionPointProperty.value.y;
      laser.translate( translateX, translateY );

      // Store the position of caught point after translating. Can be obtained by adding distance between emission
      // point and drag point (end - emissionPointEndPosition) to emission point (emissionPointEndPositionInBounds)
      // after translating.
      const boundsDx = emissionPointEndPositionInBounds.x - emissionPointEndPosition.x;
      const boundsDY = emissionPointEndPositionInBounds.y - emissionPointEndPosition.y;
      endDrag.x = endDrag.x + modelViewTransform.modelToViewDeltaX( boundsDx );
      endDrag.y = endDrag.y + modelViewTransform.modelToViewDeltaY( boundsDY );

      start = endDrag;
      showTranslationDragHandlesProperty.value = true;
    },
    end: function() {
      showTranslationDragHandlesProperty.value = false;
      occlusionHandler( self );
    }
  } ) );

  // Listeners to enable/disable the translation dragHandles
  translationRegionPath.addInputListener( {
    enter: function() {
      showTranslationDragHandlesProperty.value = showRotationDragHandlesProperty.value ? false : true;
    },
    exit: function() {
      showTranslationDragHandlesProperty.value = false;
    }
  } );
  this.addChild( translationRegionPath );

  // Add the drag region for rotating the laser
  const rotationRegionPath = new Path( rotationRegion( fullRectangle, backRectangle ), { fill: rotationRegionColor } );
  this.addChild( rotationRegionPath );

  // Increase the touch area for the rotation region and move it toward the back
  rotationRegionPath.touchArea = rotationRegionPath.bounds.dilated( 8 ).shiftedX( 8 );

  rotationRegionPath.addInputListener( new SimpleDragHandler( {
    start: function() {
      showTranslationDragHandlesProperty.value = false;
      overCountProperty.value = overCountProperty.value + 1;
    },
    drag: function( event ) {
      const coordinateFrame = self.parents[ 0 ];
      const laserAnglebeforeRotate = laser.getAngle();
      const localLaserPosition = coordinateFrame.globalToLocalPoint( event.pointer.point );
      const angle = Math.atan2( modelViewTransform.viewToModelY( localLaserPosition.y ) - laser.pivotProperty.value.y,
        modelViewTransform.viewToModelX( localLaserPosition.x ) - laser.pivotProperty.value.x );
      let laserAngleAfterClamp = clampDragAngle( angle );

      // prevent laser from going to 90 degrees when in wave mode, should go until laser bumps into edge.
      const pastMaxAngle = laserAngleAfterClamp > BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
      if ( laser.waveProperty.value && pastMaxAngle && laser.topLeftQuadrant ) {
        laserAngleAfterClamp = BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
      }
      laser.setAngle( laserAngleAfterClamp );

      const laserNodeDragBounds = dragBoundsProperty.value.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );
      const laserDragBoundsInModelValues = modelViewTransform.viewToModelBounds( laserNodeDragBounds );
      if ( !laserDragBoundsInModelValues.containsPoint( laser.emissionPointProperty.value ) ) {
        laser.setAngle( laserAnglebeforeRotate );
      }
      showTranslationDragHandlesProperty.value = false;
      showRotationDragHandlesProperty.value = true;
    },
    end: function() {
      overCountProperty.value = overCountProperty.value - 1;
    }
  } ) );

  // Listeners to enable/disable the rotation dragHandles
  rotationRegionPath.addInputListener( {
    enter: function() {
      overCountProperty.value = overCountProperty.value + 1;
    },
    exit: function() {
      overCountProperty.value = overCountProperty.value - 1;
    }
  } );

  // add light emission on/off button
  const redButton = new BooleanRoundStickyToggleButton( laser.onProperty, {
    radius: 11,
    centerX: 28,
    centerY: laserImageNode.centerY,
    baseColor: 'red',
    touchAreaDilation: 5
  } );
  this.addChild( redButton );

  // update the laser position
  laser.emissionPointProperty.link( function( newEmissionPoint ) {
    const emissionPointX = modelViewTransform.modelToViewX( newEmissionPoint.x );
    const emissionPointY = modelViewTransform.modelToViewY( newEmissionPoint.y );
    self.setTranslation( emissionPointX, emissionPointY );
    self.setRotation( -laser.getAngle() );
    self.translate( 0, -lightImageHeight / 2 );

    // So the light always looks like it comes from the top left, despite the laser angle
    redButton.setRotation( laser.getAngle() );
  } );

  /**
   * Called from the occlusion handler.  Translates the view by the specified amount by translating the corresponding
   * model
   * @param {number} x
   * @param {number} y
   * @public
   */
  this.translateViewXY = function( x, y ) {
    const delta = modelViewTransform.viewToModelDeltaXY( x, y );
    laser.translate( delta.x, delta.y );
  };
}

bendingLight.register( 'LaserNode', LaserNode );

inherit( Node, LaserNode );
export default LaserNode;