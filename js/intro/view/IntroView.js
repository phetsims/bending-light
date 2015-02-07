// Copyright (c) 2002 - 2015. University of Colorado Boulder

/**
 * View for intro screen
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
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
  var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );
  var ToolboxNode = require( 'BENDING_LIGHT/common/view/ToolboxNode' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var ProtractorModel = require( 'BENDING_LIGHT/common/model/ProtractorModel' );


  //images
  var protractorImage = require( 'image!BENDING_LIGHT/protractor.png' );

  // constants
  var inset = 10;

  function IntroView( introModel, moduleActive, centerOffsetLeft ) {

    //number of columns to show in the MediumControlPanel readout
    BendingLightView.call( this, introModel, moduleActive, //Specify how the drag angle should be clamped, in this case the laser must remain in the top left quadrant
      new function( angle ) {
        while ( angle < 0 ) {
          angle += Math.PI * 2;
        }
        return angle/*Math.Util.Clamp( Math.PI / 2, angle, Math.PI )*/;
      }, //Indicate if the laser is not at its max angle, and therefore can be dragged to larger angles
      new function( laserAngle ) {
        return laserAngle < Math.PI;
      }, //Indicate if the laser is not at its min angle, and can therefore be dragged to smaller angles.
      new function( laserAngle ) {
        return laserAngle > Math.PI / 2;
      }, true, /*this.getProtractorRotationRegion(),*/ //rotation if the user clicks anywhere on the object
      new function( full, back ) {
        // In this tab, clicking anywhere on the laser (i.e. on its 'full' bounds) translates it, so always return the 'full' region
        return full;
      }, centerOffsetLeft );

    //Add MediumNodes for top and bottom
    var topMediumNode = new MediumNode( this.modelViewTransform, introModel.topMedium );
    this.mediumNode.addChild( topMediumNode );
    var bottomMediumNode = new MediumNode( this.modelViewTransform, introModel.bottomMedium );
    this.mediumNode.addChild( bottomMediumNode );

    //Add control panels for setting the index of refraction for each medium
    var topMediumControlPanel = new MediumControlPanel( introModel, this, introModel.topMedium, true, introModel.wavelengthProperty );
    topMediumControlPanel.setTranslation( this.stageSize.width - topMediumControlPanel.getWidth(), this.modelViewTransform.modelToViewY( 0 ) - 10 - topMediumControlPanel.getHeight() );
    this.afterLightLayer2.addChild( topMediumControlPanel );

    var bottomMediumControlPanel = new MediumControlPanel( introModel, this, introModel.bottomMedium, true, introModel.wavelengthProperty );
    bottomMediumControlPanel.setTranslation( this.stageSize.width - bottomMediumControlPanel.getWidth(), this.modelViewTransform.modelToViewY( 0 ) + 10 );
    this.afterLightLayer2.addChild( bottomMediumControlPanel );

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


    var protractorNode = new ProtractorNode( this.modelViewTransform, this.showProtractor, new ProtractorModel( 0, 0 ), ProtractorNode.DEFAULT_SCALE, ToolboxNode.ICON_WIDTH / protractorImage.width );

    //Create the toolbox
    var toolboxNode = new ToolboxNode( this, this.modelViewTransform, protractorNode, this.getMoreTools( introModel ), introModel.getIntensityMeter(), introModel.showNormalProperty, {} );
    this.beforeLightLayer.addChild( toolboxNode );
    toolboxNode.setTranslation( this.layoutBounds.minX, 504 - toolboxNode.height - 10 );

    // Add reset all button
    var resetAllButton = new ResetAllButton(
      {
        listener: function() {
          introModel.resetAll();
        },
        bottom: this.layoutBounds.bottom - inset,
        right:  this.layoutBounds.right - inset
      } );

    this.afterLightLayer2.addChild( resetAllButton );


  }

  return inherit( BendingLightView, IntroView, {

    //No more tools available in IntroCanvas, but this is overriden in MoreToolsCanvas to provide additional tools
    getMoreTools: function( resetModel ) {
      return new Node();
    }

  } );
} );

