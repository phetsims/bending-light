// Copyright 2015-2019, University of Colorado Boulder

/**
 * The protractor node is a circular device for measuring angles. In this sim it is used for measuring the angle of the
 * incident, reflected and refracted light.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Shape from '../../../../kite/js/Shape.js';
import inherit from '../../../../phet-core/js/inherit.js';
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import protractorImage from '../../../mipmaps/protractor_png.js';
import bendingLight from '../../bendingLight.js';

/**
 * @param {Property.<boolean>} showProtractorProperty - controls the protractor visibility
 * @param {boolean} rotateable - can be rotated
 * @param {Object} [options]
 * @constructor
 */
function ProtractorNode( showProtractorProperty, rotateable, options ) {

  const self = this;
  Node.call( self );

  this.showProtractorProperty = showProtractorProperty; // @public (read-only)

  // @public (read-only)- the image node
  this.protractorImageNode = new Image( protractorImage, { pickable: false } );

  showProtractorProperty.linkAttribute( this, 'visible' );
  this.addChild( this.protractorImageNode );

  // Use nicknames for the protractor image width and height to make the layout code easier to understand
  const w = this.protractorImageNode.getWidth();
  const h = this.protractorImageNode.getHeight();

  /**
   * Creates the outer rim shape of the protractor, used for the outer rim shape as well as the full shape with
   * the interior middle bar.
   * @returns {Shape}
   */
  const createOuterRimShape = function() {
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
    const rotatePath = new Path( this.outerRimShape, {
      pickable: true,
      cursor: 'pointer'
    } );
    this.addChild( rotatePath );

    // rotate listener
    let start;
    rotatePath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = self.globalToParentPoint( event.pointer.point );
      },
      drag: function( event ) {

        // compute the change in angle based on the new drag event
        const end = self.globalToParentPoint( event.pointer.point );
        const centerX = self.getCenterX();
        const centerY = self.getCenterY();
        const startAngle = Math.atan2( centerY - start.y, centerX - start.x );
        const angle = Math.atan2( centerY - end.y, centerX - end.x );

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

export default inherit( Node, ProtractorNode, {

    // @public
    // Reset the rotation of the ProtractorNode
    reset: function() {
      this.protractorAngleProperty && this.protractorAngleProperty.reset();
    }
  }
);