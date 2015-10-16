// Copyright 2002-2014, University of Colorado Boulder

/**
 * Shows the angles between the rays and the vertical when enabled.
 * Described in https://github.com/phetsims/bending-light/issues/174
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var Panel = require( 'SUN/Panel' );
  var Util = require( 'DOT/Util' );

  // constants
  var CIRCLE_RADIUS = 50; // radius of the circular arc in stage coordinates
  var LINE_HEIGHT = 13;
  var NUM_DIGITS = 1; // number of digits in the text readouts
  var ROUNDING_FACTOR = 10; // Round to the nearest tenth
  var BUMP_TO_SIDE_DISTANCE = 38; // How far to move the text to the side if it was in the way of the rays
  var TEXT_COLOR = 'black'; // The gray from the phet-io logo, which works well against black and white

  // When there is total internal reflection, treat it as if it is a powerless ray for simplicity
  var MOCK_ZERO_RAY = {
    getAngle: function() {
      return 0;
    },
    powerFraction: 0
  };

  /**
   * Main constructor.
   *
   * @param {Property.<boolean>} showAnglesProperty -
   * @param {Property.<boolean>} laserOnProperty -
   * @param {Property.<boolean>} showNormalProperty -
   * @param {ObservableArray} rays -
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function} addStepListener -
   * @public
   * @constructor
   */
  function AngleNode( showAnglesProperty, laserOnProperty, showNormalProperty, rays, modelViewTransform,
                      addStepListener ) {
    Node.call( this );

    var angleNode = this;

    // Only show the AngleNode when it is selected via a checkbox and the laser is on
    Property.multilink( [ showAnglesProperty, laserOnProperty ], function( showAngles, laserOn ) {
      angleNode.visible = showAngles && laserOn;
    } );

    var createArcPath = function() {
      return new Path( null, { stroke: 'black', lineWidth: 1 } );
    };

    var getOriginX = function() {
      return modelViewTransform.modelToViewX( 0 );
    };

    var getOriginY = function() {
      return modelViewTransform.modelToViewY( 0 );
    };

    // Show the top angles both with a single arc so it is continuous
    var upperArcPath = createArcPath();
    this.addChild( upperArcPath );

    var lowerArcPath = createArcPath();
    this.addChild( lowerArcPath );

    var createText = function() {
      var text = new Text( '', { fontSize: 12, fill: TEXT_COLOR } );
      var panel = new Panel( text, {
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
        get: function() { return 'hello'; },
        set: function( value ) { text.text = value; },

        // Make it configurable and enumerable so it's easy to override...
        configurable: true,
        enumerable: true
      } );

      return panel;
    };

    // Readout for the angle for the incoming light ray
    var incomingReadout = createText();
    this.addChild( incomingReadout );

    // Readout for the angle for the reflected light ray, which will always read the same value as the
    // incoming light ray for physics reasons.
    var reflectedReadout = createText();
    this.addChild( reflectedReadout );

    var refractedReadout = createText();
    this.addChild( refractedReadout );

    // Helper function used to create the vertical line marker above and below the origin
    var createLine = function( y ) {
      return new Line(
        getOriginX(), getOriginY() + y - LINE_HEIGHT / 2,
        getOriginX(), getOriginY() + y + LINE_HEIGHT / 2, {
          stroke: 'black',
          lineWidth: 1
        }
      );
    };

    var lowerMark = createLine( CIRCLE_RADIUS );
    var upperMark = createLine( -CIRCLE_RADIUS );

    // Only redraw when necessary to improve performance.
    var dirty = true;

    showNormalProperty.link( function( showNormal ) {

      // Only show the top marker when the normal is not shown, since they would interfere if both shown together
      upperMark.visible = !showNormal;

      // Update the lower mark as well, Only visible when the bottom readout is visible *and* normals are not shown.
      dirty = true;
    } );

    this.addChild( lowerMark );
    this.addChild( upperMark );

    var markDirty = function() {
      dirty = true;
    };
    rays.addListeners( markDirty, markDirty );

    // Update the shape each frame
    addStepListener( function() {
      if ( rays.length >= 2 && dirty ) {

        // Get the rays from the model.  They must be specified in the following order.
        var incomingRay = rays.get( 0 );
        var reflectedRay = rays.get( 1 );

        // when there is total internal reflection, this ray does not appear
        var refractedRay = rays.length > 2 ? rays.get( 2 ) : MOCK_ZERO_RAY;

        var incomingAngleFromNormal = incomingRay.getAngle() + Math.PI / 2;
        var refractedAngleFromNormal = refractedRay.getAngle() + Math.PI / 2;

        var getShape = function( angle, startAngle, endAngle, anticlockwise ) {
          return angle >= 1E-6 ?
                 Shape.arc(
                   getOriginX(),
                   getOriginY(),
                   CIRCLE_RADIUS,
                   startAngle,
                   endAngle,
                   anticlockwise
                 ) :
                 null;
        };
        upperArcPath.shape = getShape(
          incomingAngleFromNormal,
          Math.PI - incomingRay.getAngle(),
          -reflectedRay.getAngle(),
          false );

        lowerArcPath.shape = getShape( refractedAngleFromNormal,
          Math.PI / 2,
          Math.PI / 2 - refractedAngleFromNormal,
          true
        );
        var origin = new Vector2( getOriginX(), getOriginY() );

        // send out a ray from the origin past the center of the angle to position the readout
        var incomingRayDegreesFromNormal = Util.roundSymmetric(
            incomingAngleFromNormal * 180 / Math.PI * ROUNDING_FACTOR
          ) / ROUNDING_FACTOR;
        var refractedRayDegreesFromNormal = Util.roundSymmetric(
            refractedAngleFromNormal * 180 / Math.PI * ROUNDING_FACTOR
          ) / ROUNDING_FACTOR;
        var incomingReadoutText = incomingRayDegreesFromNormal.toFixed( NUM_DIGITS ) + '\u00B0';

        var createDirectionVector = function( angle ) {
          return Vector2.createPolar( CIRCLE_RADIUS + LINE_HEIGHT + 5, angle );
        };
        var incomingReadoutDirection = createDirectionVector( -Math.PI / 2 - incomingAngleFromNormal / 2 );
        var reflectedReadoutDirection = createDirectionVector( -Math.PI / 2 + incomingAngleFromNormal / 2 );
        var refractedReadoutDirection = createDirectionVector( +Math.PI / 2 - refractedAngleFromNormal / 2 );

        incomingReadout.text = incomingReadoutText;

        // When the angle becomes too small, pop the text out so that it won't be obscured by the ray
        var angleThresholdToBumpToSide = 30; // degrees

        incomingReadout.center = origin.plus( incomingReadoutDirection )
          .plusXY( incomingRayDegreesFromNormal >= angleThresholdToBumpToSide ? 0 : -BUMP_TO_SIDE_DISTANCE, 0 );

        reflectedReadout.text = incomingReadoutText; // It's the same
        reflectedReadout.center = origin.plus( reflectedReadoutDirection )
          .plusXY( incomingRayDegreesFromNormal >= angleThresholdToBumpToSide ? 0 : +BUMP_TO_SIDE_DISTANCE, 0 );

        var refractedReadoutText = refractedRayDegreesFromNormal.toFixed( NUM_DIGITS ) + '\u00B0';

        // Total internal reflection, or not a significant refracted ray (light coming horizontally)
        var showLowerAngle = refractedRay.powerFraction >= 1E-6;

        refractedReadout.visible = showLowerAngle;
        lowerArcPath.visible = showLowerAngle;
        lowerMark.visible = !showNormalProperty.value && showLowerAngle;

        refractedReadout.text = refractedReadoutText;
        var bumpBottomReadout = refractedRayDegreesFromNormal >= angleThresholdToBumpToSide;
        refractedReadout.center = origin.plus( refractedReadoutDirection )
          .plusXY( bumpBottomReadout ? 0 : +BUMP_TO_SIDE_DISTANCE, 0 );

        dirty = false;
      }
    } );
  }

  return inherit( Node, AngleNode );
} );