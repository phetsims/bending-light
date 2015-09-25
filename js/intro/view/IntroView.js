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
  var Bounds2 = require( 'DOT/Bounds2' );
  var Util = require( 'DOT/Util' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var IntensityMeterNode = require( 'BENDING_LIGHT/common/view/IntensityMeterNode' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var FloatingLayout = require( 'BENDING_LIGHT/common/view/FloatingLayout' );
  var WaveWebGLNode = require( 'BENDING_LIGHT/intro/view/WaveWebGLNode' );
  var WaveCanvasNode = require( 'BENDING_LIGHT/intro/view/WaveCanvasNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var AngleIcon = require( 'BENDING_LIGHT/intro/view/AngleIcon' );
  var TimeControlNode = require( 'BENDING_LIGHT/intro/view/TimeControlNode' );
  var ProtractorDragListener = require( 'BENDING_LIGHT/common/view/ProtractorDragListener' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var reparent = require( 'BENDING_LIGHT/common/view/reparent' );

  // strings
  var materialString = require( 'string!BENDING_LIGHT/material' );
  var anglesString = require( 'string!BENDING_LIGHT/angles' );
  var rayString = require( 'string!BENDING_LIGHT/ray' );
  var waveString = require( 'string!BENDING_LIGHT/wave' );
  var normalString = require( 'string!BENDING_LIGHT/normalLine' );

  // constants
  var INSET = 10;

  /**
   * When the tool is dragged to/from the toolbox it shrinks/grows with animation.
   * @param node
   * @param scale
   * @param centerX
   * @param centerY
   * @returns {*}
   */
  //var animateScale = function( node, scale, centerX, centerY ) {
  //  var parameters = {
  //    scale: node.getScaleVector().x,
  //    centerX: node.centerX,
  //    centerY: node.centerY
  //  }; // initial state, modified as the animation proceeds
  //  return new TWEEN.Tween( parameters )
  //    .easing( TWEEN.Easing.Cubic.InOut )
  //    .to( {
  //      scale: scale,
  //      centerX: centerX,
  //      centerY: centerY
  //    }, 200 )
  //    .onUpdate( function() {
  //      node.setScaleMagnitude( parameters.scale );
  //      node.center = new Vector2( parameters.centerX, parameters.centerY );
  //    } )
  //    .onComplete( function() {
  //    } )
  //    .start();
  //};

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

    // @protected
    this.topMediumControlPanel = topMediumControlPanel;

    this.afterLightLayer3.addChild( topMediumControlPanel );

    // add control panels for setting the index of refraction for each medium
    var bottomMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    var bottomMediumControlPanel = new MediumControlPanel( this, introModel.bottomMediumProperty, materialString, true,
      introModel.wavelengthProperty, IndexOfRefractionDecimals, { yMargin: 7 } );
    bottomMediumControlPanel.setTranslation(
      stageWidth - topMediumControlPanel.getWidth() - 2 * INSET - bottomMediumControlPanelXOffset,
      this.modelViewTransform.modelToViewY( 0 ) + 2 * INSET + 1 );

    // @protected
    this.bottomMediumControlPanel = bottomMediumControlPanel;
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

    var toolBoxHeight = hasMoreTools ? 255 : 143;

    // text for checkboxes
    var normalText = new Text( normalString, { fontSize: 12 } );
    var angleText = new Text( anglesString, { fontSize: 12 } );

    // add normal check box
    var normalIcon = new NormalLine( 17, [ 4, 3 ] );
    var normalCheckBox = new CheckBox( new HBox( {
      children: [
        normalText, normalIcon
      ], spacing: 12
    } ), introModel.showNormalProperty, {
      boxWidth: 15,
      spacing: 5
    } );

    // add angle check box
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
      spacing: 6,
      align: 'left',
      bottom: this.layoutBounds.maxY - 10
    } );
    this.beforeLightLayer2.addChild( checkBoxPanel );

    // @protected - the background for the tools panel
    this.toolbox = new Rectangle( 0, 0, 100, toolBoxHeight, 5, 5, {
      stroke: '#696969', lineWidth: 1.5, fill: '#EEEEEE',
      bottom: checkBoxPanel.top - 15
    } );
    this.beforeLightLayer2.addChild( this.toolbox );

    // create the protractor node
    this.protractorNode = new ProtractorNode( this.modelViewTransform, this.showProtractorProperty, false );

    // Add the input listener, also initializes the position of the tool
    var protractorDragListener = new ProtractorDragListener( this.protractorNode, this.toolbox, this.beforeLightLayer2,
      this.visibleBoundsProperty, true, 0.12, 0.4, function() {

        // Don't include the size/shape/location of children in the bounds of the toolbox or nodes will fall back to the
        // wrong location.
        return new Vector2( introView.toolbox.getSelfBounds().width / 2, introView.toolbox.getSelfBounds().width / 2 );
      }
    );
    protractorDragListener.positionInToolbox();
    protractorDragListener.events.on( 'droppedInToolbox', function( callback ) {callback();} );
    protractorDragListener.events.on( 'draggedOutOfToolbox', function( callback ) {callback();} );

    var resetActions = [];
    this.handleResetActions = function() {
      for ( var i = 0; i < resetActions.length; i++ ) {
        resetActions[ i ]();
      }
    };
    resetActions.push( function() {
      protractorDragListener.reset();
    } );

    this.protractorNode.addInputListener( protractorDragListener );

    this.toolbox.addChild( this.protractorNode );

    var modelViewTransform = this.modelViewTransform;

    // add intensity meter
    this.intensityMeterNode = new IntensityMeterNode( this.modelViewTransform, introModel.intensityMeter );

    // Listener for the intensity meter node and its components
    var protractorNodeBottom = this.protractorNode.bottom;
    var positionBody = function() {
      introView.intensityMeterNode.bodyNode.center = introView.intensityMeterNode.probeNode.center.plusXY( 180, 0 );
      introView.intensityMeterNode.syncModelFromView();
    };
    var positionIntensityMeterNodeInToolbox = function() {
      introView.intensityMeterNode.setScaleMagnitude( 0.2 );
      introModel.intensityMeter.sensorPosition = modelViewTransform.viewToModelPosition( new Vector2() );
      positionBody();
      introView.intensityMeterNode.centerX = introView.toolbox.getSelfBounds().width / 2;
      introView.intensityMeterNode.top = protractorNodeBottom + 15;
      introView.intensityMeterNode.syncModelFromView();
    };
    positionIntensityMeterNodeInToolbox();
    var intensityMeterDraggingTogether = true;

    // When a node is dropped behind a control panel, move it to the side so it won't be lost.
    var bumpLeft = function( node, positionProperty ) {
      while ( node.getGlobalBounds().intersectsBounds( topMediumControlPanel.getGlobalBounds() ) ||
              node.getGlobalBounds().intersectsBounds( bottomMediumControlPanel.getGlobalBounds() ) ) {
        positionProperty.value = positionProperty.value.plusXY( modelViewTransform.viewToModelDeltaX( -20 ), 0 );
      }
    };

    // @protected for subclass usage in MoreToolsView
    this.bumpLeft = bumpLeft;

    /**
     * Create an input listener for the intensity meter probe or body.  When dragging from the toolbox, both items
     * drag together.  When dragged in the play area, each item drags by itself.
     * @param positionProperty
     * @returns {*}
     */
    var createIntensityMeterComponentListener = function( node, positionProperty ) {

      var updatePosition = function( event ) {

        // Same as code below, but we need to add animation, so they will diverge
        var p = modelViewTransform.viewToModelPosition( introView.intensityMeterNode.probeNode.globalToParentPoint( event.pointer.point ) );
        if ( intensityMeterDraggingTogether ) {
          introModel.intensityMeter.sensorPosition = p;
          positionBody();
        }
        else {
          positionProperty.value = p;
        }
      };
      return new SimpleDragHandler( {
        start: function( event ) {
          reparent( introView.intensityMeterNode, introView.beforeLightLayer2 );
          introView.intensityMeterNode.setScaleMagnitude( 1 );
          introView.intensityMeterNode.setTranslation( 0, 0 );
          updatePosition( event );
        },
        drag: function( event ) {
          updatePosition( event ); // TODO: Relative drag
        },
        end: function() {
          if ( introView.intensityMeterNode.bodyNode.getGlobalBounds().intersectsBounds( introView.toolbox.getGlobalBounds() ) ||
               introView.intensityMeterNode.probeNode.getGlobalBounds().intersectsBounds( introView.toolbox.getGlobalBounds() ) ) {
            introView.resetIntensityMeterNode();
          }
          else {
            intensityMeterDraggingTogether = false;
          }

          bumpLeft( introView.intensityMeterNode.probeNode, introModel.intensityMeter.sensorPositionProperty );
          bumpLeft( introView.intensityMeterNode.bodyNode, introModel.intensityMeter.bodyPositionProperty );
        }
      } );
    };
    this.resetIntensityMeterNode = function() {
      reparent( introView.intensityMeterNode, introView.toolbox );
      positionIntensityMeterNodeInToolbox();
      intensityMeterDraggingTogether = true;
    };

    this.intensityMeterNode.probeNode.addInputListener(
      createIntensityMeterComponentListener(
        this.intensityMeterNode.probeNode,
        introModel.intensityMeter.sensorPositionProperty
      )
    );
    this.intensityMeterNode.bodyNode.addInputListener(
      createIntensityMeterComponentListener(
        this.intensityMeterNode.bodyNode,
        introModel.intensityMeter.bodyPositionProperty
      )
    );

    // If the drag bounds changes, make sure the sensor didn't go out of bounds
    //dragBoundsProperty.link( function( dragBounds ) {
    //  var modelBounds = modelViewTransform.viewToModelBounds( dragBounds );
    //  intensityMeter.bodyPosition = modelBounds.getClosestPoint( intensityMeter.bodyPosition.x, intensityMeter.bodyPosition.y );
    //  intensityMeter.sensorPosition = modelBounds.getClosestPoint( intensityMeter.sensorPosition.x, intensityMeter.sensorPosition.y );
    //} );

    this.toolbox.addChild( this.intensityMeterNode );

    // add reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        introModel.reset();
        introView.reset();
        laserControlPanel.reset();
        topMediumControlPanel.reset();
        bottomMediumControlPanel.reset();
        introView.resetIntensityMeterNode();
      },
      bottom: this.layoutBounds.bottom - 14,
      right: this.layoutBounds.right - 2 * INSET,
      radius: 19
    } );

    this.afterLightLayer2.addChild( resetAllButton );

    // add sim speed controls
    this.timeControlNode = new TimeControlNode( introModel, this.updateWaveShape.bind( this ), {
      left: this.toolbox.right + 25,
      bottom: this.layoutBounds.bottom - 15
    } );
    this.beforeLightLayer.addChild( this.timeControlNode );

    if ( !hasMoreTools ) {
      // show play pause and step buttons only in wave view
      introModel.laserViewProperty.link( function( laserType ) {
        introView.timeControlNode.visible = (laserType === 'wave');
      } );
    }

    FloatingLayout.floatRight( this, [ topMediumControlPanel, bottomMediumControlPanel, resetAllButton ] );
    FloatingLayout.floatLeft( this, [ laserControlPanel, this.toolbox, checkBoxPanel ] );

    this.events.on( 'layoutFinished', function() {

      // Position the intensity meter below where the protractor *would* be (if it too were in the control panel)
      //if ( !introView.bendingLightModel.intensityMeter.enabled ) {
      //  introView.moveIntensityMeterToToolbox();
      //}
    } );
  }

  return inherit( BendingLightView, IntroView, {

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
      this.handleResetActions();
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
          bendingLightModel.rays );
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