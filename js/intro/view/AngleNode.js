// Copyright 2015-2020, University of Colorado Boulder

/**
 * Shows the angles between the rays and the vertical when enabled.
 * Described in https://github.com/phetsims/bending-light/issues/174
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import bendingLight from '../../bendingLight.js';

// constants
const CIRCLE_RADIUS = 50; // radius of the circular arc in stage coordinates
const LINE_HEIGHT = 13;
const NUM_DIGITS = 1; // number of digits in the text readouts
const ROUNDING_FACTOR = 10; // Round to the nearest tenth
const BUMP_TO_SIDE_DISTANCE = 38; // How far to move the text to the side if it was in the way of the rays
const TEXT_COLOR = 'black'; // The gray from the phet-io logo, which works well against black and white

// When there is total internal reflection, treat it as if it is a powerless ray for simplicity
// Also used if there is no reflected ray
const MOCK_ZERO_RAY = {
  getAngle: () => 0,
  powerFraction: 0
};

class AngleNode extends Node {

  /**
   * @param {Property.<boolean>} showAnglesProperty -
   * @param {Property.<boolean>} laserOnProperty -
   * @param {Property.<boolean>} showNormalProperty -
   * @param {ObservableArrayDef} rays -
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function} addStepListener -
   */
  constructor( showAnglesProperty, laserOnProperty, showNormalProperty, rays, modelViewTransform,
               addStepListener ) {
    super();

    // Only show the AngleNode when it is selected via a checkbox and the laser is on
    Property.multilink( [ showAnglesProperty, laserOnProperty ], ( showAngles, laserOn ) => {
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

    const createText = () => {
      const text = new Text( '', { fontSize: 12, fill: TEXT_COLOR } );
      const panel = new Panel( text, {
        fill: 'white',
        opacity: 0.75,
        stroke: null,
        lineWidth: 0, // width of the background border
        xMargin: 3,
        yMargin: 3,
        cornerRadius: 6, // radius of the rounded corners on the background
        resize: true, // dynamically resize when content bounds change
        backgroundPickable: false,
        align: 'center', // {string} horizontal of content in the pane, left|center|right
        minWidth: 0 // minimum width of the panel
      } );

      // defines ES5 getter/setter
      Object.defineProperty( panel, 'text', {
        get: () => 'hello', // TODO: Is this correct?
        set: value => { text.text = value; },

        // Make it configurable and enumerable so it's easy to override...
        configurable: true,
        enumerable: true
      } );

      return panel;
    };

    // Readout for the angle for the incoming light ray
    const incomingReadout = createText();
    this.addChild( incomingReadout );

    // Readout for the angle for the reflected light ray, which will always read the same value as the
    // incoming light ray for physics reasons.
    const reflectedReadout = createText();
    this.addChild( reflectedReadout );

    const refractedReadout = createText();
    this.addChild( refractedReadout );

    // Helper function used to create the vertical line marker above and below the origin
    const createLine = y => new Line(
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
     * Select the ray of the given type 'incident' | 'reflected' | 'incident', or null if there isn't one of that type
     * @param type
     * @returns {LightRay}
     */
    const getRay = type => {
      let selected = null;
      for ( let i = 0; i < rays.length; i++ ) {
        const ray = rays.get( i );
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

        const getShape = ( angle, startAngle, endAngle, anticlockwise ) => angle >= 1E-6 ?
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
        const incomingReadoutText = `${incomingRayDegreesFromNormal.toFixed( NUM_DIGITS )}\u00B0`;

        const createDirectionVector = angle => Vector2.createPolar( CIRCLE_RADIUS + LINE_HEIGHT + 5, angle );
        const incomingReadoutDirection = createDirectionVector( -Math.PI / 2 - incomingAngleFromNormal / 2 );
        const reflectedReadoutDirection = createDirectionVector( -Math.PI / 2 + incomingAngleFromNormal / 2 );
        const refractedReadoutDirection = createDirectionVector( +Math.PI / 2 - refractedAngleFromNormal / 2 );

        incomingReadout.text = incomingReadoutText;

        // When the angle becomes too small, pop the text out so that it won't be obscured by the ray
        const angleThresholdToBumpToSide = 30; // degrees

        incomingReadout.center = origin.plus( incomingReadoutDirection )
          .plusXY( incomingRayDegreesFromNormal >= angleThresholdToBumpToSide ? 0 : -BUMP_TO_SIDE_DISTANCE, 0 );

        reflectedReadout.text = incomingReadoutText; // It's the same
        reflectedReadout.center = origin.plus( reflectedReadoutDirection )
          .plusXY( incomingRayDegreesFromNormal >= angleThresholdToBumpToSide ? 0 : +BUMP_TO_SIDE_DISTANCE, 0 );

        reflectedReadout.visible = showReflectedAngle;

        const refractedReadoutText = `${refractedRayDegreesFromNormal.toFixed( NUM_DIGITS )}\u00B0`;

        // Total internal reflection, or not a significant refracted ray (light coming horizontally)
        const showLowerAngle = refractedRay.powerFraction >= 1E-6 && !isIncomingRayHorizontal;

        refractedReadout.visible = showLowerAngle;
        lowerArcPath.visible = showLowerAngle;
        lowerMark.visible = !showNormalProperty.value && showLowerAngle;

        refractedReadout.text = refractedReadoutText;
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