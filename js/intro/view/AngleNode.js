//  Copyright 2002-2014, University of Colorado Boulder

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

  // constants
  var CIRCLE_RADIUS = 50; // radius of the circular arc in stage coordinates
  var LINE_HEIGHT = 13;

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
   * @param {Property.<boolean>} showNormalProperty -
   * @param {ObservableArray} rays -
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function} addStepListener -
   * @public
   * @constructor
   */
  function AngleNode( showAnglesProperty, showNormalProperty, rays, modelViewTransform, addStepListener ) {
    Node.call( this );

    // Only show the AngleNode when it is selected via a checkbox
    showAnglesProperty.linkAttribute( this, 'visible' );

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
      return new Text( '', { fontSize: 12 } );
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

    showNormalProperty.link( function( showNormal ) {

      // Only show the top marker when the normal is not shown, since they would interfere if both shown together 
      upperMark.visible = !showNormal;

      // Update the lower mark as well, Only visible when the bottom readout is visible *and* normals are not shown.
      dirty = true;
    } );

    this.addChild( lowerMark );
    this.addChild( upperMark );

    // Only redraw when necessary to improve performance.
    var dirty = true;
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
        var refractedRay = rays.length > 2 ? rays.get( 2 ) : MOCK_ZERO_RAY; // when there is total internal reflection, this ray does not appear

        var incomingAngleFromNormal = incomingRay.getAngle() + Math.PI / 2;
        var refractedAngleFromNormal = refractedRay.getAngle() + Math.PI / 2;

        upperArcPath.shape = incomingAngleFromNormal >= 1E-6 ?
                             Shape.arc(
                               getOriginX(),
                               getOriginY(),
                               CIRCLE_RADIUS,
                               Math.PI - incomingRay.getAngle(),
                               -reflectedRay.getAngle(),
                               false
                             ) :
                             null;

        lowerArcPath.shape = refractedAngleFromNormal >= 1E-6 ?
                             Shape.arc(
                               getOriginX(),
                               getOriginY(),
                               CIRCLE_RADIUS,
                               Math.PI / 2,
                               Math.PI / 2 - refractedAngleFromNormal,
                               true
                             ) :
                             null;

        var origin = modelViewTransform.modelToViewXY( 0, 0 );

        // send out a ray from the origin past the center of the angle to position the readout
        var incomingRayDegreesFromNormal = Math.round( incomingAngleFromNormal * 180 / Math.PI );
        var refractedRayDegreesFromNormal = Math.round( refractedAngleFromNormal * 180 / Math.PI );
        var incomingReadoutText = incomingRayDegreesFromNormal.toFixed( 0 ) + '\u00B0';
        var incomingReadoutDirection = Vector2.createPolar( CIRCLE_RADIUS + LINE_HEIGHT, -Math.PI / 2 - incomingAngleFromNormal / 2 );
        var reflectedReadoutDirection = Vector2.createPolar( CIRCLE_RADIUS + LINE_HEIGHT, -Math.PI / 2 + incomingAngleFromNormal / 2 );
        var refractedReadoutDirection = Vector2.createPolar( CIRCLE_RADIUS + LINE_HEIGHT, +Math.PI / 2 - refractedAngleFromNormal / 2 );

        incomingReadout.text = incomingReadoutText;
        incomingReadout.center = origin.plus( incomingReadoutDirection ).plusXY( incomingRayDegreesFromNormal >= 20 ? 0 : -25, 0 );

        reflectedReadout.text = incomingReadoutText; // It's the same
        reflectedReadout.center = origin.plus( reflectedReadoutDirection ).plusXY( incomingRayDegreesFromNormal >= 20 ? 0 : +25, 0 );

        var refractedReadoutText = refractedRayDegreesFromNormal.toFixed( 0 ) + '\u00B0';

        // Total internal reflection, or not a significant refracted ray (light coming horizontally)
        refractedReadout.visible = refractedRay.powerFraction >= 1E-6;
        lowerArcPath.visible = refractedRay.powerFraction >= 1E-6;
        lowerMark.visible = !showNormalProperty.value && refractedRay.powerFraction >= 1E-6;

        refractedReadout.text = refractedReadoutText;
        refractedReadout.center = origin.plus( refractedReadoutDirection ).plusXY( refractedRayDegreesFromNormal >= 20 ? 0 : +25, 0 );

        dirty = false;
      }
    } );
  }

  return inherit( Node, AngleNode );
} );