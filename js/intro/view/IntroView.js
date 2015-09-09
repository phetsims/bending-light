// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for intro screen
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Sam Reid
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
  var LaserControlPanel = require( 'BENDING_LIGHT/common/view/LaserControlPanel' );
  var NormalLine = require( 'BENDING_LIGHT/intro/view/NormalLine' );
  var AngleNode = require( 'BENDING_LIGHT/intro/view/AngleNode' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Util = require( 'DOT/Util' );
  var Property = require( 'AXON/Property' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var IntensityMeterNode = require( 'BENDING_LIGHT/common/view/IntensityMeterNode' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var ProtractorModel = require( 'BENDING_LIGHT/common/model/ProtractorModel' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var FloatingLayout = require( 'BENDING_LIGHT/common/view/FloatingLayout' );
  var WaveWebGLNode = require( 'BENDING_LIGHT/intro/view/WaveWebGLNode' );
  var WaveCanvasNode = require( 'BENDING_LIGHT/intro/view/WaveCanvasNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var AngleIcon = require( 'BENDING_LIGHT/intro/view/AngleIcon' );

  // strings
  var materialString = require( 'string!BENDING_LIGHT/material' );
  var normalString = require( 'string!BENDING_LIGHT/normal' );
  var anglesString = require( 'string!BENDING_LIGHT/angles' );
  var slowMotionString = require( 'string!BENDING_LIGHT/slowMotion' );
  var rayString = require( 'string!BENDING_LIGHT/ray' );
  var waveString = require( 'string!BENDING_LIGHT/wave' );

  // constants
  var INSET = 10;

  /**
   * @param {IntroModel} introModel - model of intro screen
   * @param {number} centerOffsetLeft - amount of space that center to be shifted to left
   * @param {boolean} hasMoreTools - whether contain more tools
   * @param {number} IndexOfRefractionDecimals - decimalPlaces to show for index of refraction
   * @constructor
   */
  function IntroView( introModel, centerOffsetLeft, hasMoreTools, IndexOfRefractionDecimals ) {

    var introView = this;
    this.introModel = introModel; // @public
    this.hasMoreTools = hasMoreTools; // @private

    // specify how the drag angle should be clamped, in this case the laser must remain in the top left quadrant
    function clampDragAngle( angle ) {
      while ( angle < 0 ) { angle += Math.PI * 2; }
      return Util.clamp( angle, Math.PI / 2, Math.PI );
    }

    // indicate if the laser is not at its max angle, and therefore can be dragged to larger angles
    function clockwiseArrowNotAtMax( laserAngle ) {
      if ( introModel.laserView === 'ray' ) {
        return laserAngle < Math.PI;
      }
      else {
        // TODO: This should be different for wave mode
        return laserAngle < BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
      }
    }

    // indicate if the laser is not at its min angle, and can therefore be dragged to smaller angles.
    function ccwArrowNotAtMax( laserAngle ) {
      return laserAngle > Math.PI / 2;
    }

    // rotation if the user clicks anywhere on the object
    function rotationRegionShape( full, back ) {

      // in this screen, clicking anywhere on the laser (i.e. on its 'full' bounds) translates it, so always return the
      // 'full' region
      return full;
    }

    // get the function that chooses which region of the protractor can be used for rotation--none in this tab.
    this.getProtractorRotationRegion = function( fullShape, innerBar, outerCircle ) {

      // empty shape since shouldn't be rotatable in this tab
      return new Shape.rect( 0, 0, 0, 0 );
    };

    // get the function that chooses which region of the protractor can be used for translation--both the inner bar and
    // outer circle in this screen
    this.getProtractorDragRegion = function( fullShape, innerBar, outerCircle ) {
      return fullShape;
    };

    BendingLightView.call( this,
      introModel,
      clampDragAngle,
      clockwiseArrowNotAtMax,
      ccwArrowNotAtMax,
      this.getProtractorRotationRegion,
      rotationRegionShape,
      'laser',
      centerOffsetLeft,
      0,
      // No need to handle occlusions
      function() {}
    );

    var stageWidth = this.layoutBounds.width;
    var stageHeight = this.layoutBounds.height;

    // add MediumNodes for top and bottom
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.topMediumProperty ) );
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.bottomMediumProperty ) );

    // add control panels for setting the index of refraction for each medium
    var topMediumControlPanel = new MediumControlPanel( this, introModel.topMediumProperty, materialString, true,
      introModel.wavelengthProperty, IndexOfRefractionDecimals, { yMargin: 7 } );
    var topMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    topMediumControlPanel.setTranslation(
      stageWidth - topMediumControlPanel.getWidth() - 2 * INSET - topMediumControlPanelXOffset,
      this.modelViewTransform.modelToViewY( 0 ) - 2 * INSET - topMediumControlPanel.getHeight() + 4 );
    this.afterLightLayer3.addChild( topMediumControlPanel );

    // add control panels for setting the index of refraction for each medium
    var bottomMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    var bottomMediumControlPanel = new MediumControlPanel( this, introModel.bottomMediumProperty, materialString, true,
      introModel.wavelengthProperty, IndexOfRefractionDecimals, { yMargin: 7 } );
    bottomMediumControlPanel.setTranslation(
      stageWidth - topMediumControlPanel.getWidth() - 2 * INSET - bottomMediumControlPanelXOffset,
      this.modelViewTransform.modelToViewY( 0 ) + 2 * INSET + 1 );
    this.afterLightLayer3.addChild( bottomMediumControlPanel );

    // add a line that will show the border between the mediums even when both n's are the same... Just a thin line will
    // be fine.
    this.beforeLightLayer.addChild( new Path( this.modelViewTransform.modelToViewShape( new Shape()
      .moveTo( -1, 0 )
      .lineTo( 1, 0 ), {
      stroke: 'gray',
      pickable: false
    } ) ) );

    // show the normal line where the laser strikes the interface between mediums
    var normalLineHeight = stageHeight / 2;
    var normalLine = new NormalLine( normalLineHeight, [ 7, 6 ], {
      x: this.modelViewTransform.modelToViewX( 0 ),
      y: this.modelViewTransform.modelToViewY( 0 ) - normalLineHeight / 2
    } );
    this.afterLightLayer2.addChild( normalLine );

    // Add the angle node
    this.afterLightLayer2.addChild( new AngleNode(
      this.introModel.showAnglesProperty,
      this.introModel.laser.onProperty,
      this.introModel.showNormalProperty,
      this.introModel.rays,
      this.modelViewTransform,

      // Method to add a step listener
      function( stepCallback ) {
        introView.on( 'step', stepCallback );
      }
    ) );

    introModel.showNormalProperty.linkAttribute( normalLine, 'visible' );

    Property.multilink( [
      introModel.laserViewProperty,
      introModel.laser.onProperty,
      introModel.intensityMeter.sensorPositionProperty,
      introModel.topMediumProperty,
      introModel.bottomMediumProperty,
      introModel.laser.emissionPointProperty,
      introModel.laser.colorProperty
    ], function() {
      for ( var k = 0; k < introView.incidentWaveLayer.getChildrenCount(); k++ ) {
        introView.incidentWaveLayer.children[ k ].step();
      }
      introView.incidentWaveLayer.setVisible( introModel.laser.on && introModel.laserView === 'wave' );
    } );

    // add laser view panel
    var laserViewXOffset = hasMoreTools ? 13 : 12;
    var laserViewYOffset = hasMoreTools ? 2 * INSET - 4 : 2 * INSET;
    var laserControlPanel = new LaserControlPanel( introModel.laserViewProperty, introModel.wavelengthProperty, [ {
      value: 'ray', label: rayString
    }, {
      value: 'wave', label: waveString
    } ], hasMoreTools, {
      xMargin: 9,
      yMargin: 6,
      radioButtonRadius: 6,
      spacing: 11,
      disableUnselected: false,
      minWidth: hasMoreTools ? 175 : 67,
      left: this.layoutBounds.minX + laserViewXOffset,
      top: this.layoutBounds.top + laserViewYOffset
    } );

    this.laserViewLayer.addChild( laserControlPanel );

    var toolBoxHeight = hasMoreTools ? 303 : 175;

    // @protected - the background for the tools panel
    this.toolbox = new Rectangle( 0, 0, 100, toolBoxHeight, 5, 5, {
      stroke: '#696969', lineWidth: 1.5, fill: '#EEEEEE',
      left: this.layoutBounds.minX + 13,
      top: this.layoutBounds.maxY - toolBoxHeight - 14
    } ); // @public
    this.beforeLightLayer2.addChild( this.toolbox );

    var protractorIconWidth = hasMoreTools ? 60 : 75;

    // initial tools
    this.protractorModel = new ProtractorModel( 0, 0 ); // @public

    // create the protractor node
    this.protractorNode = new ProtractorNode( this.afterLightLayer, this.beforeLightLayer2, this.modelViewTransform, this.showProtractorProperty,
      this.protractorModel, this.getProtractorDragRegion, this.getProtractorRotationRegion, protractorIconWidth,
      this.toolbox.bounds, this.visibleBoundsProperty, this.getProtractorNodeToolboxPosition.bind( this ) );
    this.protractorNode.addToToolBox();

    // add intensity meter
    this.intensityMeterNode = new IntensityMeterNode(
      this.beforeLightLayer,
      this.beforeLightLayer2,
      this.modelViewTransform,
      introModel.intensityMeter,
      function() {
        return introView.toolbox.visibleBounds;
      },
      this.visibleBoundsProperty,
      this.moveIntensityMeterToToolbox.bind( this )
    );
    this.intensityMeterNode.addToToolBox();

    // add normal check box
    var normalText = new Text( normalString, { fontSize: 12 } );
    var normalTextMaxWidth = 50;
    if ( normalText.width > normalTextMaxWidth ) {
      normalText.scale( normalTextMaxWidth / normalText.width );
    }

    var angleText = new Text( anglesString, { fontSize: 12 } );
    var angleTextMaxWidth = 50;
    if ( angleText.width > angleTextMaxWidth ) {
      angleText.scale( angleTextMaxWidth / angleText.width );
    }

    // add normal
    var normalIcon = new NormalLine( 17, [ 4, 3 ] );
    var normalCheckBox = new CheckBox( new HBox( {
      children: [
        normalText, normalIcon
      ], spacing: 12
    } ), introModel.showNormalProperty, {
      boxWidth: 15,
      spacing: 5
    } );

    var angleIcon = new AngleIcon();
    var angleCheckBox = new CheckBox( new HBox( {
      children: [
        angleText, angleIcon
      ], spacing: 12
    } ), introModel.showAnglesProperty, {
      boxWidth: 15,
      spacing: 5
    } );

    var checkboxPanelChildren = hasMoreTools ? [ normalCheckBox, angleCheckBox ] : [ normalCheckBox ];
    var checkBoxPanel = new VBox( {
      children: checkboxPanelChildren,
      spacing: 10,
      align: 'left',
      bottom: this.toolbox.height - 5,
      centerX: this.toolbox.width / 2
    } );
    this.toolbox.addChild( checkBoxPanel );

    // add reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        introView.intensityMeterNode.reset();
        introModel.reset();
        introView.reset();
        laserControlPanel.reset();
        topMediumControlPanel.reset();
        bottomMediumControlPanel.reset();
      },
      bottom: this.layoutBounds.bottom - 14,
      right: this.layoutBounds.right - 2 * INSET,
      radius: 19
    } );

    this.afterLightLayer2.addChild( resetAllButton );

    // add sim speed controls
    var slowMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'slow',
      new Text( slowMotionString, { font: new PhetFont( 12 ) } ), { radius: 8 } );
    var normalMotionRadioBox = new AquaRadioButton( introModel.speedProperty, 'normal',
      new Text( normalString, { font: new PhetFont( 12 ) } ), { radius: 8 } );

    var speedControlMaxWidth = ( slowMotionRadioBox.width > normalMotionRadioBox.width ) ?
                               slowMotionRadioBox.width : normalMotionRadioBox.width;

    // touch area
    var radioButtonSpacing = 5;
    var touchAreaHeightExpansion = radioButtonSpacing / 2;
    slowMotionRadioBox.touchArea = new Bounds2(
      slowMotionRadioBox.localBounds.minX,
      slowMotionRadioBox.localBounds.minY - touchAreaHeightExpansion,
      slowMotionRadioBox.localBounds.minX + speedControlMaxWidth,
      slowMotionRadioBox.localBounds.maxY + touchAreaHeightExpansion
    );

    // touch area
    normalMotionRadioBox.touchArea = new Bounds2(
      normalMotionRadioBox.localBounds.minX,
      normalMotionRadioBox.localBounds.minY - touchAreaHeightExpansion,
      normalMotionRadioBox.localBounds.minX + speedControlMaxWidth,
      normalMotionRadioBox.localBounds.maxY + touchAreaHeightExpansion
    );

    // add radio buttons to the VBox
    this.speedControl = new VBox( {
      align: 'left',
      spacing: radioButtonSpacing,
      children: [ normalMotionRadioBox, slowMotionRadioBox ]
    } );
    this.beforeLightLayer.addChild( this.speedControl.mutate( {
      left: this.toolbox.right + 25,
      bottom: this.layoutBounds.bottom - 15
    } ) );

    // add play pause button
    this.playPauseButton = new PlayPauseButton( introModel.isPlayingProperty,
      {
        radius: 18, stroke: 'black', fill: '#005566',
        bottom: this.layoutBounds.bottom - 15,
        left: this.speedControl.right + INSET
      } );
    this.beforeLightLayer.addChild( this.playPauseButton );

    // add step button
    this.stepButton = new StepButton(
      function() {
        introModel.updateSimulationTimeAndWaveShape();
        introView.updateWaveShape();
      },
      introModel.isPlayingProperty, {
        radius: 12,
        stroke: 'black',
        fill: '#005566',
        left: this.playPauseButton.right + 15,
        y: this.playPauseButton.centerY
      } );
    this.beforeLightLayer.addChild( this.stepButton );

    // show play pause and step buttons only in wave view
    introModel.laserViewProperty.link( function( laserType ) {
      introView.playPauseButton.visible = (laserType === 'wave');
      introView.stepButton.visible = (laserType === 'wave');
      introView.speedControl.visible = (laserType === 'wave');
    } );

    FloatingLayout.floatRight( this, [ topMediumControlPanel, bottomMediumControlPanel, resetAllButton ] );
    FloatingLayout.floatLeft( this, [ laserControlPanel, this.toolbox ] );

    this.events.on( 'layoutFinished', function() {

      if ( !introView.protractorModel.enabled ) {
        introView.moveProtractorToToolbox();
      }

      // Position the intensity meter below where the protractor *would* be (if it too were in the control panel)
      if ( !introView.bendingLightModel.intensityMeter.enabled ) {
        introView.moveIntensityMeterToToolbox();
      }
    } );
  }

  return inherit( BendingLightView, IntroView, {
    moveIntensityMeterToToolbox: function() {
      var protractorPosition = this.getProtractorNodeToolboxPosition();

      // The intensity meter appears lower in the toolbox on the more tools screen.
      var offsetY = this.hasMoreTools ? 120 : 0;
      this.bendingLightModel.intensityMeter.bodyPosition = this.modelViewTransform.viewToModelXY(
        protractorPosition.x + 20 - 2,
        protractorPosition.y + 60 + 5 + offsetY
      );
      this.bendingLightModel.intensityMeter.sensorPosition = this.modelViewTransform.viewToModelXY(
        protractorPosition.x - 20 - 4,
        protractorPosition.y + 60 - 5 + offsetY
      );
    },
    moveProtractorToToolbox: function() {
      var position = this.getProtractorNodeToolboxPosition();
      this.protractorModel.position = this.modelViewTransform.viewToModelXY( position.x, position.y );
    },
    getProtractorNodeToolboxPosition: function() {
      return new Vector2( this.toolbox.centerX, this.toolbox.y + 40 + (this.hasMoreTools ? 0 : 8) );
    },

    /**
     * Called by the animation loop.
     * @protected
     */
    step: function() {
      this.trigger0( 'step' );
      BendingLightView.prototype.step.call( this );
      if ( this.introModel.isPlaying ) {
        this.updateWaveShape();
      }
    },

    /**
     * Update wave shape.
     * @public
     */
    updateWaveShape: function() {

      if ( this.introModel.laserView === 'wave' ) {
        for ( var k = 0; k < this.incidentWaveLayer.getChildrenCount(); k++ ) {
          this.incidentWaveLayer.children[ k ].step();
        }
      }
    },

    /**
     * @public
     */
    reset: function() {
      this.protractorModel.reset();
      this.protractorNode.reset();
    },

    /**
     * Add light representations which are specific to this view.  In this case it is the wave representation.
     * @private
     */
    addLightNodes: function() {
      BendingLightView.prototype.addLightNodes.call( this );

      var bendingLightModel = this.bendingLightModel;
      var bendingLightView = this;

      this.addChild( this.incidentWaveLayer );

      // if WebGL is supported add WaveWebGLNode otherwise wave is rendered with the canvas.
      if ( bendingLightModel.allowWebGL ) {
        var waveWebGLNode = new WaveWebGLNode( bendingLightView.modelViewTransform,
          bendingLightModel.rays,
          bendingLightView.layoutBounds.width,
          bendingLightView.layoutBounds.height );
        bendingLightView.incidentWaveLayer.addChild( waveWebGLNode );
      }
      else {
        var waveCanvasNode = new WaveCanvasNode( this.bendingLightModel.rays, bendingLightView.modelViewTransform, { canvasBounds: new Bounds2( 0, 0, 1000, 1000 ) } );
        bendingLightView.incidentWaveLayer.addChild( waveCanvasNode );
        this.events.on( 'layoutFinished', function( dx, dy, width, height ) {
            waveCanvasNode.setCanvasBounds( new Bounds2( -dx, -dy, width - dx, height - dy ) );
          }
        );
      }
    }
  } );
} );