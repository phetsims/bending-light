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
  var Node = require( 'SCENERY/nodes/Node' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var ToolboxNode = require( 'BENDING_LIGHT/common/view/ToolboxNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Util = require( 'DOT/Util' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var EventTimer = require( 'PHET_CORE/EventTimer' );
  var IntensityMeterNode = require( 'BENDING_LIGHT/common/view/IntensityMeterNode' );
  var WaveCanvasNode = require( 'BENDING_LIGHT/intro/view/WaveCanvasNode' );
  var Property = require( 'AXON/Property' );

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
   * @param hasMoreTools
   * @constructor
   */
  function IntroView( introModel, centerOffsetLeft, hasMoreTools ) {
    var introView = this;
    this.introModel = introModel;
    //Specify how the drag angle should be clamped, in this case the laser must remain in the top left quadrant
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
    this.getProtractorRotationRegion = function( fullShape, innerBar, outerCircle ) {
      //empty shape since shouldn't be rotatable in this tab
      return new Shape.rect( 0, 0, 0, 0 );
    };

    //Get the function that chooses which region of the protractor can be used for translation--both
    // the inner bar and outer circle in this tab
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

    //Add MediumNodes for top and bottom
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.topMedium ) );
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.bottomMedium ) );

    var IndexOfRefractionDecimals = 2;
    //Add control panels for setting the index of refraction for each medium
    var topMediumControlPanel = new MediumControlPanel( this, introModel.topMedium,
      materialString, true, introModel.wavelengthPropertyProperty, IndexOfRefractionDecimals );
    topMediumControlPanel.setTranslation( this.stageSize.width - topMediumControlPanel.getWidth(), this.modelViewTransform.modelToViewY( 0 ) - 10 - topMediumControlPanel.getHeight() );
    this.afterLightLayer2.addChild( topMediumControlPanel );

    //Add control panels for setting the index of refraction for each medium
    var bottomMediumControlPanel = new MediumControlPanel( this, introModel.bottomMedium,
      materialString, true, introModel.wavelengthPropertyProperty, IndexOfRefractionDecimals );
    bottomMediumControlPanel.setTranslation( this.stageSize.width - topMediumControlPanel.getWidth(), this.modelViewTransform.modelToViewY( 0 ) + 10 );
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
    var normalLineHeight = this.stageSize.height / 2;
    var normalLine = new NormalLine( normalLineHeight );
    normalLine.setTranslation( this.modelViewTransform.modelToViewX( 0 ),
      this.modelViewTransform.modelToViewY( 0 ) - normalLineHeight / 2 );
    this.afterLightLayer2.addChild( normalLine );

    introModel.showNormalProperty.link( function( showNormal ) {
      normalLine.setVisible( showNormal );
    } );

    //Embed in the a control panel node to get a border and background
    var laserView = new LaserView( introModel, hasMoreTools, {} );
    //Set the location and add to the scene
    laserView.setTranslation( 5, 5 );
    this.afterLightLayer2.addChild( laserView );

    //Create the toolbox
    this.toolboxNode = new ToolboxNode( this, this.modelViewTransform, this.getMoreTools( introModel ), introModel.getIntensityMeter(), introModel.showNormalProperty, {} );
    this.beforeLightLayer.addChild( this.toolboxNode );
    this.toolboxNode.setTranslation( this.layoutBounds.minX, this.layoutBounds.maxY - this.toolboxNode.height - 10 );

    this.intensityMeterNode = new IntensityMeterNode( this.modelViewTransform, introModel.getIntensityMeter(), this.toolboxNode.visibleBounds );
    this.beforeLightLayer.addChild( this.intensityMeterNode );
    // Add reset all button
    var resetAllButton = new ResetAllButton(
      {
        listener: function() {
          introView.intensityMeterNode.setIntensityMeterScale( introView.intensityMeterNode.intensityMeter.sensorPositionProperty.initialValue, 0.3 );
          introModel.resetAll();
          introView.toolboxNode.resetAll();
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
    this.waveParticleCanvasLayer = new Node();
    this.waveCanvasLayer.addChild( this.waveParticleCanvasLayer );
    //var typesOfParticles = [ introModel.waveParticles, introModel.reflectedWaveParticles, introModel.refractedWaveParticles ];

    Property.multilink( [
      introModel.laserViewProperty,
      introModel.laser.onProperty,
      introModel.intensityMeter.sensorPositionProperty,
      introModel.laser.emissionPointProperty,
      introModel.intensityMeter.enabledProperty
    ], function() {
      var points;
      var minX;
      var minY;
      var maxX;
      var maxY;
      var reflectedRaMinY;
      var reflectedRayMaxY;
      introModel.laser.waveProperty.value = introModel.laserViewProperty.value === 'wave';
      if ( introModel.laserViewProperty.value === 'wave' ) {

        for ( var k = 0; k < introView.waveParticleCanvasLayer.getChildrenCount(); k++ ) {
          introView.waveParticleCanvasLayer.removeChild( introView.waveParticleCanvasLayer.children[ k ] );
        }

        for ( k = 0; k < introModel.rays.length; k++ ) {
          points = introModel.rays.get( k ).getWaveBounds();
          minX = introView.modelViewTransform.modelToViewX( points[ 1 ].x );
          reflectedRaMinY = introView.modelViewTransform.modelToViewY( points[ 2 ].y );
          maxX = introView.modelViewTransform.modelToViewX( points[ 3 ].x );
          reflectedRayMaxY = introView.modelViewTransform.modelToViewY( points[ 0 ].y );
          minY = introView.modelViewTransform.modelToViewY( points[ 0 ].y );
          maxY = introView.modelViewTransform.modelToViewY( points[ 2 ].y );
          minY = k === 1 ? reflectedRaMinY : minY;
          maxY = k === 1 ? reflectedRayMaxY : maxY;
          var particleCanvasNode = new WaveCanvasNode( introModel.rays.get( k ).particles, introView.modelViewTransform, {
            canvasBounds: new Bounds2( minX, minY, maxX, maxY ),
            clipArea: introView.modelViewTransform.modelToViewShape( introModel.rays.get( k ).getWaveShape() )
            } );
          introView.waveParticleCanvasLayer.addChild( particleCanvasNode );
        }
      }
    } );
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

    /* // call stepInternal at a rate of 8 times per second
    this.timer = new EventTimer( new EventTimer.UniformEventModel( 8, Math.random ), function() {
      introView.stepInternal();
     } );*/

  }

  return inherit( BendingLightView, IntroView, {
    step: function( dt ) {
      if ( this.introModel.isPlaying ) {
        //this.timer.step( dt );
        for ( var k = 0; k < this.waveParticleCanvasLayer.getChildrenCount(); k++ ) {
          this.waveParticleCanvasLayer.children[ k ].step();
        }
      }
      var scale = Math.min( window.innerWidth / this.layoutBounds.width, window.innerHeight / this.layoutBounds.height );
      this.introModel.simDisplayWindowHeight = window.innerHeight / 2 * scale;
      this.introModel.simDisplayWindowHeightInModel = Math.abs( this.modelViewTransform.viewToModelDeltaY( window.innerHeight * scale ) );
    },

    /*stepInternal: function() {
      var lightWaves = this.lightWaveLayer.getChildren();
      for ( var i = 0; i < lightWaves.length; i++ ) {
        lightWaves[ i ].step();
      }

     },*/

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

