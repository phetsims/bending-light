// Copyright 2002-2015, University of Colorado
/**
 * Graphically depicts a draggable prism.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Image = require( 'SCENERY/nodes/Image' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  // images
  var KnobImage = require( 'image!BENDING_LIGHT/knob.png' );

  /**
   *
   * @param modelViewTransform
   * @param prism
   * @param prismMedium -the medium associated with the prism
   * @constructor
   */
  function PrismNode( modelViewTransform, prism, prismMedium ) {

    this.prism = prism;
    Node.call( this );
    var prismsNode = this;

    var knobHeight = 15;
    //It looks like a box on the side of the prism
    var knobNode = new Image( KnobImage );
    if ( prism.shape.get().getReferencePoint() ) {
      prismsNode.addChild( knobNode );
    }

    var previousAngle;
    knobNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        previousAngle = prism.shape.get().getRotationCenter().minus(
          modelViewTransform.viewToModelPosition( knobNode.globalToParentPoint( event.pointer.point ) ) )
          .angle();
      },
      drag: function( event ) {
        var angle = prism.shape.get().getRotationCenter().minus(
          modelViewTransform.viewToModelPosition( knobNode.globalToParentPoint( event.pointer.point ) ) )
          .angle();
        prism.rotate( angle - previousAngle );
        previousAngle = angle;
      }
    } ) );

    var prismTranslationNode = new Path( modelViewTransform.modelToViewShape( prism.shape.get().toShape() ), {
      fill: prismMedium.get().color,
      stroke: prismMedium.get().color.darkerColor( 0.9 )
    } );
    this.addChild( prismTranslationNode );

    var start;
    prismTranslationNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = prismsNode.globalToParentPoint( event.pointer.point );
      },
      drag: function( event ) {
        var end = prismsNode.globalToParentPoint( event.pointer.point );
        prism.translate1( modelViewTransform.viewToModelDelta(
          end.minus( start ) ) );
        start = end;
      }
    } ) );

    prism.shape.link( function() {
      prismTranslationNode.setShape(
        modelViewTransform.modelToViewShape( prism.shape.value.toShape() ) );

      if ( prism.shape.get().getReferencePoint() ) {

        knobNode.resetTransform();
        knobNode.setScaleMagnitude( knobHeight / knobNode.height );
        var angle = modelViewTransform.modelToViewPosition( prism.shape.get().getRotationCenter() ).minus(
          modelViewTransform.modelToViewPosition( prism.shape.get().getReferencePoint() ) ).angle();
        var offsetX = -knobNode.getWidth() - 7;
        var offsetY = -knobNode.getHeight() / 2 - 8;
        knobNode.rotateAround( new Vector2( -offsetX, -offsetY ), angle );
        var knobPosition = modelViewTransform.modelToViewPosition( prism.shape.get().getReferencePoint() );
        knobNode.setTranslation( knobPosition.x, knobPosition.y );
        knobNode.translate( offsetX, offsetY );
      }
    } );
    prismMedium.link( function( prismMedium ) {
      var color = prismMedium.color;
      prismTranslationNode.fill = color;
      prismTranslationNode.stroke = color.darkerColor( 0.9 );
    } );
  }

  return inherit( Node, PrismNode, {} );
} );

