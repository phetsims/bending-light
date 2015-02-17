// Copyright 2002-2015, University of Colorado
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
  var Vector2 = require( 'DOT/Vector2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  // var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Image = require( 'SCENERY/nodes/Image' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var RoundStickyToggleButton = require( 'SUN/Buttons/RoundStickyToggleButton' );
  var Shape = require( 'KITE/Shape' );
  var Property = require( 'AXON/Property' );


  // images
  var laserImage = require( 'image!BENDING_LIGHT/laser.png' );
  //var laserKnobImage = require( 'image!BENDING_LIGHT/laser_knob.png' );
  //var knobImage = require( 'image!BENDING_LIGHT/knob.png' );

  var dragRegionColor = new Color( 255, 0, 0, 0 );
  var rotationRegionColor = new Color( 0, 0, 255, 0 );

  /**
   *
   * @param modelViewTransform
   * @param laser
   * @param showRotationDragHandles
   * @param showTranslationDragHandles
   * @param clampDragAngle
   * @param translationRegion
   * @param rotationRegion
   * @param imageName
   * @param modelBounds
   * @constructor
   */
  function LaserNode( modelViewTransform, laser, showRotationDragHandles, showTranslationDragHandles,
                      clampDragAngle, translationRegion, rotationRegion, imageName, modelBounds ) {

    Node.call( this );
    var laserNode = this;

    //Properties to help identify where the mouse is so that arrows can be show
    // indicating how the laser can be dragged
    var draggingRotation = new Property( false );
    var draggingTranslation = new Property( false );

    draggingRotation.link( function( showRotationArrows ) {
      showRotationDragHandles.value = showRotationArrows;
    } );
    draggingTranslation.link( function( showTranslationArrows ) {
      showTranslationDragHandles.value = showTranslationArrows;
    } );

    //add laser image
    var lightImage = new Image( laserImage );
    this.addChild( lightImage );

    //Drag handlers can choose which of these regions to use for drag events
    var fractionBackToRotateHandle = 34.0 / 177.0;
    var frontRectangle = new Shape.rect( 0, 0,
      lightImage.getWidth() * (1 - fractionBackToRotateHandle), lightImage.getHeight() );
    var backRectangle = new Shape.rect( lightImage.getWidth() * (1 - fractionBackToRotateHandle),
      0,
      lightImage.getWidth() * fractionBackToRotateHandle, lightImage.getHeight() );
    var fullRectangle = new Shape.rect( 0, 0, lightImage.getWidth(), lightImage.getHeight() );

    // Add the drag region for translating the laser
    var translationRegionPath = new Path( translationRegion( fullRectangle, frontRectangle ), { fill: dragRegionColor } );
    translationRegionPath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {

      },
      drag: function( event ) {
        laser.translate( modelViewTransform.viewToModelDelta( event.pointer.point ) );
      },
      end: function( event ) {}
    } ) );
    translationRegionPath.addInputListener( {
      enter: function() {
      },
      exit: function() {
      }
    } );


    // Add the drag region for rotating the laser
    var rotationRegionPath = new Path( rotationRegion( fullRectangle, backRectangle ), { fill: rotationRegionColor } );
    this.addChild( rotationRegionPath );
    rotationRegionPath.addInputListener( new SimpleDragHandler( {
      start: function() {
        draggingRotation.value = true;
      },
      drag: function( event ) {
        var coordinateFrame = laserNode.parents[ 0 ];
        var localLaserPosition = coordinateFrame.globalToLocalPoint( event.pointer.point );
        var modelPoint = modelViewTransform.viewToModelPosition( localLaserPosition );
        var vector = modelPoint.minus( laser.pivot );
        var angle = vector.angle();
        var after = clampDragAngle( angle );
        laser.setAngle( after );
        draggingRotation.value = true;
      },
      end: function() {
        draggingRotation.value = false;
      }
    } ) );
    rotationRegionPath.addInputListener( {
      enter: function() {
        draggingRotation.value = true;
      },
      exit: function() {
        draggingRotation.value = false;
      }
    } );

    //Update the transform of the laser when its model data (pivot or emission point)
    // changes

    laser.emissionPointProperty.link( function( newEmissionPoint ) {
      var emissionPoint = modelViewTransform.modelToViewPosition( newEmissionPoint );
      var angle = modelViewTransform.modelToViewPosition( Vector2.createPolar( 1, laser.getAngle() ) ).angle();
      laserNode.setTranslation( emissionPoint.x, emissionPoint.y );
      laserNode.setRotation( angle );
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

