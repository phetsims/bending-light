// Copyright 2015-2018, University of Colorado Boulder

/**
 * View for intro screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AngleIcon = require( 'BENDING_LIGHT/intro/view/AngleIcon' );
  var AngleNode = require( 'BENDING_LIGHT/intro/view/AngleNode' );
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var BendingLightView = require( 'BENDING_LIGHT/common/view/BendingLightView' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Checkbox = require( 'SUN/Checkbox' );
  var FloatingLayout = require( 'BENDING_LIGHT/common/view/FloatingLayout' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntensityMeterNode = require( 'BENDING_LIGHT/common/view/IntensityMeterNode' );
  var MediumControlPanel = require( 'BENDING_LIGHT/common/view/MediumControlPanel' );
  var MediumNode = require( 'BENDING_LIGHT/common/view/MediumNode' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var NormalLine = require( 'BENDING_LIGHT/intro/view/NormalLine' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var Rectangle2 = require( 'DOT/Rectangle' );// eslint-disable-line require-statement-match
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TimeControlNode = require( 'BENDING_LIGHT/intro/view/TimeControlNode' );
  var ToolIconListener = require( 'BENDING_LIGHT/common/view/ToolIconListener' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var WaveCanvasNode = require( 'BENDING_LIGHT/intro/view/WaveCanvasNode' );
  var WaveWebGLNode = require( 'BENDING_LIGHT/intro/view/WaveWebGLNode' );

  // strings
  var anglesString = require( 'string!BENDING_LIGHT/angles' );
  var materialString = require( 'string!BENDING_LIGHT/material' );
  var normalLineString = require( 'string!BENDING_LIGHT/normalLine' );

  // constants
  var INSET = 10;

  /**
   * @param {IntroModel} introModel - model of intro screen
   * @param {boolean} hasMoreTools - whether contain more tools
   * @param {number} indexOfRefractionDecimals - decimalPlaces to show for index of refraction
   * @param {function} createLaserControlPanel
   * @param {Object} [options]
   * @constructor
   */
  function IntroView( introModel, hasMoreTools, indexOfRefractionDecimals, createLaserControlPanel, options ) {

    options = _.extend( {

      // in the Intro screen, it is shifted 102 to the left since there is extra room above the protractor toolbox
      // for the laser to traverse to.
      horizontalPlayAreaOffset: 102,

      /**
       * Specify how the drag angle should be clamped, in this case the laser must remain in the top left quadrant
       * @param {number} angle
       * @returns {number}
       */
      clampDragAngle: function( angle ) {
        while ( angle < 0 ) { angle += Math.PI * 2; }
        return Util.clamp( angle, Math.PI / 2, Math.PI );
      },
      /**
       * Indicate if the laser is not at its max angle, and therefore can be dragged to larger angles
       * @param {number} laserAngle
       * @returns {boolean}
       */
      clockwiseArrowNotAtMax: function( laserAngle ) {
        if ( introModel.laserViewProperty.value === 'ray' ) {
          return laserAngle < Math.PI;
        }
        else {
          return laserAngle < BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
        }
      },
      /**
       * indicate if the laser is not at its min angle, and can therefore be dragged to smaller angles.
       * @param {number} laserAngle
       * @returns {boolean}
       */
      ccwArrowNotAtMax: function( laserAngle ) {
        return laserAngle > Math.PI / 2;
      }
    }, options );
    var self = this;
    this.introModel = introModel; // @public (read-only)

    BendingLightView.call( this,
      introModel,

      // laserTranslationRegion - The Protractor shouldn't be rotatable in this screen
      function() { return Shape.rect( 0, 0, 0, 0 ); },

      // laserRotationRegion - In this screen, clicking anywhere on the laser (i.e. on its 'full' bounds)
      // translates it, so always return the 'full' region.
      function( full ) { return full; },

      // laserHasKnob
      false,
      options
    );

    var stageWidth = this.layoutBounds.width;
    var stageHeight = this.layoutBounds.height;

    // add MediumNodes for top and bottom
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.topMediumProperty ) );
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.bottomMediumProperty ) );

    // add control panels for setting the index of refraction for each medium
    var topMediumControlPanel = new MediumControlPanel( this, introModel.mediumColorFactory,
      introModel.topMediumProperty, materialString, true, introModel.wavelengthProperty, indexOfRefractionDecimals, {
        yMargin: 7
      } );
    var topMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    topMediumControlPanel.setTranslation(
      stageWidth - topMediumControlPanel.getWidth() - 2 * INSET - topMediumControlPanelXOffset,
      this.modelViewTransform.modelToViewY( 0 ) - 2 * INSET - topMediumControlPanel.getHeight() + 4 );

    // @protected
    this.topMediumControlPanel = topMediumControlPanel;

    this.afterLightLayer3.addChild( topMediumControlPanel );

    // add control panels for setting the index of refraction for each medium
    var bottomMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    var bottomMediumControlPanel = new MediumControlPanel( this, introModel.mediumColorFactory,
      introModel.bottomMediumProperty, materialString, true, introModel.wavelengthProperty, indexOfRefractionDecimals, {
        yMargin: 7
      } );
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
        self.on( 'step', stepCallback );
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
      for ( var k = 0; k < self.incidentWaveLayer.getChildrenCount(); k++ ) {
        self.incidentWaveLayer.children[ k ].step();
      }
      self.incidentWaveLayer.setVisible( introModel.laser.onProperty.value && introModel.laserViewProperty.value === 'wave' );
    } );

    // add laser view panel
    var laserViewXOffset = hasMoreTools ? 13 : 12;
    var laserViewYOffset = hasMoreTools ? 2 * INSET - 4 : 2 * INSET;

    var laserControlPanel = new Panel( createLaserControlPanel( introModel ), {
      cornerRadius: 5,
      xMargin: 9,
      yMargin: 6,
      fill: '#EEEEEE',
      stroke: '#696969',
      lineWidth: 1.5,
      left: this.layoutBounds.minX + laserViewXOffset,
      top: this.layoutBounds.top + laserViewYOffset
    } );
    this.laserViewLayer.addChild( laserControlPanel );

    // text for checkboxes
    var normalText = new Text( normalLineString, { fontSize: 12 } );
    var angleText = new Text( anglesString, { fontSize: 12 } );

    // add normal checkbox
    var normalIcon = new NormalLine( 17, [ 4, 3 ] );
    var normalCheckbox = new Checkbox( new HBox( {
      children: [
        normalText, normalIcon
      ], spacing: 12
    } ), introModel.showNormalProperty, {
      boxWidth: 15,
      spacing: 5
    } );

    // add angle checkbox
    var angleIcon = new AngleIcon();
    var angleCheckbox = new Checkbox( new HBox( {
      children: [
        angleText, angleIcon
      ], spacing: 12
    } ), introModel.showAnglesProperty, {
      boxWidth: 15,
      spacing: 5
    } );

    var checkboxPanelChildren = hasMoreTools ? [ normalCheckbox, angleCheckbox ] : [ normalCheckbox ];
    var checkboxPanel = new VBox( {
      children: checkboxPanelChildren,
      spacing: 6,
      align: 'left',
      bottom: this.layoutBounds.maxY - 10
    } );
    this.beforeLightLayer2.addChild( checkboxPanel );

    // create the protractor node
    var protractorNodeIcon = new ProtractorNode( this.showProtractorProperty, false, {
      scale: 0.24
    } );
    protractorNodeIcon.mouseArea = Shape.bounds( protractorNodeIcon.localBounds );
    protractorNodeIcon.touchArea = Shape.bounds( protractorNodeIcon.localBounds );
    this.showProtractorProperty.link( function( showProtractor ) {
      protractorNodeIcon.visible = !showProtractor;
    } );

    var protractorNode = new ProtractorNode( this.showProtractorProperty, false, {
      scale: 0.8
    } );
    var protractorLocation = new Vector2( protractorNode.centerX, protractorNode.centerY );
    var protractorLocationProperty = new Property( protractorLocation );

    // When a node is released, check if it is over the toolbox.  If so, drop it in.
    var dropInToolbox = function( node, enabledProperty ) {
      if ( node.getGlobalBounds().intersectsBounds( self.toolbox.getGlobalBounds() ) ) {
        enabledProperty.value = false;
      }
    };
    this.dropInToolbox = dropInToolbox;
    var protractorNodeListener = new MovableDragHandler( protractorLocationProperty, {
      endDrag: function() {
        dropInToolbox( protractorNode, self.showProtractorProperty );
      }
    } );

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the MovableDragHander
    // for the node in the play area
    protractorNodeIcon.addInputListener( new ToolIconListener( [ protractorNodeListener ], function( event ) {
      // Show the protractor in the play area and hide the icon
      self.showProtractorProperty.value = true;

      // Center the protractor on the pointer
      protractorLocationProperty.value = protractorNode.globalToParentPoint( event.pointer.point );
    } ) );

    self.showProtractorProperty.linkAttribute( protractorNode, 'visible' );

    var modelViewTransform = this.modelViewTransform;

    // When a node is dropped behind a control panel, move it to the side so it won't be lost.
    var bumpLeft = function( node, positionProperty ) {
      while ( node.getGlobalBounds().intersectsBounds( topMediumControlPanel.getGlobalBounds() ) ||
              node.getGlobalBounds().intersectsBounds( bottomMediumControlPanel.getGlobalBounds() ) ) {
        positionProperty.value = positionProperty.value.plusXY( modelViewTransform.viewToModelDeltaX( -20 ), 0 );
      }
    };

    protractorLocationProperty.link( function( protractorLocation ) {
      protractorNode.center = protractorLocation;
    } );

    protractorNode.addInputListener( protractorNodeListener );

    // add intensity meter
    var intensityMeterNodeIcon = new IntensityMeterNode( this.modelViewTransform, introModel.intensityMeter.copy(), {
      scale: 0.45,
      cursor: 'pointer'
    } );
    intensityMeterNodeIcon.mouseArea = Shape.bounds( intensityMeterNodeIcon.localBounds );
    intensityMeterNodeIcon.touchArea = Shape.bounds( intensityMeterNodeIcon.localBounds );

    var intensityMeterNode = new IntensityMeterNode( this.modelViewTransform, introModel.intensityMeter );
    introModel.intensityMeter.enabledProperty.link( function( enabled ) {
      intensityMeterNode.visible = enabled;
      intensityMeterNodeIcon.visible = !enabled;
    } );
    var probeListener = new MovableDragHandler( introModel.intensityMeter.sensorPositionProperty, {
      modelViewTransform: modelViewTransform,
      endDrag: function() {
        bumpLeft( intensityMeterNode.probeNode, introModel.intensityMeter.sensorPositionProperty );
        dropInToolbox( intensityMeterNode.probeNode, introModel.intensityMeter.enabledProperty );
      }
    } );
    intensityMeterNode.probeNode.addInputListener( probeListener );
    var bodyListener = new MovableDragHandler( introModel.intensityMeter.bodyPositionProperty, {
      modelViewTransform: modelViewTransform,
      endDrag: function() {
        bumpLeft( intensityMeterNode.bodyNode, introModel.intensityMeter.bodyPositionProperty );
        dropInToolbox( intensityMeterNode.bodyNode, introModel.intensityMeter.enabledProperty );
      }
    } );
    intensityMeterNode.bodyNode.addInputListener( bodyListener );

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the MovableDragHander
    // for the node in the play area
    intensityMeterNodeIcon.addInputListener( new ToolIconListener( [ bodyListener, probeListener ], function( event ) {

      // Show the probe in the play area and hide the icon
      introModel.intensityMeter.enabledProperty.value = true;

      // Center the center-bottom of the body on the pointer
      var bodyViewPosition = intensityMeterNode.bodyNode.globalToParentPoint( event.pointer.point )
        .plusXY( -intensityMeterNode.bodyNode.width / 2, -intensityMeterNode.bodyNode.height + 5 );
      introModel.intensityMeter.bodyPositionProperty.value = modelViewTransform.viewToModelPosition( bodyViewPosition );
      intensityMeterNode.resetRelativeLocations();
      intensityMeterNode.syncModelFromView();
    } ) );

    // @protected for subclass usage in MoreToolsView
    this.bumpLeft = bumpLeft;

    var toolboxNodes = [
      protractorNodeIcon,
      intensityMeterNodeIcon
    ];

    toolboxNodes = toolboxNodes.concat( this.getAdditionalToolIcons() );
    this.toolbox = new Panel( new VBox( {
      spacing: 10,
      children: toolboxNodes
    } ), {
      xMargin: 10,
      yMargin: 10,
      stroke: '#696969',
      lineWidth: 1.5, fill: '#EEEEEE',
      bottom: checkboxPanel.top - 15
    } );
    this.beforeLightLayer2.addChild( this.toolbox );
    this.beforeLightLayer2.addChild( protractorNode );
    this.beforeLightLayer2.addChild( intensityMeterNode );

    // add reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        self.reset();
      },
      bottom: this.layoutBounds.bottom - 14,
      right: this.layoutBounds.right - 2 * INSET,
      radius: 19
    } );

    this.afterLightLayer2.addChild( resetAllButton );

    // add sim speed controls
    this.timeControlNode = new TimeControlNode( introModel, this.updateWaveShape.bind( this ), {
      left: checkboxPanel.right + 75,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.beforeLightLayer.addChild( this.timeControlNode );

    if ( !hasMoreTools ) {

      // show play pause and step buttons only in wave view
      introModel.laserViewProperty.link( function( laserType ) {
        self.timeControlNode.visible = (laserType === 'wave');
      } );
    }

    FloatingLayout.floatRight( this, [ topMediumControlPanel, bottomMediumControlPanel, resetAllButton ] );
    FloatingLayout.floatLeft( this, [ laserControlPanel, this.toolbox ] );

    // Indent the checkboxes a bit so it looks more natural
    FloatingLayout.floatLeft( this, [ checkboxPanel ], 10 );

    FloatingLayout.floatTop( this, [ laserControlPanel ] );
    FloatingLayout.floatBottom( this, [ checkboxPanel, resetAllButton, this.timeControlNode ] );

    this.visibleBoundsProperty.link( function() {
      self.toolbox.bottom = checkboxPanel.top - 10;
    } );

    this.visibleBoundsProperty.link( function( visibleBounds ) {

      protractorNodeListener.setDragBounds( visibleBounds );
      probeListener.setDragBounds( modelViewTransform.viewToModelBounds( visibleBounds ) );

      // The body node origin is at its top left, so translate the allowed drag area so that the center of the body node
      // will remain in bounds
      var viewDragBounds = new Rectangle2(
        visibleBounds.left - intensityMeterNode.bodyNode.bounds.width / 2,
        visibleBounds.top - intensityMeterNode.bodyNode.bounds.height / 2,
        visibleBounds.width,
        visibleBounds.height
      );
      var dragBounds = modelViewTransform.viewToModelBounds( viewDragBounds );
      bodyListener.setDragBounds( dragBounds );
    } );
  }

  bendingLight.register( 'IntroView', IntroView );
  
  return inherit( BendingLightView, IntroView, {

    reset: function() {
      BendingLightView.prototype.reset.call( this );
      this.introModel.reset();
      this.topMediumControlPanel.reset();
      this.bottomMediumControlPanel.reset();
    },

    // Allow subclasses to provide more tools
    getAdditionalToolIcons: function() {
      return [];
    },
    /**
     * Called by the animation loop.
     * @protected
     */
    step: function() {
      this.trigger0( 'step' );
      BendingLightView.prototype.step.call( this );
      if ( this.introModel.isPlayingProperty.value ) {
        this.updateWaveShape();
      }
    },

    /**
     * Update wave shape.
     * @public
     */
    updateWaveShape: function() {

      if ( this.introModel.laserViewProperty.value === 'wave' ) {
        for ( var k = 0; k < this.incidentWaveLayer.getChildrenCount(); k++ ) {
          this.incidentWaveLayer.children[ k ].step();
        }
      }
    },

    /**
     * Add light representations which are specific to this view.  In this case it is the wave representation.
     * @private
     */
    addLightNodes: function() {
      BendingLightView.prototype.addLightNodes.call( this );

      var bendingLightModel = this.bendingLightModel;
      var self = this;

      this.addChild( this.incidentWaveLayer );

      // if WebGL is supported add WaveWebGLNode otherwise wave is rendered with the canvas.
      if ( bendingLightModel.allowWebGL ) {
        var waveWebGLNode = new WaveWebGLNode( self.modelViewTransform,
          bendingLightModel.rays );
        self.incidentWaveLayer.addChild( waveWebGLNode );
      }
      else {
        var waveCanvasNode = new WaveCanvasNode( this.bendingLightModel.rays, self.modelViewTransform, {
          canvasBounds: new Bounds2( 0, 0, 1000, 1000 )
        } );
        self.incidentWaveLayer.addChild( waveCanvasNode );
        this.visibleBoundsProperty.link( function( visibleBounds ) {
          waveCanvasNode.setCanvasBounds( visibleBounds );
        } );
      }
    }
  } );
} );