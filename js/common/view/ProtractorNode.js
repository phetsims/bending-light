// Copyright 2002-2015, University of Colorado Boulder

/**
 * The protractor node is a circular device for measuring angles.
 * In this sim it is used for measuring the angle of the incident,
 * reflected and refracted light.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
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
  var Vector2 = require( 'DOT/Vector2' );
  var TweenUtil = require( 'BENDING_LIGHT/common/view/TweenUtil' );
  var ToolListener = require( 'SCENERY_PHET/input/ToolListener' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // images
  var protractorImage = require( 'mipmap!BENDING_LIGHT/protractor.png' );

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view values
   * @param {Property.<boolean>} showProtractorProperty - controls the protractor visibility
   * @param {ProtractorModel} protractorModel - model of protractor
   * @param {function} translateShape - function that returns the part of the protractor that can be used for translating it
   * @param {function} rotateShape - function that returns the part of the protractor that can be used for rotating it
   * @constructor
   */
  function ProtractorNode( modelViewTransform, showProtractorProperty, protractorModel, translateShape, rotateShape ) {

    var protractorNode = this;
    Node.call( protractorNode );

    this.modelViewTransform = modelViewTransform; // @public
    this.protractorModel = protractorModel; // @public
    this.showProtractorProperty = showProtractorProperty; // @public

    // load and add the image
    this.protractorImageNode = new Image( protractorImage ); // @public

    showProtractorProperty.linkAttribute( this, 'visible' );
    this.addChild( this.protractorImageNode );

    // Use nicknames for the protractor image width and height to make the layout code easier to understand
    var w = this.protractorImageNode.getWidth();
    var h = this.protractorImageNode.getHeight();

    // shape for the outer ring of the protractor
    this.outerRimShape = new Shape()
      .moveTo( w, h / 2 )
      .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, true )
      .lineTo( w * 0.2, h / 2 )
      .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, false )
      .lineTo( w, h / 2 )
      .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, false )
      .lineTo( w * 0.2, h / 2 )
      .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, true );

    this.fullShape = new Shape()
      .moveTo( w, h / 2 )
      .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, true )
      .lineTo( w * 0.2, h / 2 )
      .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, false )
      .lineTo( w, h / 2 )
      .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, false )
      .lineTo( w * 0.2, h / 2 )
      .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, true )
      .rect( w * 0.2, h / 2, w * 0.6, h * 0.15 );

    this.innerBarShape = new Shape().rect( w * 0.2, h / 2, w * 0.6, h * 0.15 );

    // Add a mouse listener for dragging when the drag region
    // (entire body in all tabs, just the inner bar on prism screen) is dragged
    //var translatePath = new Path( innerBarShape, {
    //  fill: 'green'
    //} );
    //this.addChild( translatePath );
    //this.touchArea = this.innerBarShape;
    //this.cursor = 'pointer';
    //this.mouseArea = this.innerBarShape;

    // This seems to work
    this.protractorImageNode.mouseArea = this.innerBarShape;
    this.protractorImageNode.cursor = 'pointer';

    // add a mouse listener for rotating when the rotate shape (the outer ring in the 'prism' screen is dragged)
    //var rotatePath = new Path( rotateShape( fullShape, innerBarShape, outerRimShape ), {
    //  pickable: true,
    //  cursor: 'pointer'
    //} );
    //this.addChild( rotatePath );

    // rotate listener
    //rotatePath.addInputListener( new SimpleDragHandler( {
    //  start: function( event ) {
    //    start = protractorNode.globalToParentPoint( event.pointer.point );
    //  },
    //  drag: function( event ) {
    //
    //    // compute the change in angle based on the new drag event
    //    var end = protractorNode.globalToParentPoint( event.pointer.point );
    //    var centerX = protractorNode.getCenterX();
    //    var centerY = protractorNode.getCenterY();
    //    var startAngle = Math.atan2( centerY - start.y, centerX - start.x );
    //    var angle = Math.atan2( centerY - end.y, centerX - end.x );
    //
    //    // rotate the protractor model
    //    protractorModel.angle += angle - startAngle;
    //    start = end;
    //  }
    //} ) );

    // update the protractor angle
    protractorModel.angleProperty.link( function( angle ) {
      protractorNode.rotateAround( protractorNode.center, angle - protractorNode.getRotation() );
    } );
  }

  return inherit( Node, ProtractorNode );
} );