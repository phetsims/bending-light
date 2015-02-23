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
      drag: function( ) {
        //Compute the angle in view coordinates (otherwise inverted y in model gives wrong angle)
        var angle = new Vector2( modelViewTransform.modelToViewPosition( prism.shape.get().getReferencePoint().get().toPoint2D() ),
          modelViewTransform.modelToViewPosition( prism.shape.get().getRotationCenter().toPoint2D() ) ).getAngle();

        //Move the knob so its attachment point (at the right middle of the image) attaches to the corner of the prism (its reference point)
        var offset = new Vector2( -this.getWidth() + 5,//let the knob protrude into the prism a bit so you don't see the edge of the knob image
          -this.getHeight() / 2 );
        prismsNode.setTranslation( offset.x, offset.y );

        //Rotate so the knob is pointing away from the centroid of the prism
        prismsNode.rotateAround( angle, -offset.x, -offset.y );
      }
    } ) );
    var prismTranslationNode = new Path( modelViewTransform.modelToViewShape( prism.shape.get().toShape() ), { fill: 'blue' } );
    this.addChild( prismTranslationNode );
    prismTranslationNode.addInputListener( new SimpleDragHandler( {
      drag: function() {

      }
    } ) );


  }

  return inherit( Node, PrismNode, {} );
} );

