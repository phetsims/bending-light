/*
 // Copyright 2002-2011, University of Colorado
 */
/**
 * Prism toolbox which contains draggable prisms as well as the control panel for their index of refraction.
 *
 * @author Sam Reid
 *//*

 define( function( require ) {
 'use strict';

 // modules
 var inherit = require( 'PHET_CORE/inherit' );
 var Vector2 = require( 'java.awt.geom.Vector2' );
 var Rectangle = require( 'KITE/Rectangle' );
 var BendingLightStrings = require( 'edu.colorado.phet.bendinglight.BendingLightStrings' );
 var BendingLightCanvas = require( 'edu.colorado.phet.bendinglight.view.BendingLightCanvas' );
 var MediumControlPanel = require( 'edu.colorado.phet.bendinglight.view.MediumControlPanel' );
 var Property = require( 'AXON/Property' );
 var Function0 = require( 'edu.colorado.phet.common.phetcommon.util.function.Function0' );
 var ModelViewTransform = require( 'edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform' );
 var ToolNode = require( 'edu.colorado.phet.common.piccolophet.nodes.ToolNode' );
 var HBox = require( 'edu.colorado.phet.common.piccolophet.nodes.layout.HBox' );
 var NodeFactory = require( 'edu.colorado.phet.common.piccolophet.nodes.toolbox.NodeFactory' );
 var ToolIconNode = require( 'edu.colorado.phet.common.piccolophet.nodes.toolbox.ToolIconNode' );
 var Node = require( 'SCENERY/nodes/Node' );
 var PText = require( 'edu.umd.cs.piccolo.nodes.PText' );
 var PDimension = require( 'edu.umd.cs.piccolo.util.PDimension' );
 var getPrismPrototypes = require( 'edu.colorado.phet.bendinglight.modules.prisms.PrismBreakModel.getPrismPrototypes' );//static


 // static class: PrismIcon
 var PrismIcon =
 define( function( require ) {
 function PrismIcon( prism, model, transform, canvas, globalToolboxBounds ) {

 //private
 this.model;
 ToolIconNode.call( this, toThumbnail( prism, model, transform ), new Property( false ).withAnonymousClassBody( {
 set: function( value ) {
 super.set( false );
 }
 } ), transform, canvas, new NodeFactory().withAnonymousClassBody( {
 createNode: function( transform, visible, location ) {
 return new PrismToolNode( transform, prism.copy(), model, location );
 }
 } ), model, globalToolboxBounds, true );
 this.model = model;
 }

 return inherit( ToolIconNode, PrismIcon, {
 addChild: function( canvas, node ) {
 canvas.addChildBehindLight( node );
 //Add the prism model element
 model.addPrism( (node).prism );
 },
 removeChild: function( canvas, node ) {
 canvas.removeChildBehindLight( node );
 //Remove the associated prism from the model when dropped back in the toolbox, resolves #2833
 model.removePrism( (node).prism );
 },

 //private
 toThumbnail: function( prism, model, transform ) {
 var prismNode = new PrismNode( transform, prism, model.prismMedium );
 var thumbnailHeight = 70;
 return prismNode.toImage( (prismNode.getFullBounds().getWidth() * thumbnailHeight / prismNode.getFullBounds().getHeight()), thumbnailHeight, null );
 }
 } );
 } );
 ;
 // static class: PrismToolNode
 var PrismToolNode =
 define( function( require ) {
 function PrismToolNode( transform, prism, model, modelPoint ) {

 //private
 this.transform;

 //private
 this.prism;
 this.transform = transform;
 this.prism = prism;
 //Create a new prism model, and add it to the model
 var bounds = prism.getBounds();
 var copyCenter = new Vector2( bounds.getX(), bounds.getY() );
 prism.translate( modelPoint.getX() - copyCenter.getX() - bounds.getWidth() / 2, modelPoint.getY() - copyCenter.getY() - bounds.getHeight() / 2 );
 addChild( new PrismNode( transform, prism, model.prismMedium ) );
 }

 return inherit( ToolNode, PrismToolNode, {
 dragAll: function( viewDelta ) {
 prism.translate( transform.viewToModelDelta( viewDelta ) );
 }
 } );
 } );
 ;
 function PrismToolboxNode( canvas, transform, model ) {
 //Create and add Title label for the prism toolbox
 var titleLabel = new PText( BendingLightStrings.PRISMS ).withAnonymousClassBody( {
 initializer: function() {
 setFont( BendingLightCanvas.labelFont );
 }
 } );
 addChild( titleLabel );
 var content = new HBox();
 //Move it down so it doesn't overlap the title label
 content.setOffset( 0, 5 );
 addChild( content );
 //Iterate over the prism prototypes in the model and create a draggable icon for each one
 for ( var prism in getPrismPrototypes() ) {
 content.addChild( new PrismIcon( prism, model, transform, canvas, new Function0().withAnonymousClassBody( {
 apply: function() {
 return getGlobalFullBounds();
 }
 } ) ) );
 }
 //Allow the user to control the type of material in the prisms
 content.addChild( new MediumControlPanel( canvas, model.prismMedium, BendingLightStrings.OBJECTS, false, model.wavelengthProperty, "0.0000000", 8 ) );
 }

 return inherit( Node, PrismToolboxNode, {} );
 } );

 */
