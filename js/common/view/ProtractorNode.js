// Copyright 2015-2017, University of Colorado Boulder

/**
 * The protractor node is a circular device for measuring angles. In this sim it is used for measuring the angle of the
 * incident, reflected and refracted light.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  // images
  var protractorImage = require( 'mipmap!BENDING_LIGHT/protractor.png' );

  /**
   * @param {Property.<boolean>} showProtractorProperty - controls the protractor visibility
   * @param {boolean} rotateable - can be rotated
   * @param {Object} [options]
   * @constructor
   */
  function ProtractorNode( showProtractorProperty, rotateable, options ) {

    var self = this;
    Node.call( self );

    this.showProtractorProperty = showProtractorProperty; // @public (read-only)

    // @public (read-only)- the image node
    this.protractorImageNode = new Image( protractorImage, { pickable: false } );

    showProtractorProperty.linkAttribute( this, 'visible' );
    this.addChild( this.protractorImageNode );

    // Use nicknames for the protractor image width and height to make the layout code easier to understand
    var w = this.protractorImageNode.getWidth();
    var h = this.protractorImageNode.getHeight();

    /**
     * Creates the outer rim shape of the protractor, used for the outer rim shape as well as the full shape with
     * the interior middle bar.
     * @returns {Shape}
     */
    var createOuterRimShape = function() {
      return new Shape()
        .moveTo( w, h / 2 )
        .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, true )
        .lineTo( w * 0.2, h / 2 )
        .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, false )
        .lineTo( w, h / 2 )
        .ellipticalArc( w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, false )
        .lineTo( w * 0.2, h / 2 )
        .ellipticalArc( w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, true );
    };

    // shape for the outer ring of the protractor, must match the image.
    this.outerRimShape = createOuterRimShape();

    this.fullShape = createOuterRimShape()
      .rect( w * 0.2, h / 2, w * 0.6, h * 0.15 );

    this.mouseArea = this.fullShape;
    this.touchArea = this.fullShape;
    this.cursor = 'pointer';

    if ( rotateable ) {
      this.protractorAngleProperty = new Property( 0.0 );

      // add a mouse listener for rotating when the rotate shape (the outer ring in the 'prism' screen is dragged)
      var rotatePath = new Path( this.outerRimShape, {
        pickable: true,
        cursor: 'pointer'
      } );
      this.addChild( rotatePath );

      // rotate listener
      var start;
      rotatePath.addInputListener( new SimpleDragHandler( {
        start: function( event ) {
          start = self.globalToParentPoint( event.pointer.point );
        },
        drag: function( event ) {

          // compute the change in angle based on the new drag event
          var end = self.globalToParentPoint( event.pointer.point );
          var centerX = self.getCenterX();
          var centerY = self.getCenterY();
          var startAngle = Math.atan2( centerY - start.y, centerX - start.x );
          var angle = Math.atan2( centerY - end.y, centerX - end.x );

          // rotate the protractor model
          self.protractorAngleProperty.value += angle - startAngle;
          start = end;
        }
      } ) );

      // update the protractor angle
      self.protractorAngleProperty.link( function( angle ) {
        self.rotateAround( self.center, angle - self.getRotation() );
      } );
      this.barPath = new Path( new Shape().rect( w * 0.2, h / 2, w * 0.6, h * 0.15 ) );
      this.addChild( this.barPath );
    }
    this.mutate( options );
  }

  bendingLight.register( 'ProtractorNode', ProtractorNode );
  
  return inherit( Node, ProtractorNode, {

      // @public
      // Reset the rotation of the ProtractorNode
      reset: function() {
        this.protractorAngleProperty && this.protractorAngleProperty.reset();
      }
    }
  );
} );