// Copyright 2002-2015, University of Colorado Boulder

/**
 * Node for drawing the laser itself, including an on/off button and ability to rotate/translate.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Image = require( 'SCENERY/nodes/Image' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var BooleanRoundStickyToggleButton = require( 'SUN/buttons/BooleanRoundStickyToggleButton' );
  var Shape = require( 'KITE/Shape' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var dragRegionColor = new Color( 255, 0, 0, 0 );
  var rotationRegionColor = new Color( 0, 0, 255, 0 );

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Laser} laser - model for the laser
   * @param {Property.<boolean>} showRotationDragHandlesProperty - to show laser node rotate arrows(direction which laser node can rotate)
   * @param {Property.<boolean>} showTranslationDragHandlesProperty - to show laser node drag arrows(direction which laser node can drag)
   * @param {function} clampDragAngle - function that limits the angle of laser to its bounds
   * @param {function} translationRegion - select from the entire region and front region which should be used for translating the laser
   * @param {function} rotationRegion - select from the entire region and back region which should be used for rotating the laser
   * @param {string} laserImage - name of the laser image
   * @param {Property.<Bounds2>} dragBoundsProperty - bounds that define where the laser may be dragged
   * @param {function} occlusionHandler - function that will move the laser out from behind a control panel if dropped there
   * @constructor
   */
  function LaserNode( modelViewTransform, laser, showRotationDragHandlesProperty, showTranslationDragHandlesProperty,
                      clampDragAngle, translationRegion, rotationRegion, laserImage, dragBoundsProperty, occlusionHandler ) {

    Node.call( this, { cursor: 'pointer' } );
    var laserNode = this;

    // add laser image
    var laserImageNode = new Image( laserImage, { scale: 0.58 } );
    this.addChild( laserImageNode );
    laserImageNode.rotateAround( laserImageNode.getCenter(), Math.PI );

    var lightImageWidth = laserImageNode.getWidth();
    var lightImageHeight = laserImageNode.getHeight();

    // drag handlers can choose which of these regions to use for drag events
    var fractionBackToRotateHandle = 34.0 / 177.0;
    var frontRectangle = new Shape.rect( 0, 0, lightImageWidth * (1 - fractionBackToRotateHandle), lightImageHeight );

    var backRectangle = new Shape.rect( lightImageWidth * (1 - fractionBackToRotateHandle), 0,
      lightImageWidth * fractionBackToRotateHandle, lightImageHeight );
    var fullRectangle = new Shape.rect( 0, 0, lightImageWidth, lightImageHeight );

    //  re usable vector  to avoid vector allocation
    var emissionPointEndLocation = new Vector2();

    // When the window reshapes, make sure the laser remains in the play area
    dragBoundsProperty.link( function( dragBounds ) {
      var center = laser.emissionPoint;
      var eroded = dragBounds.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );
      laser.emissionPoint = modelViewTransform.viewToModelBounds( eroded ).getClosestPoint( center.x, center.y );
    } );

    // add the drag region for translating the laser
    var start;
    var translationRegionPath = new Path( translationRegion( fullRectangle, frontRectangle ), { fill: dragRegionColor } );
    translationRegionPath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = laserNode.globalToParentPoint( event.pointer.point );
        showTranslationDragHandlesProperty.value = true;
      },
      drag: function( event ) {

        var laserNodeDragBounds = dragBoundsProperty.value.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );
        var laserDragBoundsInModelValues = modelViewTransform.viewToModelBounds( laserNodeDragBounds );

        var endDrag = laserNode.globalToParentPoint( event.pointer.point );
        var deltaX = modelViewTransform.viewToModelDeltaX( endDrag.x - start.x );
        var deltaY = modelViewTransform.viewToModelDeltaY( endDrag.y - start.y );

        // location of final emission point with out constraining to bounds
        emissionPointEndLocation.setXY( laser.emissionPoint.x + deltaX, laser.emissionPoint.y + deltaY );

        // location of final emission point with constraining to bounds
        var emissionPointEndLocationInBounds = laserDragBoundsInModelValues.closestPointTo( emissionPointEndLocation );
        laser.translate( emissionPointEndLocationInBounds.x - laser.emissionPoint.x, emissionPointEndLocationInBounds.y - laser.emissionPoint.y );

        // Store the position of caught point after translating. Can be obtained by adding distance between emission
        // point and drag point (end - emissionPointEndLocation) to emission point (emissionPointEndLocationInBounds)
        // after translating.
        endDrag.x = endDrag.x + modelViewTransform.modelToViewDeltaX( emissionPointEndLocationInBounds.x - emissionPointEndLocation.x );
        endDrag.y = endDrag.y + modelViewTransform.modelToViewDeltaY( emissionPointEndLocationInBounds.y - emissionPointEndLocation.y );
        start = endDrag;
        showTranslationDragHandlesProperty.value = true;
      },
      end: function() {
        showTranslationDragHandlesProperty.value = false;
        occlusionHandler( laserNode );
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
    rotationRegionPath.addInputListener( new SimpleDragHandler( {
      start: function() {
        showTranslationDragHandlesProperty.value = false;
        showRotationDragHandlesProperty.value = true;
      },
      drag: function( event ) {
        var coordinateFrame = laserNode.parents[ 0 ];
        var laserAnglebeforeRotate = laser.getAngle();
        var localLaserPosition = coordinateFrame.globalToLocalPoint( event.pointer.point );
        var angle = Math.atan2( modelViewTransform.viewToModelY( localLaserPosition.y ) - laser.pivot.y,
          modelViewTransform.viewToModelX( localLaserPosition.x ) - laser.pivot.x );
        var laserAngleAfterClamp = clampDragAngle( angle );

        // prevent laser from going to 90 degrees when in wave mode, should go until laser bumps into edge.
        if ( laser.wave && laserAngleAfterClamp > BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE && laser.topLeftQuadrant ) {
          laserAngleAfterClamp = BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
        }
        laser.setAngle( laserAngleAfterClamp );

        var laserNodeDragBounds = dragBoundsProperty.value.erodedXY( lightImageHeight / 2, lightImageHeight / 2 );
        var laserDragBoundsInModelValues = modelViewTransform.viewToModelBounds( laserNodeDragBounds );
        if ( !laserDragBoundsInModelValues.containsPoint( laser.emissionPoint ) ) {
          laser.setAngle( laserAnglebeforeRotate );
        }
        showTranslationDragHandlesProperty.value = false;
        showRotationDragHandlesProperty.value = true;
      },
      end: function() {
        showRotationDragHandlesProperty.value = false;
      }
    } ) );

    // Listeners to enable/disable the rotation dragHandles
    rotationRegionPath.addInputListener( {
      enter: function() {
        showRotationDragHandlesProperty.value = true;
      },
      exit: function() {
        showRotationDragHandlesProperty.value = false;
      }
    } );

    // add light emission on/off button
    var redButton = new BooleanRoundStickyToggleButton( laser.onProperty, {
      radius: 11,
      centerX: laserImageNode.centerX,
      centerY: laserImageNode.centerY,
      baseColor: 'red',
      touchExpansion: 5
    } );
    this.addChild( redButton );

    // update the laser position
    laser.emissionPointProperty.link( function( newEmissionPoint ) {
      var emissionPointX = modelViewTransform.modelToViewX( newEmissionPoint.x );
      var emissionPointY = modelViewTransform.modelToViewY( newEmissionPoint.y );
      laserNode.setTranslation( emissionPointX, emissionPointY );
      laserNode.setRotation( -laser.getAngle() );
      laserNode.translate( 0, -lightImageHeight / 2 );

      // So the light always looks like it comes from the top left, despite the laser angle
      redButton.setRotation( laser.getAngle() );
    } );

    // touch area
    this.touchArea = this.localBounds;

    /**
     * Called from the occlusion handler.  Translates the view by the specified amount by translating the corresponding model
     * @param {number} x
     * @param {number} y
     * @public
     */
    this.translateViewXY = function( x, y ) {
      var delta = modelViewTransform.viewToModelDeltaXY( x, y );
      laser.translate( delta.x, delta.y );
    };
  }

  return inherit( Node, LaserNode );
} );