// Copyright 2002-2015, University of Colorado
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
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var ProtractorModel = require( 'BENDING_LIGHT/common/model/ProtractorModel' );
  var Vector2 = require( 'DOT/Vector2' );

  //  constants
  var ICON_WIDTH = 90;

  /**
   *
   * @param canvas
   * @param modelViewTransform
   * @param moreTools
   * @param intensityMeter
   * @param showNormal
   * @param options
   * @constructor
   */
  function ToolboxNode( canvas, modelViewTransform, moreTools, intensityMeter, showNormal, options ) {

    Node.call( this );
    this.sensorPanel = new Rectangle( 0, 0, 100, 235, 10, 10, {
      stroke: 'gray', lineWidth: 1, fill: '#EEEEEE'
    } );
    this.addChild( this.sensorPanel );

    //Initial tools
    var protractorModelPosition = modelViewTransform.viewToModelPosition( new Vector2( this.sensorPanel.centerX, this.sensorPanel.y + 50 ) );
    this.protractorModel = new ProtractorModel( protractorModelPosition.x, protractorModelPosition.y );
    this.protractorNode = new ProtractorNode( modelViewTransform, canvas.showProtractor, this.protractorModel,
      canvas.getProtractorDragRegion, canvas.getProtractorRotationRegion, ICON_WIDTH, this.sensorPanel.getBounds() );
    this.addChild( this.protractorNode );

    this.intensityMeterNode = new IntensityMeterNode( modelViewTransform, intensityMeter, this.sensorPanel.getBounds() );
    this.addChild( this.intensityMeterNode );

    var checkBoxOptions = {
      boxWidth: 20,
      spacing: 5
    };

    var normalText = new Text( 'Normal' );
    var normalCheckBox = new CheckBox( normalText, showNormal, checkBoxOptions );
    normalCheckBox.setTranslation( 15, 180 );
    this.addChild( normalCheckBox );

    // add normal
    var normalIcon = new NormalLine( 50 );
    normalIcon.setTranslation( 60, 180 );
    this.addChild( normalIcon );
  }

  return inherit( Node, ToolboxNode, {
      getSensorBounds: function() {
        return this.sensorPanel.getBounds();
      },
      resetAll: function() {
        this.intensityMeterNode.setScaleMagnitude( 0.3 );
        this.protractorNode.setProtractorScale( this.protractorNode.multiScale );
        this.protractorModel.reset();
      }
    },
    //statics
    {
      ICON_WIDTH: ICON_WIDTH
    } );
} );

