// Copyright (c) 2002 - 2015. University of Colorado Boulder

/**
 * View for intro screen
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var BendingLightView = require( 'BENDING_LIGHT/common/view/BendingLightView' );
  var MediumControlPanel = require( 'BENDING_LIGHT/common/view/MediumControlPanel' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var MediumNode = require( 'BENDING_LIGHT/common/view/MediumNode' );
  var LaserView = require( 'BENDING_LIGHT/common/view/LaserView' );
  var NormalLine = require( 'BENDING_LIGHT/intro/view/NormalLine' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var ToolboxNode = require( 'BENDING_LIGHT/common/view/ToolboxNode' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var ProtractorModel = require( 'BENDING_LIGHT/common/model/ProtractorModel' );
  var ToolIconNode = require( 'BENDING_LIGHT/common/view/ToolIconNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Util = require( 'DOT/Util' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  //images
  var protractorImage = require( 'image!BENDING_LIGHT/protractor.png' );

  //strings
  var materialString = require( 'string!BENDING_LIGHT/material' );
  var normalString = require( 'string!BENDING_LIGHT/normal' );
  var slowMotionString = require( 'string!BENDING_LIGHT/slowMotion' );
  // constants
  var inset = 10;

  /**
   *
   * @param introModel
   * @param centerOffsetLeft
   * @constructor
   */
  function IntroView( introModel, centerOffsetLeft ) {
    var introView = this;

    function clampDragAngle( angle ) {
      while ( angle < 0 ) { angle += Math.PI * 2; }
      return Util.clamp( angle, Math.PI / 2, Math.PI );
    }

    //Indicate if the laser is not at its max angle,
    // and therefore can be dragged to larger angles
    function clockwiseArrowNotAtMax( laserAngle ) {
      return laserAngle < Math.PI;
    }

    //Indicate if the laser is not at its min angle,
    // and can therefore be dragged to smaller angles.
    function ccwArrowNotAtMax( laserAngle ) {
      return laserAngle > Math.PI / 2;
    }

    //rotation if the user clicks anywhere on the object
    function rotationRegionShape( full, back ) {
      // In this tab, clicking anywhere on the laser (i.e. on its 'full' bounds)
      // translates it, so always return the 'full' region
      return full;
    }

    //Get the function that chooses which region of the protractor can be used for
    // rotation--none in this tab.
    function getProtractorRotationRegion( innerBar, outerCircle ) {
      //empty shape since shouldn't be rotatable in this tab
      return new Shape.rect( 0, 0, 0, 0 );
    }

    this.protractorModel = new ProtractorModel( introModel.x, introModel.y );
    //number of columns to show in the MediumControlPanel readout
    BendingLightView.call( this,
      introModel,
      clampDragAngle,
      clockwiseArrowNotAtMax,
      ccwArrowNotAtMax,
      true,
      getProtractorRotationRegion,
      rotationRegionShape,
      centerOffsetLeft );

    //Add MediumNodes for top and bottom
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.topMedium ) );
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.bottomMedium ) );

    var IndexOfRefractionDecimals = 2;
    //Add control panels for setting the index of refraction for each medium
    var topMediumMaterialListParent = new Node();
    var topMediumControlPanel = new MediumControlPanel( introModel, this, introModel.topMedium,
      materialString, true, introModel.wavelengthProperty, IndexOfRefractionDecimals, topMediumMaterialListParent );
    topMediumControlPanel.setTranslation( this.stageSize.width - topMediumControlPanel.getWidth(), this.modelViewTransform.modelToViewY( 0 ) - 10 - topMediumControlPanel.getHeight() );
    this.afterLightLayer2.addChild( topMediumControlPanel );
    this.afterLightLayer2.addChild( topMediumMaterialListParent );

    //Add control panels for setting the index of refraction for each medium
    var bottomMaterialListParent = new Node();
    var bottomMediumControlPanel = new MediumControlPanel( introModel, this, introModel.bottomMedium,
      materialString, true, introModel.wavelengthProperty, IndexOfRefractionDecimals, bottomMaterialListParent );
    bottomMediumControlPanel.setTranslation( this.stageSize.width - topMediumControlPanel.getWidth(), this.modelViewTransform.modelToViewY( 0 ) + 10 );
    this.afterLightLayer2.addChild( bottomMediumControlPanel );
    this.afterLightLayer2.addChild( bottomMaterialListParent );

    //add a line that will show the border between the mediums even when both n's are the same... Just a thin line will be fine.
    this.beforeLightLayer.addChild( new Path( this.modelViewTransform.modelToViewShape(
      new Shape()
        .moveTo( -1, 0 )
        .lineTo( 1, 0 ), {
        stroke: 'gray',
        pickable: false
      } ) ) );

    //Show the normal line where the laser strikes the interface between mediums
    var normalLine = new NormalLine( this.stageSize.height / 2 );
    normalLine.setTranslation( this.stageSize.width / 2, this.stageSize.height / 4 );
    this.afterLightLayer2.addChild( normalLine );

    introModel.showNormalProperty.link( function( showNormal ) {
      normalLine.setVisible( showNormal );
    } );


    //Embed in the a control panel node to get a border and background
    var laserView = new LaserView( introModel, {} );
    //Set the location and add to the scene
    laserView.setTranslation( 5, 5 );
    this.afterLightLayer2.addChild( laserView );
    var protractor = new Image( protractorImage, {
      scale: ToolboxNode.ICON_WIDTH / protractorImage.width,
      x: 0, y: 0
    } );
    var protractorNode = new ToolIconNode( protractor, this.showProtractor, this.modelViewTransform, this, introModel );

    //Create the toolbox
    this.toolboxNode = new ToolboxNode( this, this.modelViewTransform, protractorNode, this.getMoreTools( introModel ), introModel.getIntensityMeter(), introModel.showNormalProperty, {} );
    this.beforeLightLayer.addChild( this.toolboxNode );
    this.toolboxNode.setTranslation( this.layoutBounds.minX, 504 - this.toolboxNode.height - 10 );

    // Add reset all button
    var resetAllButton = new ResetAllButton(
      {
        listener: function() {
          introModel.resetAll();
          introView.protractorModel.reset();
        },
        bottom: this.layoutBounds.bottom - inset,
        right:  this.layoutBounds.right - inset
      } );

    this.afterLightLayer2.addChild( resetAllButton );


    // add play pause button and step button
    var stepButton = new StepButton(
      function() {

      },
      introModel.isPlayingProperty,
      {
        radius: 12,
        stroke: 'black',
        fill: '#005566',
        right:  resetAllButton.left - 82,
        bottom: this.layoutBounds.bottom - 14
      }
    );

    this.addChild( stepButton );

    var playPauseButton = new PlayPauseButton( introModel.isPlayingProperty,
      { radius: 18, stroke: 'black', fill: '#005566', y: stepButton.centerY, right: stepButton.left - inset } );
    this.addChild( playPauseButton );

    // add sim speed controls
    var slowMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'slow',
      new Text( slowMotionString, { font: new PhetFont( 12 ) } ), { radius: 8 } );
    var normalMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'normal',
      new Text( normalString, { font: new PhetFont( 12 ) } ), { radius: 8 } );

    var speedControlMaxWidth = ( slowMotionRadioBox.width > normalMotionRadioBox.width ) ? slowMotionRadioBox.width :
                               normalMotionRadioBox.width;

    var radioButtonSpacing = 5;
    var touchAreaHeightExpansion = radioButtonSpacing / 2;
    slowMotionRadioBox.touchArea = new Bounds2(
      slowMotionRadioBox.localBounds.minX,
      slowMotionRadioBox.localBounds.minY - touchAreaHeightExpansion,
      ( slowMotionRadioBox.localBounds.minX + speedControlMaxWidth ),
      slowMotionRadioBox.localBounds.maxY + touchAreaHeightExpansion
    );

    normalMotionRadioBox.touchArea = new Bounds2(
      normalMotionRadioBox.localBounds.minX,
      normalMotionRadioBox.localBounds.minY - touchAreaHeightExpansion,
      ( normalMotionRadioBox.localBounds.minX + speedControlMaxWidth ),
      normalMotionRadioBox.localBounds.maxY + touchAreaHeightExpansion
    );

    var speedControl = new VBox( {
      align: 'left',
      spacing: radioButtonSpacing,
      children: [ slowMotionRadioBox, normalMotionRadioBox ]
    } );
    this.addChild( speedControl.mutate( { right: playPauseButton.left - 8, bottom: playPauseButton.bottom } ) );
    introModel.laserViewProperty.link( function( laserType ) {
      playPauseButton.visible = (laserType === 'wave');
      stepButton.visible = (laserType === 'wave');
      speedControl.visible = (laserType === 'wave');
    } );

  }

  return inherit( BendingLightView, IntroView, {
    createNode: function( transform, showTool, x, y ) {
      return this.newProtractorNode( transform, showTool, x, y );
    },

    //No more tools available in IntroCanvas, but this is overriden in MoreToolsCanvas to provide additional tools
    getMoreTools: function( resetModel ) {
      return new Node();
    },
    //Create a protractor node, used by the protractor Tool
    newProtractorNode: function( transform, showTool, x, y ) {
      this.protractorModel.position.x = x;
      this.protractorModel.position.y = y;
      return new ProtractorNode( transform, showTool, this.protractorModel, ProtractorNode.DEFAULT_SCALE, 1 );
    },

    //Get the function that chooses which region of the protractor can be used for translation--both
    // the inner bar and outer circle in this tab
    getProtractorDragRegion: function( innerBar, outerCircle ) {
      //return new Area( innerBar ).add( new Area( outerCircle ) );
    }

  } );
} );

