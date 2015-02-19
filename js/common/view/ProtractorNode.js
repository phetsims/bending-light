// Copyright 2002-2015, University of Colorado
/**
 * The protractor node is a circular device for measuring angles.
 * In this sim it is used for measuring the angle of the incident,
 * reflected and refracted light.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni(Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  //images
  var protractorImage = require( 'image!BENDING_LIGHT/protractor.png' );

  // constants
  var DEFAULT_SCALE = 0.5;

  /**
   *
   * @param modelViewTransform
   * @param showProtractor
   * @param protractorModel
   * @param translateShape
   * @param rotateShape
   * @param ICON_WIDTH
   * @param containerBounds
   * @constructor
   */
  function ProtractorNode( modelViewTransform, showProtractor, protractorModel, translateShape, rotateShape, ICON_WIDTH, containerBounds ) {

    var protractorNode = this;
    Node.call( protractorNode );

    this.modelViewTransform = modelViewTransform;
    this.protractorModel = protractorModel;
    var scale = ICON_WIDTH / protractorImage.width;
    this.multiScale = scale;

    //Load and add the image
    this.protractorImageNode = new Image( protractorImage, { pickable: true } );
    showProtractor.link( function( showProtractor ) {
      protractorNode.protractorImageNode.setVisible( showProtractor );
    } );
    this.addChild( this.protractorImageNode );


    var protractorImageWidth = this.protractorImageNode.getWidth();
    var protractorImageHeight = this.protractorImageNode.getHeight();

    //Shape for the outer ring of the protractor
    var outerRimShape = new Shape()
      .moveTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, true )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, false )
      .lineTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, false )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, true )
      .close();

    var fullShape = new Shape()
      .moveTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, true )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, false )
      .lineTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, false )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, true )
      .rect( protractorImageWidth * 0.2, protractorImageHeight / 2,
      protractorImageWidth * 0.6, protractorImageHeight * 0.15 )
      .close();
    //Okay if it overlaps the rotation region since rotation region is in higher z layer
    this.innerBarShape = new Shape().rect( protractorImageWidth * 0.2, protractorImageHeight / 2,
      protractorImageWidth * 0.6, protractorImageHeight * 0.15 );

    //Add a mouse listener for dragging when the drag region
    // (entire body in all tabs, just the inner bar on prism break tab) is dragged
    var translatePath = new Path( translateShape( fullShape, this.innerBarShape, outerRimShape ), {
      pickable: true
    } );
    this.addChild( translatePath );
    var start;
    translatePath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = protractorNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds.intersectsBounds( protractorNode.getBounds() ) ) {
          protractorNode.scale( 0.3 / scale );
          protractorNode.multiScale *= 0.3 / scale;
        }
      },
      drag: function( event ) {
        //Compute the change in angle based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );
        protractorNode.dragAll( end.minus( start ) );
        start = end;
      },
      end: function() {
        if ( containerBounds.intersectsBounds( protractorNode.getBounds() ) ) {
          protractorNode.scale( scale / 0.3 );
          protractorNode.multiScale *= scale / 0.3;
          protractorNode.protractorModel.positionProperty.reset();
        }
      }
    } ) );
    //Add a mouse listener for rotating when the rotate shape (the outer ring in the 'prism break' tab is dragged)
    var rotatePath = new Path( rotateShape( fullShape, this.innerBarShape, outerRimShape ), {
      pickable: true
    } );
    this.addChild( rotatePath );
    rotatePath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = protractorNode.globalToParentPoint( event.pointer.point );
      },
      drag: function( event ) {
        //Compute the change in angle based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );
        var startAngle = protractorNode.center.minus( start ).angle();
        var angle = protractorNode.center.minus( end ).angle();
        //Rotate the protractor model
        protractorModel.angle = angle - startAngle;
        start = end;
      }
    } ) );

    this.protractorModel.angleProperty.link( function( angle ) {
      protractorNode.rotateAround( protractorNode.center, angle );
    } );
    this.protractorModel.positionProperty.link( function( position ) {
      var point2D = protractorNode.modelViewTransform.modelToViewPosition( position );
      protractorNode.setTranslation( point2D.x - ((protractorImageWidth / 2) * protractorNode.multiScale),
        point2D.y - ((protractorImageHeight / 2) * protractorNode.multiScale) );
    } );
  }

  return inherit( Node, ProtractorNode, {
      /**
       * Resize the protractor
       * @param scale
       */
      setProtractorScale: function( scale ) {
        this.multiScale = scale;
        this.updateTransform( scale );
      },
      /**
       * Create a protractor image given at the specified height
       * @param height
       * @returns {*}
       */
      newProtractorImage: function( height ) {
        return new Image( protractorImage, { scale: height / protractorImage.height } );
      },
      /**
       * Translate the protractor, this method is called when dragging out of the toolbox
       * @param delta
       */
      dragAll: function( delta ) {
        this.protractorModel.translate( this.modelViewTransform.viewToModelDelta( delta ) );
      },
      /**
       * Change the visibility and pickability of this ProtractorNode
       * @param isVisible
       */
      setVisible: function( isVisible ) {
        this.setVisible( isVisible );
        this.setPickable( isVisible );
      }
    },
    //statics
    {
      DEFAULT_SCALE: DEFAULT_SCALE
    } );
} );
