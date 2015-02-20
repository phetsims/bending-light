// Copyright 2002-2012, University of Colorado
/**
 * Graphically depicts a draggable prism.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  //var Color = require( 'SCENERY/util/Color' );
  //var Vector2 = require( 'DOT/Vector2' );
  // var Property = require( 'AXON/Property' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   *
   * @param transform
   * @param prism
   * @param prismMedium -the medium associated with the prism
   * @constructor
   */
  function PrismNode( transform, prism, prismMedium ) {

    this.prism = prism;
    Node.call( this );
    //Depict drag handles on the PrismNode that allow it to be rotated
    /* define( function( require ) {
     function RotationDragHandle() {
     //It looks like a box on the side of the prism
     addChild( new PImage( BufferedImageUtils.multiScaleToHeight( RESOURCES.getImage( "knob.png" ), 18 ) ).withAnonymousClassBody( {
     initializer: function() {
     prism.shape.addObserver( new SimpleObserver().withAnonymousClassBody( {
     update: function() {
     //Clear the transform and reset it so the knob is at the reference point, pointing toward the center of the prism
     setTransform( new AffineTransform() );
     //Compute the angle in view coordinates (otherwise inverted y in model gives wrong angle)
     var angle = new Vector2( transform.modelToView( prism.shape.get().getReferencePoint().get().toPoint2D() ), transform.modelToView( prism.shape.get().getRotationCenter().toPoint2D() ) ).getAngle();
     //Move the knob so its attachment point (at the right middle of the image) attaches to the corner of the prism (its reference point)
     var offset = new Vector2( -getFullBounds().getWidth() + //let the knob protrude into the prism a bit so you don't see the edge of the knob image
     5, -getFullBounds().getHeight() / 2 );
     translate( offset.x, offset.y );
     //Rotate so the knob is pointing away from the centroid of the prism
     rotateAboutPoint( angle, -offset.x, -offset.y );
     }
     } ) );
     }
     } ) );
     prism.shape.addObserver( new SimpleObserver().withAnonymousClassBody( {
     update: function() {
     setOffset( transform.modelToView( prism.shape.get().getReferencePoint().get() ).toPoint2D() );
     }
     } ) );
     //Add interaction
     addInputEventListener( new CursorHandler() );
     addInputEventListener( new PBasicInputEventHandler().withAnonymousClassBody( {
     var previousAngle,
     //Store the original angle since rotations are computed as deltas between each event
     mousePressed: function( event ) {
     previousAngle = getAngle( event );
     },
     //Find the angle about the center of the prism

     //private
     getAngle: function( event ) {
     return new Vector2( prism.shape.get().getRotationCenter().toPoint2D(), transform.viewToModel( event.getPositionRelativeTo( getParent() ) ) ).getAngle();
     },
     //Drag the prism to rotate it
     mouseDragged: function( event ) {
     var angle = getAngle( event );
     prism.rotate( angle - previousAngle );
     previousAngle = angle;
     }
     } ) );
     }

     return inherit( Node, PrismNode, {} );
     } );
     //Circles are not rotatable since they are symmetric, so they do not provide a reference point
     if ( prism.shape.get().getReferencePoint().isSome() ) {
     // Show the rotation drag handle behind the prism shape so it looks like it attaches solidly instead of sticking out on top
     addChild( new RotationDragHandle() );
     }
     //Show the draggable prism shape
     addChild( new PhetPPath( new BasicStroke(), darkGray ).withAnonymousClassBody( {
     initializer: function() {
     prism.shape.addObserver( new SimpleObserver().withAnonymousClassBody( {
     update: function() {
     setPathTo( transform.modelToView( prism.shape.get().toShape() ) );
     }
     } ) );
     prismMedium.addObserver( new SimpleObserver().withAnonymousClassBody( {
     update: function() {
     //Set the fill color
     var color = prismMedium.get().color;
     setPaint( color );
     //Make the border color darker than the fill color
     var darker = new Function1().withAnonymousClassBody( {
     apply: function( value ) {
     return MathUtil.clamp( 0, value - 28, 255 );
     }
     } );
     setStrokePaint( new Color( darker.apply( color.getRed() ), darker.apply( color.getGreen() ), darker.apply( color.getBlue() ) ) );
     }
     } ) );
     //Make it draggable, but constrain it within the play area
     addInputEventListener( new CursorHandler() );
     addInputEventListener( new CanvasBoundedDragHandler( this ).withAnonymousClassBody( {
     dragNode: function( event ) {
     prism.translate( transform.viewToModelDelta( event.delta ) );
     }
     } ) );
     }
     } ) );*/
  }

  return inherit( Node, PrismNode, {} );
} );

