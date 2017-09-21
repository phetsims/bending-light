// Copyright 2015-2017, University of Colorado Boulder

/**
 * Node for drawing the laser itself, including an on/off button and ability to rotate/translate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var BooleanRoundStickyToggleButton = require( 'SUN/buttons/BooleanRoundStickyToggleButton' );
  var Color = require( 'SCENERY/util/Color' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var laserKnobImage = require( 'image!BENDING_LIGHT/laser_knob.png' );
  var laserWithoutKnobImage = require( 'image!BENDING_LIGHT/laser.png' );

  // constants
  var dragRegionColor = new Color( 255, 0, 0, 0 );
  var rotationRegionColor = new Color( 0, 0, 255, 0 );

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

    var laserImage = hasKnob ? laserKnobImage : laserWithoutKnobImage;

    // @public (read-only), Used for radius and length of drag handlers
    this.laserImageWidth = laserImage.width;

    // When mousing over or starting to drag the laser, increment the over count.  If it is more than zero
    // then show the drag handles.  This ensures they will be shown whenever dragging or over, and they won't flicker
    var overCountProperty = new Property( 0 );
    overCountProperty.link( function( overCount ) {
      showRotationDragHandlesProperty.value = overCount > 0;
    } );

    Node.call( this, { cursor: 'pointer' } );
    var self = this;

    // add laser image
    var laserImageNode = new Image( laserImage, { scale: 0.58 } );
    this.addChild( laserImageNode );
    laserImageNode.rotateAround( laserImageNode.getCenter(), Math.PI );

    var lightImageWidth = laserImageNode.getWidth();
    var lightImageHeight = laserImageNode.getHeight();

    // drag handlers can choose which of these regions to use for drag events
    var fractionBackToRotateHandle = 34.0 / 177.0;
    var frontRectangle = Shape.rect( 0, 0, lightImageWidth * (1 - fractionBackToRotateHandle), lightImageHeight );

    var backRectangle = Shape.rect( lightImageWidth * (1 - fractionBackToRotateHandle), 0,
      lightImageWidth * fractionBackToRotateHandle, lightImageHeight );
    var fullRectangle = Shape.rect( 0, 0, lightImageWidth, lightImageHeight );

    // re usable vector to avoid vector allocation
    var emissionPointEndLocation = new Vector2();

    // When the window reshapes, make sure the laser remains in the play area
    dragBoundsProperty.link( function( dragBounds ) {
      var center = laser.emissionPointProperty.value;
      var eroded = dragBounds.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );

      var newEmissionPoint = modelViewTransform.viewToModelBounds( eroded ).getClosestPoint( center.x, center.y );
      var delta = newEmissionPoint.minus( laser.emissionPointProperty.value );
      laser.translate( delta.x, delta.y );
    } );

    // add the drag region for translating the laser
    var start;
    var translationRegionPath = new Path( translationRegion( fullRectangle, frontRectangle ), {
      fill: dragRegionColor
    } );
    translationRegionPath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = self.globalToParentPoint( event.pointer.point );
        showTranslationDragHandlesProperty.value = true;
      },
      drag: function( event ) {

        var laserNodeDragBounds = dragBoundsProperty.value.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );
        var laserDragBoundsInModelValues = modelViewTransform.viewToModelBounds( laserNodeDragBounds );

        var endDrag = self.globalToParentPoint( event.pointer.point );
        var deltaX = modelViewTransform.viewToModelDeltaX( endDrag.x - start.x );
        var deltaY = modelViewTransform.viewToModelDeltaY( endDrag.y - start.y );

        // location of final emission point with out constraining to bounds
        emissionPointEndLocation.setXY( laser.emissionPointProperty.value.x + deltaX, laser.emissionPointProperty.value.y + deltaY );

        // location of final emission point with constraining to bounds
        var emissionPointEndLocationInBounds = laserDragBoundsInModelValues.closestPointTo( emissionPointEndLocation );

        var translateX = emissionPointEndLocationInBounds.x - laser.emissionPointProperty.value.x;
        var translateY = emissionPointEndLocationInBounds.y - laser.emissionPointProperty.value.y;
        laser.translate( translateX, translateY );

        // Store the position of caught point after translating. Can be obtained by adding distance between emission
        // point and drag point (end - emissionPointEndLocation) to emission point (emissionPointEndLocationInBounds)
        // after translating.
        var boundsDx = emissionPointEndLocationInBounds.x - emissionPointEndLocation.x;
        var boundsDY = emissionPointEndLocationInBounds.y - emissionPointEndLocation.y;
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
    var rotationRegionPath = new Path( rotationRegion( fullRectangle, backRectangle ), { fill: rotationRegionColor } );
    this.addChild( rotationRegionPath );

    // Increase the touch area for the rotation region and move it toward the back
    rotationRegionPath.touchArea = rotationRegionPath.bounds.dilated( 8 ).shiftedX( 8 );

    rotationRegionPath.addInputListener( new SimpleDragHandler( {
      start: function() {
        showTranslationDragHandlesProperty.value = false;
        overCountProperty.value = overCountProperty.value + 1;
      },
      drag: function( event ) {
        var coordinateFrame = self.parents[ 0 ];
        var laserAnglebeforeRotate = laser.getAngle();
        var localLaserPosition = coordinateFrame.globalToLocalPoint( event.pointer.point );
        var angle = Math.atan2( modelViewTransform.viewToModelY( localLaserPosition.y ) - laser.pivotProperty.value.y,
          modelViewTransform.viewToModelX( localLaserPosition.x ) - laser.pivotProperty.value.x );
        var laserAngleAfterClamp = clampDragAngle( angle );

        // prevent laser from going to 90 degrees when in wave mode, should go until laser bumps into edge.
        var pastMaxAngle = laserAngleAfterClamp > BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
        if ( laser.waveProperty.value && pastMaxAngle && laser.topLeftQuadrant ) {
          laserAngleAfterClamp = BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
        }
        laser.setAngle( laserAngleAfterClamp );

        var laserNodeDragBounds = dragBoundsProperty.value.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );
        var laserDragBoundsInModelValues = modelViewTransform.viewToModelBounds( laserNodeDragBounds );
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
    var redButton = new BooleanRoundStickyToggleButton( laser.onProperty, {
      radius: 11,
      centerX: 28,
      centerY: laserImageNode.centerY,
      baseColor: 'red',
      touchAreaDilation: 5
    } );
    this.addChild( redButton );

    // update the laser position
    laser.emissionPointProperty.link( function( newEmissionPoint ) {
      var emissionPointX = modelViewTransform.modelToViewX( newEmissionPoint.x );
      var emissionPointY = modelViewTransform.modelToViewY( newEmissionPoint.y );
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
      var delta = modelViewTransform.viewToModelDeltaXY( x, y );
      laser.translate( delta.x, delta.y );
    };
  }

  bendingLight.register( 'LaserNode', LaserNode );
  
  return inherit( Node, LaserNode );
} );