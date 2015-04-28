// Copyright 2002-2015, University of Colorado Boulder
/**
 * View for intro screen
 *
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
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Util = require( 'DOT/Util' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var IntensityMeterNode = require( 'BENDING_LIGHT/common/view/IntensityMeterNode' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var ProtractorModel = require( 'BENDING_LIGHT/common/model/ProtractorModel' );
  var ExpandableProtractorNode = require( 'BENDING_LIGHT/moretools/view/ExpandableProtractorNode' );

  // strings
  var materialString = require( 'string!BENDING_LIGHT/material' );
  var normalString = require( 'string!BENDING_LIGHT/normal' );
  var slowMotionString = require( 'string!BENDING_LIGHT/slowMotion' );

  // constants
  var INSET = 10;

  /**
   *
   * @param {IntroModel}introModel -model of intro screen
   * @param {Number} centerOffsetLeft
   * @param {boolean} hasMoreTools
   * @param {Number} IndexOfRefractionDecimals
   * @constructor
   */
  function IntroView( introModel, centerOffsetLeft, hasMoreTools, IndexOfRefractionDecimals ) {
    var introView = this;
    this.introModel = introModel;

    // specify how the drag angle should be clamped, in this case the laser must remain in the top left quadrant
    function clampDragAngle( angle ) {
      while ( angle < 0 ) { angle += Math.PI * 2; }
      return Util.clamp( angle, Math.PI / 2, Math.PI );
    }

    // indicate if the laser is not at its max angle,
    // and therefore can be dragged to larger angles
    function clockwiseArrowNotAtMax( laserAngle ) {
      return laserAngle < Math.PI;
    }

    // indicate if the laser is not at its min angle,
    // and can therefore be dragged to smaller angles.
    function ccwArrowNotAtMax( laserAngle ) {
      return laserAngle > Math.PI / 2;
    }

    // rotation if the user clicks anywhere on the object
    function rotationRegionShape( full, back ) {
      // in this screen, clicking anywhere on the laser (i.e. on its 'full' bounds)
      // translates it, so always return the 'full' region
      return full;
    }

    // get the function that chooses which region of the protractor can be used for
    // rotation--none in this tab.
    this.getProtractorRotationRegion = function( fullShape, innerBar, outerCircle ) {
      // empty shape since shouldn't be rotatable in this tab
      return new Shape.rect( 0, 0, 0, 0 );
    };

    // get the function that chooses which region of the protractor can be used for translation--both
    // the inner bar and outer circle in this screen
    this.getProtractorDragRegion = function( fullShape, innerBar, outerCircle ) {
      return fullShape;
    };
    BendingLightView.call( this,
      introModel,
      clampDragAngle,
      clockwiseArrowNotAtMax,
      ccwArrowNotAtMax,
      true,
      this.getProtractorRotationRegion,
      rotationRegionShape, 'laser',
      centerOffsetLeft );

    // add MediumNodes for top and bottom
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.topMediumProperty ) );
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.bottomMediumProperty ) );

    // add control panels for setting the index of refraction for each medium
    var topMediumControlPanel = new MediumControlPanel( this, introModel.topMediumProperty,
      materialString, true, introModel.wavelengthProperty, IndexOfRefractionDecimals );
    topMediumControlPanel.setTranslation( this.stageSize.width - topMediumControlPanel.getWidth() - INSET, this.modelViewTransform.modelToViewY( 0 ) - 10 - topMediumControlPanel.getHeight() );
    this.afterLightLayer2.addChild( topMediumControlPanel );

    // add control panels for setting the index of refraction for each medium
    var bottomMediumControlPanel = new MediumControlPanel( this, introModel.bottomMediumProperty,
      materialString, true, introModel.wavelengthProperty, IndexOfRefractionDecimals );
    bottomMediumControlPanel.setTranslation( this.stageSize.width - topMediumControlPanel.getWidth() - INSET, this.modelViewTransform.modelToViewY( 0 ) + 10 );
    this.afterLightLayer2.addChild( bottomMediumControlPanel );

    // add a line that will show the border between the mediums even when both n's are the same... Just a thin line will be fine.
    this.beforeLightLayer.addChild( new Path( this.modelViewTransform.modelToViewShape(
      new Shape()
        .moveTo( -1, 0 )
        .lineTo( 1, 0 ), {
        stroke: 'gray',
        pickable: false
      } ) ) );

    // show the normal line where the laser strikes the interface between mediums
    var normalLineHeight = this.stageSize.height / 2;
    var normalLine = new NormalLine( normalLineHeight );
    normalLine.setTranslation( this.modelViewTransform.modelToViewX( 0 ),
      this.modelViewTransform.modelToViewY( 0 ) - normalLineHeight / 2 );
    this.afterLightLayer2.addChild( normalLine );

    introModel.showNormalProperty.link( function( showNormal ) {
      normalLine.setVisible( showNormal );
    } );

    //  add laser view panel
    var laserView = new LaserView( introModel, hasMoreTools, { left: this.layoutBounds.minX + INSET * 0.3, top: this.layoutBounds.top + 4 } );

    this.afterLightLayer2.addChild( laserView );

    var sensorPanelHeight = this.getMoreTools().length ? 330 : 220;

    this.sensorPanel = new Rectangle( 0, 0, 100, sensorPanelHeight, 5, 5, {
      stroke: '#696969', lineWidth: 1.5, fill: '#EEEEEE',
      left: this.layoutBounds.minX + INSET * 0.3,
      top:  this.layoutBounds.maxY - sensorPanelHeight - 10
    } );
    this.beforeLightLayer2.addChild( this.sensorPanel );

    var ICON_WIDTH = 85;

    // initial tools
    var protractorModelPositionX = this.modelViewTransform.viewToModelX( this.sensorPanel.centerX );
    var protractorModelPositionY = this.modelViewTransform.viewToModelY( this.sensorPanel.y + 45 );
    this.protractorModel = new ProtractorModel( protractorModelPositionX, protractorModelPositionY );

    //  if intro screen  regular protractor node else expandable protractor node.
    if ( this.getMoreTools().length === 0 ) {
      this.protractorNode = new ProtractorNode( this, this.modelViewTransform, this.showProtractorProperty, this.protractorModel,
        this.getProtractorDragRegion, this.getProtractorRotationRegion, ICON_WIDTH, this.sensorPanel.bounds, this.layoutBounds );
    }
    else {
      this.protractorNode = new ExpandableProtractorNode( this, this.modelViewTransform, this.showProtractorProperty, this.protractorModel,
        this.getProtractorDragRegion, this.getProtractorRotationRegion, ICON_WIDTH, this.sensorPanel.bounds, this.layoutBounds );
    }
    this.beforeLightLayer2.addChild( this.protractorNode );

    this.intensityMeterNode = new IntensityMeterNode( this, this.modelViewTransform, introModel.getIntensityMeter(), this.sensorPanel.visibleBounds, this.layoutBounds );
    this.beforeLightLayer2.addChild( this.intensityMeterNode );

    var checkBoxOptions = {
      boxWidth: 20,
      spacing: 5
    };

    var normalText = new Text( normalString );

    var normalText_Max_Width = 50;
    if ( normalText.width > normalText_Max_Width ) {
      normalText.scale( normalText_Max_Width / normalText.width );
    }
    var normalCheckBox = new CheckBox( normalText, introModel.showNormalProperty, checkBoxOptions );
    normalCheckBox.setTranslation( 15, this.sensorPanel.y + sensorPanelHeight - 55 );
    this.beforeLightLayer2.addChild( normalCheckBox );

    // add normal
    var normalIcon = new NormalLine( 50 );
    normalIcon.setTranslation( 60, this.sensorPanel.y + sensorPanelHeight - 55 );
    this.beforeLightLayer2.addChild( normalIcon );

    // add reset all button
    var resetAllButton = new ResetAllButton(
      {
        listener: function() {
          introView.intensityMeterNode.reset();
          introModel.resetAll();
          introView.resetAll();
          laserView.resetAll();
          topMediumControlPanel.reset();
          bottomMediumControlPanel.reset();

        },
        bottom: this.layoutBounds.bottom - INSET,
        right: this.layoutBounds.right - INSET,
        radius: 20
      } );

    this.afterLightLayer2.addChild( resetAllButton );

    // add play pause button and step button
    this.stepButton = new StepButton(
      function() {
        introView.stepInternal();
        introModel.stepInternal();
        introModel.propagateParticles( 20 );
        for ( var k = 0; k < introView.waveCanvasLayer.getChildrenCount(); k++ ) {
          introView.waveCanvasLayer.children[ k ].step();
        }
        for ( k = 0; k < introView.incidentWaveCanvasLayer.getChildrenCount(); k++ ) {
          introView.incidentWaveCanvasLayer.children[ k ].step();
        }
      },
      introModel.isPlayingProperty,
      {
        radius: 12,
        stroke: 'black',
        fill: '#005566',
        left: this.sensorPanel.right + 170,
        bottom: this.layoutBounds.bottom - 20
      }
    );

    this.addChild( this.stepButton );
    introModel.laserViewProperty.link( function() {
      introModel.laser.waveProperty.value = introModel.laserViewProperty.value === 'wave';
    } );

    this.playPauseButton = new PlayPauseButton( introModel.isPlayingProperty,
      { radius: 18, stroke: 'black', fill: '#005566', y: this.stepButton.centerY, right: this.stepButton.left - INSET } );
    this.addChild( this.playPauseButton );

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

    this.speedControl = new VBox( {
      align: 'left',
      spacing: radioButtonSpacing,
      children: [ normalMotionRadioBox, slowMotionRadioBox ]
    } );
    this.addChild( this.speedControl.mutate( { right: this.playPauseButton.left - 8, bottom: this.playPauseButton.bottom } ) );
    introModel.laserViewProperty.link( function( laserType ) {

      introView.playPauseButton.visible = (laserType === 'wave');
      introView.stepButton.visible = (laserType === 'wave');
      introView.speedControl.visible = (laserType === 'wave');
    } );

  }

  return inherit( BendingLightView, IntroView, {

    step: function() {
      this.stepInternal();

      // This is required to clear the previous canvas particle layers from the view.
      // When the sim is paused in wave mode and the laser is dragged or the mode is switched from wave to ray
      for ( var k = 0; k < this.waveCanvasLayer.getChildrenCount(); k++ ) {
        this.waveCanvasLayer.children[ k ].step();
      }
      if ( this.introModel.laserViewProperty.value === 'wave' ) {
        for ( k = 0; k < this.incidentWaveCanvasLayer.getChildrenCount(); k++ ) {
          this.incidentWaveCanvasLayer.children[ k ].step();
        }
      }
      var scale = Math.min( window.innerWidth / this.layoutBounds.width, window.innerHeight / this.layoutBounds.height );
      this.introModel.simDisplayWindowHeight = ( window.innerHeight) / scale;
      this.introModel.simDisplayWindowHeightInModel = Math.abs( this.modelViewTransform.viewToModelDeltaY( this.introModel.simDisplayWindowHeight ) );
    },
    stepInternal: function() {

    },
    /**
     * @public
     */
    resetAll: function() {
      this.protractorModel.reset();
      this.protractorNode.resetAll();
    },

    /**
     * No more tools available in IntroCanvas, but this is overriden in MoreToolsCanvas to provide additional tools
     *
     * @returns {Array}
     */
    getMoreTools: function() {
      return [];
    }
  } );
} );
