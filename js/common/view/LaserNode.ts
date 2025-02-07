// Copyright 2015-2024, University of Colorado Boulder

/**
 * Node for drawing the laser itself, including an on/off button and ability to rotate/translate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import SceneryEvent from '../../../../scenery/js/input/SceneryEvent.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import knob_png from '../../../images/knob_png.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import Laser from '../model/Laser.js';

type SelfOptions = EmptySelfOptions;
type ParentOptions = PickRequired<NodeOptions, 'tandem'> & Pick<NodeOptions, 'cursor'>;
type LaserNodeOptions = SelfOptions & ParentOptions;

export default class LaserNode extends Node {

  // Used for radius and length of drag handlers
  public readonly laserImageWidth: number;
  private readonly laser: Laser;
  private readonly modelViewTransform: ModelViewTransform2;

  /**
   * @param modelViewTransform - Transform between model and view coordinate frames
   * @param laser - model for the laser
   * @param showRotationDragHandlesProperty - to show laser node rotate arrows
   * @param showTranslationDragHandlesProperty - to show laser node drag arrows
   * @param clampDragAngle - function that limits the angle of laser to its bounds
   *                                       translating the laser
   * @param hasKnob - true - add a knob, make the laser rotate by dragging the knob, translate by dragging the laser body
   *                  false - don't add a knob, make the laser rotate by dragging the laser body, don't support translation
   * @param dragBoundsProperty - bounds that define where the laser may be dragged
   * @param occlusionHandler - function that will move the laser out from behind a control panel if dropped
   *                                      there
   * @param [providedOptions?]
   */
  public constructor( modelViewTransform: ModelViewTransform2, laser: Laser, showRotationDragHandlesProperty: Property<boolean>, showTranslationDragHandlesProperty: Property<boolean>,
                      clampDragAngle: ( n: number ) => number, hasKnob: boolean, dragBoundsProperty: Property<Bounds2>, occlusionHandler: ( laserNode: LaserNode ) => void,
                      providedOptions?: LaserNodeOptions ) {

    const options = optionize<LaserNodeOptions, SelfOptions, ParentOptions>()( {}, providedOptions );
    const laserPointerNode = new LaserPointerNode( laser.onProperty, {
      bodySize: new Dimension2( 70, 30 ),
      nozzleSize: new Dimension2( 10, 25 ),
      buttonOptions: {
        radius: 12,
        xMargin: 2,
        yMargin: 2,
        touchAreaDilation: 4
      },
      cornerRadius: 2,
      getButtonLocation: ( bodyNode: Node ) => bodyNode.rightCenter.blend( bodyNode.center, 0.5 )
    } );

    const knobImage = hasKnob ? ( new Image( knob_png, {
      scale: 0.58,
      rightCenter: laserPointerNode.leftCenter

      // This will be resolved when Image is TypeScript
    } ) ) : null;
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
    const rotationTarget = hasKnob ? knobImage! : laserPointerNode;

    // When mousing over or starting to drag the laser, increment the over count.  If it is more than zero
    // then show the drag handles.  This ensures they will be shown whenever dragging or over, and they won't flicker
    const overBodyProperty = new BooleanProperty( false );
    const overKnobProperty = new BooleanProperty( false );
    const overButtonProperty = new BooleanProperty( false );
    const isRotatingProperty = new BooleanProperty( false );
    const isDraggingProperty = new BooleanProperty( false );

    Multilink.multilink( [ overBodyProperty, overKnobProperty, isRotatingProperty, overButtonProperty, isDraggingProperty ], ( overBody, overKnob, isRotating, overButton, isDragging ) => {

      if ( hasKnob ) {

        // logic for prisms
        showTranslationDragHandlesProperty.set( isDragging || ( overBody && !overKnob && !isRotating && !overButton ) );
        showRotationDragHandlesProperty.set( overKnob || isRotating );
      }
      else {
        showTranslationDragHandlesProperty.set( false );
        showRotationDragHandlesProperty.set( ( overBody && !overButton ) || isDragging || isRotating );
      }
    } );

    super( combineOptions<LaserNodeOptions>( { cursor: 'pointer' }, providedOptions ) );

    this.laserImageWidth = laserPointerNode.width;

    // add laser image
    laserPointerNode.rotateAround( laserPointerNode.getCenter(), Math.PI );

    this.addChild( laserPointerNode );

    const lightImageHeight = laserPointerNode.getHeight();

    // re usable vector to avoid vector allocation
    const emissionPointEndPosition = new Vector2( 0, 0 );

    // When the window reshapes, make sure the laser remains in the play area
    dragBoundsProperty.link( dragBounds => {
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
      const translationListener = new DragListener( {
        start: ( event: SceneryEvent ) => {
          start = this.globalToParentPoint( event.pointer.point );
          isDraggingProperty.value = true;
        },
        drag: ( event: SceneryEvent ) => {

          const laserNodeDragBounds = dragBoundsProperty.value.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );
          const laserDragBoundsInModelValues = modelViewTransform.viewToModelBounds( laserNodeDragBounds );

          const endDrag = this.globalToParentPoint( event.pointer.point );
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
          }
        },
        end: () => {
          isDraggingProperty.value = false;
          occlusionHandler( this );
        }
      } );
      laserPointerNode.addInputListener( translationListener );

      const isTranslationEnabledProperty = new BooleanProperty( true, {
        tandem: options.tandem.createTandem( 'isTranslationEnabledProperty' ),
        phetioDocumentation: 'This Property determines whether the laser can be translated, in the "Prisms" screen only. ' +
                             'A value of false means the laser cannot be translated, though it may still be rotatable.'
      } );
      isTranslationEnabledProperty.lazyLink( isEnabled => {
        if ( isEnabled ) {
          laserPointerNode.addInputListener( translationListener );

        }
        else {
          laserPointerNode.removeInputListener( translationListener );
        }
      } );

      knobImage!.addInputListener( {
        enter: () => {
          overKnobProperty.value = true;
        },
        exit: () => {
          overKnobProperty.value = false;
        }
      } );
    }

    // Going over the button should hide the rotation arrows
    laserPointerNode.onOffButton!.addInputListener( {
      enter: () => {
        overButtonProperty.value = true;
      },
      exit: () => {
        overButtonProperty.value = false;
      }
    } );

    // Listeners to enable/disable the translation dragHandles
    laserPointerNode.addInputListener( {
      enter: () => {
        overBodyProperty.value = true;
      },
      exit: () => {
        overBodyProperty.value = false;
      }
    } );

    const rotationListener = new DragListener( {
      start: () => {
        // showTranslationDragHandlesProperty.value = false;
        // overBodyProperty.value++;
        isRotatingProperty.value = true;
      },
      drag: ( event: SceneryEvent ) => {
        const coordinateFrame = this.parents[ 0 ];
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
      },
      end: () => {
        isRotatingProperty.value = false;
      }
    } );
    rotationTarget.addInputListener( rotationListener );

    const isRotationEnabledProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'isRotationEnabledProperty' ),
      phetioDocumentation: 'This Property determines whether the laser can be rotated.  On the "Intro" and "More Tools" ' +
                           'screens, a value of false renders the laser unmovable. On the "Prisms" screen, it hides ' +
                           'the rotation knob on the back of the laser and makes it non-rotatable (though it may still ' +
                           'be translatable).'
    } );
    isRotationEnabledProperty.lazyLink( isEnabled => {
      if ( isEnabled ) {
        rotationTarget.addInputListener( rotationListener );
      }
      else {
        rotationTarget.removeInputListener( rotationListener );
      }
      if ( knobImage ) {
        knobImage.visible = isEnabled;
      }
    } );

    // update the laser position
    laser.emissionPointProperty.link( newEmissionPoint => {
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
   */
  public translateViewXY( x: number, y: number ): void {
    const delta = this.modelViewTransform.viewToModelDeltaXY( x, y );
    this.laser.translate( delta.x, delta.y );
  }
}

bendingLight.register( 'LaserNode', LaserNode );