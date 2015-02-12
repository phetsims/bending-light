/*
// Copyright 2002-2012, University of Colorado
*/
/**
 * The protractor node is a circular device for measuring angles.
 * In this sim it is used for measuring the angle of the incident, reflected and refracted light.
 *
 * @author Sam Reid
 *//*

define( function( require ) {
    'use strict';

    // modules
    var inherit = require( 'PHET_CORE/inherit' );
    var Color = require( 'SCENERY/util/Color' );
    var Path = require( 'SCENERY/nodes/Path' );
    var Node = require( 'SCENERY/nodes/Node' );
    var Vector2 = require( 'DOT/Vector2' );
    var Image = require( 'SCENERY/nodes/Image' );
    var Shape = require( 'KITE/Shape' );
    var Rectangle = require( 'SCENERY/nodes/Rectangle' );
    var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
    var Property = require( 'AXON/Property' );

    //images
    var protractorImage = require( 'image!BENDING_LIGHT/protractor.png' );

    var DEFAULT_SCALE = 0.5;


    function ProtractorNode( modelViewTransform, showProtractor, protractorModel, scale ) {

      var protractorNode = this;
      Node.call( protractorNode, {
        cursor: 'pointer'
      } );

      this.debug = false;
      //Just using a global piccolo scale in the "prism break" tab leads to jagged and aliased graphics--in that case it is important to use the multiscaling algorithm

      this.modelViewTransform = modelViewTransform;
      this.protractorModel = protractorModel;
      this.scale = scale;

      //Load and add the image
      var imageNode = new Image( protractorImage, { scale: this.scale, pickable: true } );
      showProtractor.link( function( showProtractor ) {
          imageNode.setVisible( showProtractor );
        }
      );
      this.addChild( imageNode );
      //Shape for the outer ring of the protractor
      var outerShape = new Path( new Shape().circle( imageNode.getWidth() / 2, imageNode.getHeight() / 2, imageNode.getWidth() / 2 ) );
      var outerRimShape = new Path( new Shape()
        .moveTo( imageNode.getWidth(), imageNode.getHeight() / 2 )
        .ellipticalArc( imageNode.getWidth() / 2, imageNode.getHeight() / 2, imageNode.getWidth() / 2, imageNode.getHeight() / 2, 0, 0, Math.PI, true )
        .lineTo( imageNode.getWidth() * 0.2, imageNode.getHeight() / 2 )
        .ellipticalArc( imageNode.getWidth() / 2, imageNode.getHeight() / 2, imageNode.getWidth() * 0.3, imageNode.getHeight() * 0.3, 0, Math.PI, 0, false )
        .lineTo( imageNode.getWidth(), imageNode.getHeight() / 2 )
        .ellipticalArc( imageNode.getWidth() / 2, imageNode.getHeight() / 2, imageNode.getWidth() / 2, imageNode.getHeight() / 2, 0, 0, Math.PI, false )
        .lineTo( imageNode.getWidth() * 0.2, imageNode.getHeight() / 2 )
        .ellipticalArc( imageNode.getWidth() / 2, imageNode.getHeight() / 2, imageNode.getWidth() * 0.3, imageNode.getHeight() * 0.3, 0, Math.PI, 0, true )
        .close() );
      this.addChild( outerRimShape );
      //Okay if it overlaps the rotation region since rotation region is in higher z layer
      this.innerBarShape = new Shape().rect( 20, imageNode.getCenterY(), imageNode.getWidth() - 40, 90 );
      if ( this.debug ) {
        //For debugging the drag hit area
        this.addChild( new Path( this.innerBarShape, { fill: new Color( 0, 255, 0, 128 ) } ) );
      }

      //this.addChild( new Path( translateShape.apply( this.innerBarShape, outerRimShape ), this.debug ? Color.blue : new Color( 0, 0, 0, 0 ) ) );
      var start, end;
      this.addInputListener( new SimpleDragHandler( {
        start: function( event ) {
          start = protractorNode.globalToParentPoint( event.pointer.point );
        },
        drag: function( event ) {
          end = protractorNode.globalToParentPoint( event.pointer.point );
          var d = end.minus( start );
          protractorNode.dragAll( d );
          // protractorNode.setTranslation( end.x, end.y );
        }
      } ) );

      */
/*  this.addChild( new Path( rotateShape.apply( this.innerBarShape, outerRimShape ), this.debug ? Color.red : new Color( 0, 0, 0, 0 ) ) );
       rotateShape.addInputListener( new SimpleDragHandler( {
       start: function( event ) {
       start = event.getPositionRelativeTo( getParent() );
       },
       drag: function( event ) {
       //Compute the change in angle based on the new drag event
       end = event.getPositionRelativeTo( getParent() );
       var startAngle = new Vector2( rotateShape.getCenter(), start ).getAngle();
       var angle = new Vector2( rotateShape.getCenter(), end ).getAngle();
       var deltaAngle = angle - startAngle;
       //Rotate the protractor model
       protractorNode.protractorModel.angle.set( protractorNode.protractorModel.angle.get() + deltaAngle );
       }
       } ) );*//*

      // Property.multilink( [ this.protractorModel.positionProperty, this.protractorModel.angleProperty ], protractorNode.updateTransform() );

      this.protractorModel.angleProperty.link( function( angle ) {
        protractorNode.rotateAround( protractorNode.modelViewTransform.modelToViewDelta( protractorNode.protractorModel.position ), angle );
      } );

      this.protractorModel.positionProperty.link( function( position ) {
        protractorNode.setTranslation( protractorNode.modelViewTransform.modelToViewX( position.x ), protractorNode.modelViewTransform.modelToViewY( position.y ) );
      } );

    }

    return inherit( Node, ProtractorNode, {
        */
/**
         * Resize the protractor
         * @param scale
         *//*

        setProtractorScale: function( scale ) {
          this.scale = scale;
          this.updateTransform( this.scale );
        },
        //Update the transform (scale, offset, rotation) of this protractor to reflect the model values and the specified scale
        updateTransform: function( scale ) {
          //this.setTransform( new AffineTransform() );
          this.scale( scale );
          var point2D = this.modelViewTransform.modelToViewXY( this.protractorModel.position.value );
          this.setTranslation( point2D.x - this.protractor.getWidth() / 2 * this.scale, point2D.y - this.protractor.getHeight() / 2 * this.scale );
          this.rotateAround( new Vector2( this.protractor.getWidth() / 2, this.protractor.getHeight() / 2 ), this.protractorModel.angle.get() );
        },
        */
/**
         * Create a protractor image given at the specified height
         * @param height
         * @returns {*}
         *//*

        newProtractorImage: function( height ) {
          return Image( protractorImage, { scale: height / protractorImage.height } );
        },
        */
/**
         * Translate the protractor, this method is called when dragging out of the toolbox
         * @param delta
         *//*

        dragAll: function( delta ) {
          this.protractorModel.translate1( this.modelViewTransform.viewToModelX( delta.x ), this.modelViewTransform.viewToModelX( delta.y ) );
        },
        */
/**
         * Change the visibility and pickability of this ProtractorNode
         * @param isVisible
         *//*

        setVisible: function( isVisible ) {
          this.setVisible( isVisible );
          this.setPickable( isVisible );
        }
      },
      //statics
      {
        DEFAULT_SCALE: DEFAULT_SCALE
      } );
  }
)
;

*/
