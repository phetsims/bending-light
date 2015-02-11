// Copyright 2002-2012, University of Colorado
/**
 * Piccolo node for drawing the laser itself, including an on/off button and ability to rotate/translate.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Vector2 = require( 'DOT/Vector2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Path = require( 'SCENERY/nodes/Path' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Image = require( 'SCENERY/nodes/Image' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var RoundStickyToggleButton = require( 'SUN/Buttons/RoundStickyToggleButton' );


  // images
  var laserImage = require( 'image!BENDING_LIGHT/laser.png' );
  //var laserKnobImage = require( 'image!BENDING_LIGHT/laser_knob.png' );
  //var knobImage = require( 'image!BENDING_LIGHT/knob.png' );

  /*

   var Laser = require( 'edu.colorado.phet.bendinglight.model.Laser' );
   var And = require( 'edu.colorado.phet.common.phetcommon.model.property.And' );
   var Not = require( 'edu.colorado.phet.common.phetcommon.model.property.Not' );
   var Or = require( 'edu.colorado.phet.common.phetcommon.model.property.Or' );
   */


  /*  //A drag region is an invisible shape that can be dragged with the mouse for translation or rotation
   function DragRegion( shape, fill, eventHandler, isMouseOver, isDragging, //function that will be called when the laser gets dropped, e.g., to ensure it is in a good bounds
   dropped ) {
   Path.call( this, shape, fill );
   addInputEventListener( new CursorHandler() );
   addInputEventListener( new CanvasBoundedDragHandler( LaserNode.this ).withAnonymousClassBody( {
   //Pass the event through to the eventHandler
   dragNode: function( event ) {
   eventHandler.apply( event );
   },
   mouseEntered: function( event ) {
   //call the super since we extend BoundedDragHandler
   isMouseOver.set( true );
   },
   mouseExited: function( event ) {
   //call the super since we extend BoundedDragHandler
   isMouseOver.set( false );
   },
   mouseReleased: function( event ) {
   //call the super since we extend BoundedDragHandler
   isDragging.set( false );
   //Signify that the laser was dropped so it can be bounds tested.
   dropped.apply();
   },
   mousePressed: function( event ) {
   //call the super since we extend BoundedDragHandler
   isDragging.set( true );
   }
   } ) );
   }

   inherit( Path, DragRegion, {} );*/

  /**
   *
   * @param transform
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
  function LaserNode( transform, laser, showRotationDragHandles, showTranslationDragHandles, clampDragAngle, //Select from the entire region and front region which should be used for translating the laser.  Signature is (full region, front region)=>selection region
                      translationRegion, //Select from the entire region and back region which should be used for rotating the laser.  Signature is (full region,back region)=> selected region
                      rotationRegion, imageName, modelBounds ) {
    this.debug = false;
    Node.call( this );
    var laserNode = this;
    //Load the image
    // var image = flipY( flipX( BendingLightApplication.RESOURCES.getImage( imageName ) ) );
    //Properties to help identify where the mouse is so that arrows can be show indicating how the laser can be dragged
    var mouseOverRotationPart = new BooleanProperty( false );
    var mouseOverTranslationPart = new BooleanProperty( false );
    var draggingRotation = new BooleanProperty( false );
    var draggingTranslation = new BooleanProperty( false );
    /*//Continue to show the rotation arrows even if the mouse is outside of the region if the mouse is currently rotating the laser
     var showRotationArrows = mouseOverRotationPart.or( draggingRotation );
     showRotationArrows.addObserver( new SimpleObserver().withAnonymousClassBody( {
     update: function() {
     showRotationDragHandles.set( showRotationArrows.get() );
     }
     } ) );
     //Continue to show the translation arrows even if the mouse is outside of the region if the mouse is currently translating the laser
     var doShowTranslationArrows = mouseOverTranslationPart.or( draggingTranslation );
     var a = new And( doShowTranslationArrows, new Not( showRotationArrows ) );
     a.addObserver( new SimpleObserver().withAnonymousClassBody( {
     update: function() {
     showTranslationDragHandles.set( doShowTranslationArrows.get() );
     }
     } ) );*/
    //Show the laser image
    var lightImage = new Image( laserImage );
    this.addChild( lightImage );
    //for the rotatable laser, just use the part of the image that looks like a knob be used for rotation
    //  var fractionBackToRotateHandle = 34.0 / 177.0;
    // var frontRectangle = new Rectangle( 0, 0, image.getWidth() * (1 - fractionBackToRotateHandle), image.getHeight() );
    // var backRectangle = new Rectangle( image.getWidth() * (1 - fractionBackToRotateHandle), 0, image.getWidth() * fractionBackToRotateHandle, image.getHeight() );
    // var fullRectangle = new Rectangle( 0, 0, image.getWidth(), image.getHeight() );

    //Set up the colors to be invisible (or red and blue for debugging)
    /* var dragRegionColor;
     var rotationRegionColor;
     if ( this.debug ) {
     dragRegionColor = new Color( 255, 0, 0, 128 );
     rotationRegionColor = new Color( 0, 0, 255, 128 );
     }
     else {
     dragRegionColor = new Color( 255, 0, 0, 0 );
     rotationRegionColor = new Color( 0, 0, 255, 0 );
     }*/
    //todo:Add the drag region for translating the laser
    /* this.addChild( new DragRegion( translationRegion.apply( fullRectangle, frontRectangle ), dragRegionColor, new VoidFunction1().withAnonymousClassBody( {
     apply: function( event ) {
     laser.translate( transform.viewToModelDelta( event.delta ) );
     }
     } ), mouseOverTranslationPart, draggingTranslation, new VoidFunction0.Null() ) );*/
    //todo:Add the drag region for rotating the laser
    /*    this.addChild( new DragRegion( rotationRegion.apply( fullRectangle, backRectangle ), rotationRegionColor, new VoidFunction1().withAnonymousClassBody( {
     apply: function( event ) {
     var modelPoint = new Vector2( transform.viewToModel( event.event.getPositionRelativeTo( getParent().getParent() ) ) );
     var vector = modelPoint.minus( laser.pivot.get() );
     var angle = vector.getAngle();
     var after = clampDragAngle.apply( angle );
     laser.setAngle( after );
     }
     } ), mouseOverRotationPart, draggingRotation, new VoidFunction0().withAnonymousClassBody( {
     apply: function() {
     //If the laser's emission point got dropped outside the visible play area, then move it back to its initial location
     if ( !modelBounds.contains( laser.emissionPoint.get() ) ) {
     laser.resetLocation();
     }
     }
     } ) ) );*/
    //todo:Update the transform of the laser when its model data (pivot or emission point) changes
    /*  new RichSimpleObserver().withAnonymousClassBody( {
     update: function() {
     var emissionPoint = transform.modelToView( laser.emissionPoint.get() ).toPoint2D();
     var angle = transform.modelToView( Vector2.createPolar( 1, laser.getAngle() ) ).getAngle();
     var t = new AffineTransform();
     t.translate( emissionPoint.getX(), emissionPoint.getY() );
     t.rotate( angle );
     t.translate( 0, -image.getHeight() / 2 );
     LaserNode.this.setTransform( t );
     }
     } ).observe( laser.pivot, laser.emissionPoint );*/

    laser.emissionPointProperty.link( function( emissionPoint1 ) {
      var emissionPoint = transform.modelToViewPosition( laser.emissionPoint );
      var angle = transform.modelToViewPosition( Vector2.createPolar( 1, laser.getAngle() ) ).angle();
      laserNode.setRotation( angle );
      laserNode.setTranslation(  emissionPoint.x,emissionPoint.y);
      } );
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
    this.addInputListener( new SimpleDragHandler( {
      start: function( event ) {

      }, drag: function( event ) {
        var laserPoint = laserNode.globalToParentPoint( event.pointer.point );
        laserNode.setTranslation( laserPoint.x, laserPoint.y );
        laser.emissionPoint.set( transform.viewToModelPosition( laserPoint ) );
      }
    } ) );
    laserNode.setTranslation( 100, 100 );
  }

  return inherit( Node, LaserNode, {} );
} );

