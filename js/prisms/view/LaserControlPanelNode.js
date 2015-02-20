/*
 // Copyright 2002-2011, University of Colorado
 */
/**
 * Control panel for the laser in the "prism break" tab, such as choosing whether it is white light or one color, and the wavelength.
 *
 * @author Sam Reid
 *//*

 define( function( require ) {
 'use strict';

 // modules
 var inherit = require( 'PHET_CORE/inherit' );
 var ActionEvent = require('java.awt.event.ActionEvent');
 var ActionListener = require('java.awt.event.ActionListener');
 var swing = require('javax.swing');//.*
 var BendingLightStrings = require('edu.colorado.phet.bendinglight.BendingLightStrings');
 var BendingLightWavelengthControl = require('edu.colorado.phet.bendinglight.view.BendingLightWavelengthControl');
 var LaserColor = require('edu.colorado.phet.bendinglight.view.LaserColor');
 var ProtractorNode = require('edu.colorado.phet.bendinglight.view.ProtractorNode');
 var Property = require('AXON/Property');
 var SettableProperty = require('edu.colorado.phet.common.phetcommon.model.property.SettableProperty');
 var SimpleObserver = require('edu.colorado.phet.common.phetcommon.util.SimpleObserver');
 var HorizontalLayoutPanel = require('edu.colorado.phet.common.phetcommon.view.HorizontalLayoutPanel');
 var VerticalLayoutPanel = require('edu.colorado.phet.common.phetcommon.view.VerticalLayoutPanel');
 var PropertyCheckBox = require('edu.colorado.phet.common.phetcommon.view.controls.PropertyCheckBox');
 var PropertyRadioButton = require('edu.colorado.phet.common.phetcommon.view.controls.PropertyRadioButton');
 var PhetPCanvas = require('edu.colorado.phet.common.piccolophet.PhetPCanvas');
 var ControlPanelNode = require('edu.colorado.phet.common.piccolophet.nodes.ControlPanelNode');
 var ZeroOffsetNode = require('edu.colorado.phet.common.piccolophet.nodes.kit.ZeroOffsetNode');
 var PBounds = require('edu.umd.cs.piccolo.util.PBounds');
 var PSwing = require('edu.umd.cs.piccolox.pswing.PSwing');
 var BendingLightStrings = require('edu.colorado.phet.bendinglight.BendingLightStrings');//static //.*
 var labelFont = require('edu.colorado.phet.bendinglight.view.BendingLightCanvas.labelFont');//static
 var WHITE_LIGHT = require('edu.colorado.phet.bendinglight.view.LaserColor.WHITE_LIGHT');//static


 // static class: MyRadioButton
 var MyRadioButton =
 //Class for creating radio buttons with the right font

 //private
 define( function( require ) {
 function MyRadioButton( text,  property,  value) {
 PropertyRadioButton.call(this, text, property, value);
 setFont(labelFont);
 }

 return inherit(PropertyRadioButton,MyRadioButton,{
 });
 } );;
 function LaserControlPanelNode( multipleRays,  laserColor,  showReflections,  showNormal,  showProtractor,  wavelengthProperty) {
 ControlPanelNode.call(this, new PSwing(new VerticalLayoutPanel().withAnonymousClassBody( {
 initializer:function(){
 //Add a radio button for "one color"
 add(new JRadioButton(ONE_COLOR, laserColor.get() != WHITE_LIGHT).withAnonymousClassBody( {
 initializer:function(){
 setFont(labelFont);
 var updateSelected = new SimpleObserver().withAnonymousClassBody( {
 update: function() {
 setSelected(laserColor.get() != WHITE_LIGHT);
 }
 });
 addActionListener(new ActionListener().withAnonymousClassBody( {
 actionPerformed: function( e) {
 laserColor.set(new LaserColor.OneColor(wavelengthProperty.get()));
 //make sure radio buttons don't toggle off, in case they're not in a button group
 updateSelected.update();
 }
 }));
 laserColor.addObserver(updateSelected);
 }
 }));
 //Add the wavelength control for choosing the wavelength in "one color" mode
 add(new PhetPCanvas().withAnonymousClassBody( {
 initializer:function(){
 var wavelengthControl = new BendingLightWavelengthControl(wavelengthProperty, laserColor);
 setBorder(null);
 //Layout
 var bounds = wavelengthControl.getFullBounds();
 setPreferredSize(new Dimension((bounds.getWidth()), bounds.getHeight()));
 //Add the wavelength control
 getLayer().addChild(new ZeroOffsetNode(wavelengthControl));
 }
 }));
 //Add a radio button for "white light"
 add(new MyRadioButton(BendingLightStrings.WHITE_LIGHT, laserColor, WHITE_LIGHT));
 add(new JSeparator());
 //Choose between single and multiple rays
 add(new MyRadioButton(SINGLE_RAY, multipleRays, false));
 add(new MyRadioButton(MULTIPLE_RAYS, multipleRays, true));
 add(new JSeparator());
 //Checkboxes to toggle reflections, normal, protractor
 add(new PropertyCheckBox(BendingLightStrings.SHOW_REFLECTIONS, showReflections).withAnonymousClassBody( {
 initializer:function(){
 setFont(labelFont);
 }
 }));
 add(new PropertyCheckBox(BendingLightStrings.SHOW_NORMAL, showNormal).withAnonymousClassBody( {
 initializer:function(){
 setFont(labelFont);
 }
 }));
 add(new HorizontalLayoutPanel().withAnonymousClassBody( {
 initializer:function(){
 add(new PropertyCheckBox(BendingLightStrings.SHOW_PROTRACTOR, showProtractor).withAnonymousClassBody( {
 initializer:function(){
 setFont(labelFont);
 }
 }));
 add(new JLabel(new ImageIcon(ProtractorNode.newProtractorImage(40))));
 }
 }));
 }
 })));
 }

 return inherit(ControlPanelNode,LaserControlPanelNode,{
 });
 } );

 */
