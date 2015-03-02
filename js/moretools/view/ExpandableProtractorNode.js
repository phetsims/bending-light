/*
// Copyright 2002-2011, University of Colorado
*/
/**
 * In the "more tools" tab, the protractor can be expanded with a "+" button and returned to the original size with a "-" button.
 *
 * @author Sam Reid
 *//*

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'java.awt.Shape' );
  var BufferedImage = require( 'java.awt.image.BufferedImage' );
  var ProtractorModel = require( 'edu.colorado.phet.bendinglight.model.ProtractorModel' );
  var ProtractorNode = require( 'edu.colorado.phet.bendinglight.view.ProtractorNode' );
  var Not = require( 'edu.colorado.phet.common.phetcommon.model.property.Not' );
  var Property = require( 'AXON/Property' );
  var Property = require( 'AXON/Property' );
  var Function2 = require( 'edu.colorado.phet.common.phetcommon.util.function.Function2' );
  var VoidFunction1 = require( 'edu.colorado.phet.common.phetcommon.util.function.VoidFunction1' );
  var ModelViewTransform = require( 'edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform' );
  var CursorHandler = require( 'edu.colorado.phet.common.piccolophet.event.CursorHandler' );
  var PBasicInputEventHandler = require( 'edu.umd.cs.piccolo.event.PBasicInputEventHandler' );
  var PInputEvent = require( 'edu.umd.cs.piccolo.event.PInputEvent' );
  var PImage = require( 'edu.umd.cs.piccolo.nodes.PImage' );
  var getMaximizeButtonImage = require( 'edu.colorado.phet.common.phetcommon.resources.PhetCommonResources.getMaximizeButtonImage' );//static
  var getMinimizeButtonImage = require( 'edu.colorado.phet.common.phetcommon.resources.PhetCommonResources.getMinimizeButtonImage' );//static

  function ExpandableProtractorNode( transform, showProtractor, protractorModel, translateShape, rotateShape, scale ) {
    //The scale when the protractor node is not expanded

    //private
    this.originalScale;
    //True if the protractor has been made larger

    //private
    this.expanded = new Property( false );

    // non-static inner class: MaxMinButton
    var MaxMinButton =
      //Button that allows the user to expand the protractor node in the more tools tab
      define( function( require ) {
        function MaxMinButton( image, expanded, expand ) {
          PImage.call( this, image );
          setScale( 2 );
          //Put the +/- to the right side of the protractor? For some reason NP thinks that would feel more natural.
          setOffset( innerBarShape.getX() + innerBarShape.getWidth() * 0.75 - getFullBounds().getWidth() / 2, innerBarShape.getCenterY() - getFullBounds().getHeight() / 2 );
          //Add interaction, so that it expands or shrinks when the button is pressed
          addInputEventListener( new CursorHandler() );
          addInputEventListener( new PBasicInputEventHandler().withAnonymousClassBody( {
            mousePressed: function( event ) {
              setExpanded( expand );
            }
          } ) );
          //Only show the + button when small, and vice versa
          expanded.addObserver( new VoidFunction1().withAnonymousClassBody( {
            apply: function( expanded ) {
              setVisible( expanded );
            }
          } ) );
        }

        return inherit( PImage, MaxMinButton, {} );
      } );
    ProtractorNode.call( this, transform, showProtractor, protractorModel, translateShape, rotateShape, scale, 1 );
    this.originalScale = scale;
    //Add buttons for growing and shrinking the protractor
    addChild( new MaxMinButton( getMaximizeButtonImage(), new Not( expanded ), true ) );
    addChild( new MaxMinButton( getMinimizeButtonImage(), expanded, false ) );
  }

  return inherit( ProtractorNode, ExpandableProtractorNode, {
//Set whether the protractor should be shown as large (expanded) or regular

    //private
    setExpanded: function( expanded ) {
      this.expanded.set( expanded );
      setProtractorScale( originalScale * (//make sure the protractor circle fits within the play area when it is centered
        expanded ? //make sure the protractor circle fits within the play area when it is centered
        2.3 : 1) );
      updateTransform();
    },
  } );
} );

*/
