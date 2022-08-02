// Copyright 2015-2022, University of Colorado Boulder

/**
 * Shows the angles between the rays and the vertical when enabled.
 * Described in https://github.com/phetsims/bending-light/issues/174
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Line, Node, Path } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import LightRay from '../../common/model/LightRay.js';
import RayTypeEnum from '../../common/model/RayTypeEnum.js';
import AngleTextView from './AngleTextView.js';

// constants
const CIRCLE_RADIUS = 50; // radius of the circular arc in stage coordinates
const LINE_HEIGHT = 13;
const NUM_DIGITS = 1; // number of digits in the text readouts
const ROUNDING_FACTOR = 10; // Round to the nearest tenth
const BUMP_TO_SIDE_DISTANCE = 38; // How far to move the text to the side if it was in the way of the rays

type TLightRay = {
  getAngle: () => number;
  powerFraction: number;
};

// When there is total internal reflection, treat it as if it is a powerless ray for simplicity
// Also used if there is no reflected ray
const MOCK_ZERO_RAY: TLightRay = {
  getAngle: () => 0,
  powerFraction: 0
};

class AngleNode extends Node {

  /**
   * @param showAnglesProperty -
   * @param laserOnProperty -
   * @param showNormalProperty -
   * @param rays -
   * @param modelViewTransform
   * @param addStepListener -
   */
  public constructor( showAnglesProperty: Property<boolean>, laserOnProperty: Property<boolean>, showNormalProperty: Property<boolean>, rays: ObservableArray<LightRay>, modelViewTransform: ModelViewTransform2,
                      addStepListener: ( x: () => void ) => void ) {
    super();

    // Only show the AngleNode when it is selected via a checkbox and the laser is on
    Multilink.multilink( [ showAnglesProperty, laserOnProperty ], ( showAngles, laserOn ) => {
      this.visible = showAngles && laserOn;
    } );

    const createArcPath = () => new Path( null, { stroke: 'black', lineWidth: 1 } );

    const getOriginX = () => modelViewTransform.modelToViewX( 0 );

    const getOriginY = () => modelViewTransform.modelToViewY( 0 );

    // Show the top angles both with a single arc so it is continuous
    const upperArcPath = createArcPath();
    this.addChild( upperArcPath );

    const lowerArcPath = createArcPath();
    this.addChild( lowerArcPath );

    // Readout for the angle for the incoming light ray
    const incomingReadout = new AngleTextView();
    this.addChild( incomingReadout );

    // Readout for the angle for the reflected light ray, which will always read the same value as the
    // incoming light ray for physics reasons.
    const reflectedReadout = new AngleTextView();
    this.addChild( reflectedReadout );

    const refractedReadout = new AngleTextView();
    this.addChild( refractedReadout );

    // Helper function used to create the vertical line marker above and below the origin
    const createLine = ( y: number ) => new Line(
      getOriginX(), getOriginY() + y - LINE_HEIGHT / 2,
      getOriginX(), getOriginY() + y + LINE_HEIGHT / 2, {
        stroke: 'black',
        lineWidth: 1
      }
    );

    const lowerMark = createLine( CIRCLE_RADIUS );
    const upperMark = createLine( -CIRCLE_RADIUS );

    // Only redraw when necessary to improve performance.
    let dirty = true;

    showNormalProperty.link( showNormal => {

      // Only show the top marker when the normal is not shown, since they would interfere if both shown together
      upperMark.visible = !showNormal;

      // Update the lower mark as well, Only visible when the bottom readout is visible *and* normals are not shown.
      dirty = true;
    } );

    this.addChild( lowerMark );
    this.addChild( upperMark );

    const markDirty = () => {
      dirty = true;
    };

    rays.addItemAddedListener( markDirty );
    rays.addItemRemovedListener( markDirty );

    /**
     * Select the ray of the given type 'incident' | 'reflected', or null if there isn't one of that type
     */
    const getRay = ( type: RayTypeEnum | null ): TLightRay => {
      let selected = null;
      for ( let i = 0; i < rays.length; i++ ) {
        const ray = rays[ i ];
        if ( ray.rayType === type ) {
          assert && assert( selected === null, 'multiple rays of the same type' );
          selected = ray;
        }
      }
      if ( selected === null ) {
        return MOCK_ZERO_RAY;
      }
      return selected;
    };

    // Update the shape each frame
    addStepListener( () => {
      if ( dirty ) {

        // Get the rays from the model.  They must be specified in the following order.
        const incomingRay = getRay( 'incident' );
        const reflectedRay = getRay( 'reflected' );
        const refractedRay = getRay( 'transmitted' );
        if ( incomingRay === null && reflectedRay === null && refractedRay === null ) {
          return;
        }

        const incomingAngleFromNormal = incomingRay.getAngle() + Math.PI / 2;
        const refractedAngleFromNormal = refractedRay.getAngle() + Math.PI / 2;

        const getShape = ( angle: number, startAngle: number, endAngle: number, anticlockwise: boolean ) =>
          angle >= 1E-6 ?
          Shape.arc(
            getOriginX(),
            getOriginY(),
            CIRCLE_RADIUS,
            startAngle,
            endAngle,
            anticlockwise
          ) :
          null;

        // Only show the incident angle when the ray is coming in at a shallow angle, see #288
        const isIncomingRayHorizontal = Math.abs( incomingRay.getAngle() ) < 1E-6;

        // When the indices of refraction are equal, there is no reflected ray
        const showReflectedAngle = reflectedRay.powerFraction >= 1E-6 && !isIncomingRayHorizontal;

        upperArcPath.shape = getShape(
          incomingAngleFromNormal,
          Math.PI - incomingRay.getAngle(),
          showReflectedAngle ? -reflectedRay.getAngle() : -Math.PI / 2,
          false );

        lowerArcPath.shape = getShape(
          refractedAngleFromNormal,
          Math.PI / 2,
          Math.PI / 2 - refractedAngleFromNormal,
          true
        );
        const origin = new Vector2( getOriginX(), getOriginY() );

        // send out a ray from the origin past the center of the angle to position the readout
        const incomingRayDegreesFromNormal = Utils.roundSymmetric(
          incomingAngleFromNormal * 180 / Math.PI * ROUNDING_FACTOR
        ) / ROUNDING_FACTOR;
        const refractedRayDegreesFromNormal = Utils.roundSymmetric(
          refractedAngleFromNormal * 180 / Math.PI * ROUNDING_FACTOR
        ) / ROUNDING_FACTOR;
        const incomingReadoutText = `${Utils.toFixed( incomingRayDegreesFromNormal, NUM_DIGITS )}\u00B0`;

        const createDirectionVector = ( angle: number ) => Vector2.createPolar( CIRCLE_RADIUS + LINE_HEIGHT + 5, angle );
        const incomingReadoutDirection = createDirectionVector( -Math.PI / 2 - incomingAngleFromNormal / 2 );
        const reflectedReadoutDirection = createDirectionVector( -Math.PI / 2 + incomingAngleFromNormal / 2 );
        const refractedReadoutDirection = createDirectionVector( +Math.PI / 2 - refractedAngleFromNormal / 2 );

        incomingReadout.setAngleText( incomingReadoutText );

        // When the angle becomes too small, pop the text out so that it won't be obscured by the ray
        const angleThresholdToBumpToSide = 30; // degrees

        incomingReadout.center = origin.plus( incomingReadoutDirection )
          .plusXY( incomingRayDegreesFromNormal >= angleThresholdToBumpToSide ? 0 : -BUMP_TO_SIDE_DISTANCE, 0 );

        reflectedReadout.setAngleText( incomingReadoutText ); // It's the same
        reflectedReadout.center = origin.plus( reflectedReadoutDirection )
          .plusXY( incomingRayDegreesFromNormal >= angleThresholdToBumpToSide ? 0 : +BUMP_TO_SIDE_DISTANCE, 0 );

        reflectedReadout.visible = showReflectedAngle;

        const refractedReadoutText = `${Utils.toFixed( refractedRayDegreesFromNormal, NUM_DIGITS )}\u00B0`;

        // Total internal reflection, or not a significant refracted ray (light coming horizontally)
        const showLowerAngle = refractedRay.powerFraction >= 1E-6 && !isIncomingRayHorizontal;

        refractedReadout.visible = showLowerAngle;
        lowerArcPath.visible = showLowerAngle;
        lowerMark.visible = !showNormalProperty.value && showLowerAngle;

        refractedReadout.setAngleText( refractedReadoutText );
        const bumpBottomReadout = refractedRayDegreesFromNormal >= angleThresholdToBumpToSide;
        refractedReadout.center = origin.plus( refractedReadoutDirection )
          .plusXY( bumpBottomReadout ? 0 : +BUMP_TO_SIDE_DISTANCE, 0 );

        dirty = false;
      }
    } );
  }
}

bendingLight.register( 'AngleNode', AngleNode );

export default AngleNode;