// Copyright 2002-2011, University of Colorado
/**
 * Toolbox from which the user can drag (or otherwise enable) tools.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var NormalLine = require( 'BENDING_LIGHT/intro/view/NormalLine' );
  var IntensityMeterNode = require( 'BENDING_LIGHT/common/view/IntensityMeterNode' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  //  constants
  var ICON_WIDTH = 90;
  // var CHARACTERISTIC_LENGTH = BendingLightModel.WAVELENGTH_RED;

  /**
   *
   * @param canvas
   * @param modelViewTransform
   * @param protractorTool
   * @param moreTools
   * @param intensityMeter
   * @param showNormal
   * @param options
   * @constructor
   */
  function ToolboxNode( canvas, modelViewTransform, protractorTool, moreTools, intensityMeter, showNormal, options ) {

    Node.call( this );

    var sensorPanel = new Rectangle( 0, 0, 120, 235, 10, 10, {
      stroke: 'gray', lineWidth: 1, fill: '#C6CACE'
    } );
    this.addChild( sensorPanel );

    //Initial tools
    this.addChild( protractorTool );
    protractorTool.setTranslation( 15, 5 );
    //intensity sensor
    // var modelWidth = CHARACTERISTIC_LENGTH * 62;
    //var modelHeight = modelWidth * 0.7;

    var intensityMeterNode = new IntensityMeterNode( modelViewTransform, intensityMeter, sensorPanel.visibleBounds );
    intensityMeter.enabled = true;
    intensityMeterNode.setTranslation( -140, 10 );
    this.addChild( intensityMeterNode );

    var checkBoxOptions = {
      boxWidth: 20,
      spacing: 5
    };

    var normalText = new Text( 'Normal' );
    var normalCheckBox = new CheckBox( normalText, showNormal, checkBoxOptions );
    normalCheckBox.setTranslation( 15, 180 );
    this.addChild( normalCheckBox );

    var normalIcon = new NormalLine( 50 );
    normalIcon.setTranslation( 60, 180 );
    this.addChild( normalIcon );


    /*    var intensityMeter = new IntensityMeter( modelWidth * 0.3, -modelHeight * 0.3, modelWidth * 0.4, -modelHeight * 0.3, {
     enabled: true
     } );*/

    // var normalIcon = new NormalLine( modelViewTransform, modelHeight, 9 );
    /*
     //Initial tools
     this.addChild( protractorTool );
     for ( var moreTool in moreTools ) {
     this.addChild( moreTool );
     }


     var sensorIconHeight = (iconNode.getHeight() / iconNode.getWidth() * ICON_WIDTH);
     this.addChild( new IntensitySensorTool( canvas, transform, intensityMeter, modelWidth, modelHeight, this, iconNode, sensorIconHeight ) );
     normal line checkbox and icon
     this.addChild(  );
     this.addChild( new PSwing( new CheckBox( ShowNormalString, showNormal ).withAnonymousClassBody( {
     initializer: function() {
     setFont( BendingLightCanvas.labelFont );
     setBackground( new Color( 0, 0, 0, 0 ) );
     }
     } ) ) );
     this.addChild( new Image( new NormalLine( modelViewTransform, modelHeight, 9, 30, 30 ) ) );
     this.addChild( iconNode );*/
  }

  return inherit( Node, ToolboxNode, {},
    //statics
    {
      ICON_WIDTH: ICON_WIDTH
    } );
} );

