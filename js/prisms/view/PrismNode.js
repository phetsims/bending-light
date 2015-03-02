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
    //Depict drag handles on the PrismNode that allow it to be rotated

    //It looks like a box on the side of the prism
    var knobNode = new Image( KnobImage );
    this.addChild( knobNode );
    knobNode.addInputListener( new SimpleDragHandler( {
      drag: function() {
        //Compute the angle in view coordinates (otherwise inverted y in model gives wrong angle)
        var point1 = modelViewTransform.modelToViewPosition( prism.shape.get().getReferencePoint() );
        var point2 = modelViewTransform.modelToViewPosition( prism.shape.get().getRotationCenter() );
        var angle = new Vector2( point2.x - point1.x, point2.y - point1.y ).angle();

        //Move the knob so its attachment point (at the right middle of the image)
        // attaches to the corner of the prism (its reference point)
        var offset = new Vector2( -prismsNode.getWidth() + 5, -prismsNode.getHeight() / 2 );
        knobNode.setTranslation( offset.x, offset.y );

        //Rotate so the knob is pointing away from the centroid of the prism
        prismsNode.rotateAround( offset, angle );
      }
    } ) );

    var prismTranslationNode = new Path( modelViewTransform.modelToViewShape( prism.shape.get().toShape() ), {
      fill: prismMedium.get().color,
      stroke: prismMedium.get().color.darkerColor( 0.9 )
    } );
    var start;
    this.addChild( prismTranslationNode );
    prismTranslationNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = prismsNode.globalToParentPoint( event.pointer.point );
      },
      drag: function( event ) {
        var end = prismsNode.globalToParentPoint( event.pointer.point );
        prism.translate1( modelViewTransform.viewToModelDelta(
          end.minus( start ) ) );
        start = end;
      },
      end: function() {

      }
    } ) );
    prismMedium.link( function() {
      prismTranslationNode.fill = prismMedium.get().color;
      prismTranslationNode.stroke = prismMedium.get().color.darkerColor( 0.9 );
    } );
    prism.shape.link( function() {
      prismTranslationNode.setShape(
        modelViewTransform.modelToViewShape( prism.shape.value.toShape() ) );
         } );


  }

  return inherit( Node, PrismNode, {} );
} );

