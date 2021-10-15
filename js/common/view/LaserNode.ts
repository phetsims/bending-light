// Copyright 2015-2021, University of Colorado Boulder

/**
 * Node for drawing the laser itself, including an on/off button and ability to rotate/translate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import knobImageData from '../../../images/knob_png.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Laser from '../model/Laser.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SceneryEvent from '../../../../scenery/js/input/SceneryEvent.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';

type LaserNodeOptions = {
  tandem: Tandem
};

class LaserNode extends Node {
  laserImageWidth: number;
  private readonly laser: Laser;
  private readonly modelViewTransform: ModelViewTransform2;

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Laser} laser - model for the laser
   * @param {Property.<boolean>} showRotationDragHandlesProperty - to show laser node rotate arrows
   * @param {Property.<boolean>} showTranslationDragHandlesProperty - to show laser node drag arrows
   * @param {function} clampDragAngle - function that limits the angle of laser to its bounds
   *                                       translating the laser
   * @param {boolean} hasKnob - true if the laser should be shown with a knob
   * @param {Property.<Bounds2>} dragBoundsProperty - bounds that define where the laser may be dragged
   * @param {function} occlusionHandler - function that will move the laser out from behind a control panel if dropped
   *                                      there
   * @param {Object} [options?]
   */
  constructor( modelViewTransform: ModelViewTransform2, laser: Laser, showRotationDragHandlesProperty: Property<boolean>, showTranslationDragHandlesProperty: Property<boolean>,
               clampDragAngle: ( n: number ) => number, hasKnob: boolean, dragBoundsProperty: Property<Bounds2>, occlusionHandler: ( laserNode: LaserNode ) => void,
               options?: Partial<LaserNodeOptions> ) {

    const filledOptions = merge( { tandem: Tandem.OPTIONAL }, options ) as LaserNodeOptions;
    const laserPointerNode = new LaserPointerNode( laser.onProperty, {
      bodySize: new Dimension2( 70, 30 ),
      nozzleSize: new Dimension2( 10, 25 ),
      buttonRadius: 12,
      buttonXMargin: 2,
      buttonYMargin: 2,
      cornerRadius: 2,
      buttonTouchAreaDilation: 4,
      getButtonLocation: ( bodyNode: Node ) => bodyNode.rightCenter.blend( bodyNode.center, 0.5 )
    } ) as Node;

    const knobImage = hasKnob ? ( new Image( knobImageData, {
      scale: 0.58,
      rightCenter: laserPointerNode.leftCenter

      // This will be resolved when Image is TypeScript
    } ) as unknown as Node ) : null;
    if ( knobImage ) {
      knobImage.touchArea = knobImage.localBounds.dilatedXY( 15, 27 ).shiftedX( -15 );
      hasKnob && laserPointerNode.addChild( knobImage );
    }
    else {
      laserPointerNode.touchArea = laserPointerNode.bounds.dilated( 8 ).shiftedX( -8 );
    }

    laserPointerNode.translate( laserPointerNode.width, laserPointerNode.height / 2 );

    // If there is a knob ("Prisms" screen), it is used to rotate the laser.
    // If there is no knob ("Intro" and "More Tools" screens), then the laser is rotated by dragging the laser itself.
    const rotationTarget = ( hasKnob ? knobImage : laserPointerNode ) as Node;

    // When mousing over or starting to drag the laser, increment the over count.  If it is more than zero
    // then show the drag handles.  This ensures they will be shown whenever dragging or over, and they won't flicker
    const overCountProperty = new Property( 0 );
    overCountProperty.link( ( overCount: number ) => showRotationDragHandlesProperty.set( overCount > 0 ) );

    super( merge( { cursor: 'pointer' }, options ) );

    // @public (read-only), Used for radius and length of drag handlers
    this.laserImageWidth = laserPointerNode.width;

    // add laser image
    laserPointerNode.rotateAround( laserPointerNode.getCenter(), Math.PI );

    this.addChild( laserPointerNode );

    const lightImageHeight = laserPointerNode.getHeight();

    // re usable vector to avoid vector allocation
    const emissionPointEndPosition = new Vector2( 0, 0 );

    // When the window reshapes, make sure the laser remains in the play area
    dragBoundsProperty.link( ( dragBounds: Bounds2 ) => {
      const center = laser.emissionPointProperty.value;
      const eroded = dragBounds.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );

      const newEmissionPoint = modelViewTransform.viewToModelBounds( eroded ).getClosestPoint( center.x, center.y );
      const delta = newEmissionPoint.minus( laser.emissionPointProperty.value );
      laser.translate( delta.x, delta.y );
    } );

    // add the drag region for translating the laser
    let start: Vector2 | null;

    // On the "Prisms" screen, the laser can be translated by dragging the laser, and rotated by dragging the knob on
    // the back of the laser.  This part of the code handles the translation.
    if ( hasKnob ) {
      const translationListener = new SimpleDragHandler( {
        start: ( event: SceneryEvent ) => {
          start = this.globalToParentPoint( event.pointer.point as Vector2 );
          showTranslationDragHandlesProperty.value = true;
        },
        drag: ( event: SceneryEvent ) => {

          const laserNodeDragBounds = dragBoundsProperty.value.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );
          const laserDragBoundsInModelValues = modelViewTransform.viewToModelBounds( laserNodeDragBounds );

          const endDrag = this.globalToParentPoint( event.pointer.point as Vector2 );
          if ( start ) {
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
          }
        },
        end: () => {
          showTranslationDragHandlesProperty.value = false;
          occlusionHandler( this );
        }
      } );
      laserPointerNode.addInputListener( translationListener );

      // Listeners to enable/disable the translation dragHandles
      const translationOverListener = {
        enter: () => {
          showTranslationDragHandlesProperty.value = !showRotationDragHandlesProperty.value;
        },
        exit: () => {
          showTranslationDragHandlesProperty.value = false;
        }
      };
      laserPointerNode.addInputListener( translationOverListener );

      const isTranslationEnabledProperty = new BooleanProperty( true, {
        tandem: filledOptions.tandem.createTandem( 'isTranslationEnabledProperty' ),
        phetioDocumentation: 'This Property determines whether the laser can be translated, in the "Prisms" screen only. ' +
                             'A value of false means the laser cannot be translated, though it may still be rotatable.'
      } );
      isTranslationEnabledProperty.lazyLink( ( isEnabled: boolean ) => {
        if ( isEnabled ) {
          laserPointerNode.addInputListener( translationListener );
          laserPointerNode.addInputListener( translationOverListener );
        }
        else {
          laserPointerNode.removeInputListener( translationListener );
          laserPointerNode.removeInputListener( translationOverListener );
        }
      } );
    }

    const rotationListener = new SimpleDragHandler( {
      start: () => {
        showTranslationDragHandlesProperty.value = false;
        overCountProperty.value++;
      },
      drag: ( event: SceneryEvent ) => {
        const coordinateFrame = this.parents[ 0 ];
        const laserAnglebeforeRotate = laser.getAngle();
        const localLaserPosition = coordinateFrame.globalToLocalPoint( event.pointer.point as Vector2 );
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
      end: () => {
        overCountProperty.value--;
      }
    } );
    rotationTarget.addInputListener( rotationListener );

    // Listeners to enable/disable the rotation dragHandles
    const rotationOverListener = {
      enter: () => {
        overCountProperty.value++;
      },
      exit: () => {
        overCountProperty.value--;
      }
    };
    rotationTarget.addInputListener( rotationOverListener );

    const isRotationEnabledProperty = new BooleanProperty( true, {
      tandem: filledOptions.tandem.createTandem( 'isRotationEnabledProperty' ),
      phetioDocumentation: 'This Property determines whether the laser can be rotated.  On the "Intro" and "More Tools" ' +
                           'screens, a value of false renders the laser unmovable. On the "Prisms" screen, it hides ' +
                           'the rotation knob on the back of the laser and makes it non-rotatable (though it may still ' +
                           'be translatable).'
    } );
    isRotationEnabledProperty.lazyLink( ( isEnabled: boolean ) => {
      if ( isEnabled ) {
        rotationTarget.addInputListener( rotationListener );
        rotationTarget.addInputListener( rotationOverListener );
      }
      else {
        rotationTarget.removeInputListener( rotationListener );
        rotationTarget.removeInputListener( rotationOverListener );
      }
      if ( knobImage ) {
        knobImage.visible = isEnabled;
      }
    } );

    // update the laser position
    laser.emissionPointProperty.link( ( newEmissionPoint: Vector2 ) => {
      const emissionPointX = modelViewTransform.modelToViewX( newEmissionPoint.x );
      const emissionPointY = modelViewTransform.modelToViewY( newEmissionPoint.y );
      this.setTranslation( emissionPointX, emissionPointY );
      this.setRotation( -laser.getAngle() );
      this.translate( 0, -lightImageHeight / 2 );
    } );

    this.laser = laser;
    this.modelViewTransform = modelViewTransform;
  }

  /**
   * Called from the occlusion handler.  Translates the view by the specified amount by translating the corresponding
   * model
   * @param {number} x
   * @param {number} y
   * @public
   */
  translateViewXY( x: number, y: number ) {
    const delta = this.modelViewTransform.viewToModelDeltaXY( x, y );
    this.laser.translate( delta.x, delta.y );
  }
}

bendingLight.register( 'LaserNode', LaserNode );

export default LaserNode;