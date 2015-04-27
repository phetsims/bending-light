// Copyright 2002-2015, University of Colorado Boulder
/**
 * Node for drawing the laser itself, including an on/off button and ability to
 * rotate/translate.
 *
 * @author Sam Reid
 * @author Chandrashekar bemagoni(Actual Concepts)
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
  var RoundStickyToggleButton = require( 'SUN/buttons/RoundStickyToggleButton' );
  var Shape = require( 'KITE/Shape' );
  var ConstraintBounds = require( 'BENDING_LIGHT/common/ConstraintBounds' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );

  // images
  var laserWithoutImage = require( 'image!BENDING_LIGHT/laser.png' );
  var laserKnobImage = require( 'image!BENDING_LIGHT/laser_knob.png' );

  //constants
  var dragRegionColor = new Color( 255, 0, 0, 0 );
  var rotationRegionColor = new Color( 0, 0, 255, 0 );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform , Transform between model and view coordinate frames
   * @param {Laser}laser - model for the laser
   * @param { Property<Boolean> } showRotationDragHandles - to show laser node rotate arrows(direction which laser node can rotate)
   * @param { Property<Boolean> } showTranslationDragHandles -to show laser node drag arrows(direction which laser node can drag)
   * @param {function} clampDragAngle
   * @param {function}translationRegion
   * @param {function}rotationRegion
   * @param {String}imageName
   * @param {Bounds2} dragBounds - bounds that define where the laser may be dragged
   * @constructor
   */
  function LaserNode( modelViewTransform, laser, showRotationDragHandles, showTranslationDragHandles,
                      clampDragAngle, translationRegion, rotationRegion, imageName, dragBounds ) {

    Node.call( this );
    var laserNode = this;
    var laserImage = (imageName === 'laser') ? laserWithoutImage : laserKnobImage;

    //add laser image
    var lightImage = new Image( laserImage, { scale: 0.7 } );
    this.addChild( lightImage );
    lightImage.rotateAround( lightImage.getCenter(), Math.PI );

    //Drag handlers can choose which of these regions to use for drag events
    var fractionBackToRotateHandle = 34.0 / 177.0;
    var frontRectangle = new Shape.rect( 0, 0,
      lightImage.getWidth() * (1 - fractionBackToRotateHandle), lightImage.getHeight() );
    var backRectangle = new Shape.rect( lightImage.getWidth() * (1 - fractionBackToRotateHandle),
      0,
      lightImage.getWidth() * fractionBackToRotateHandle, lightImage.getHeight() );
    var fullRectangle = new Shape.rect( 0, 0, lightImage.getWidth(), lightImage.getHeight() );

    // Add the drag region for translating the laser
    var start;
    var translationRegionPath = new Path( translationRegion( fullRectangle, frontRectangle ), { fill: dragRegionColor } );
    translationRegionPath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = laserNode.globalToParentPoint( event.pointer.point );
        showTranslationDragHandles.value = true;
      },
      drag: function( event ) {
        var endDrag = laserNode.globalToParentPoint( event.pointer.point );
        laser.translate( modelViewTransform.viewToModelDelta( endDrag.minus( start ) ) );
        var position = ConstraintBounds.constrainLocation( laser.emissionPoint,
          modelViewTransform.viewToModelBounds( dragBounds ) );
        laser.translate( position.minus( laser.emissionPoint ) );
        start = endDrag;
        showTranslationDragHandles.value = true;
      },
      end: function() {
        showTranslationDragHandles.value = false;
      }
    } ) );
    translationRegionPath.addInputListener( {
      enter: function() {
        showTranslationDragHandles.value = showRotationDragHandles.value ? false : true;
      },
      exit: function() {
        showTranslationDragHandles.value = false;
      }
    } );
    this.addChild( translationRegionPath );

    // Add the drag region for rotating the laser
    var rotationRegionPath = new Path( rotationRegion( fullRectangle, backRectangle ), { fill: rotationRegionColor } );
    this.addChild( rotationRegionPath );
    rotationRegionPath.addInputListener( new SimpleDragHandler( {
      start: function() {
        showTranslationDragHandles.value = false;
        showRotationDragHandles.value = true;
      },
      drag: function( event ) {
        var coordinateFrame = laserNode.parents[ 0 ];
        var localLaserPosition = coordinateFrame.globalToLocalPoint( event.pointer.point );
        localLaserPosition = ConstraintBounds.constrainLocation( localLaserPosition, dragBounds );
        var modelPoint = modelViewTransform.viewToModelPosition( localLaserPosition );
        var angle = modelPoint.minus( laser.pivot ).angle();
        var after = clampDragAngle( angle );

        //Prevent laser from going to 90 degrees when in wave mode,
        // should go until laser bumps into edge.
        if ( laser.wave && after > BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE && laser.topLeftQuadrant ) {
          after = BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
        }
        laser.setAngle( after );
        showTranslationDragHandles.value = false;
        showRotationDragHandles.value = true;
      },
      end: function() {
        showRotationDragHandles.value = false;
      }
    } ) );
    rotationRegionPath.addInputListener( {
      enter: function() {
        showRotationDragHandles.value = true;
      },
      exit: function() {
        showRotationDragHandles.value = false;
      }
    } );


    laser.emissionPointProperty.link( function( newEmissionPoint ) {
      var emissionPoint = modelViewTransform.modelToViewPosition( newEmissionPoint );
      laserNode.setTranslation( emissionPoint.x, emissionPoint.y );
      laserNode.setRotation( -laser.getAngle() );
      laserNode.translate( 0, -lightImage.getHeight() / 2 );
    } );

    // add light emission on/off button
    var redButton = new RoundStickyToggleButton( false, true, laser.onProperty,
      {
        radius: 15,
        centerX: lightImage.centerX,
        centerY: lightImage.centerY,
        baseColor: 'red',
        stroke: 'red',
        fill: 'red',
        touchExpansion: 10
      } );
    this.addChild( redButton );
  }

  return inherit( Node, LaserNode );
} );

