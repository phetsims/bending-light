// Copyright 2015-2020, University of Colorado Boulder

/**
 * View for intro screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Rectangle2 from '../../../../dot/js/Rectangle.js'; // eslint-disable-line require-statement-match
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MovableDragHandler from '../../../../scenery-phet/js/input/MovableDragHandler.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import bendingLightStrings from '../../bending-light-strings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import BendingLightView from '../../common/view/BendingLightView.js';
import FloatingLayout from '../../common/view/FloatingLayout.js';
import IntensityMeterNode from '../../common/view/IntensityMeterNode.js';
import MediumControlPanel from '../../common/view/MediumControlPanel.js';
import MediumNode from '../../common/view/MediumNode.js';
import ProtractorNode from '../../common/view/ProtractorNode.js';
import ToolIconListener from '../../common/view/ToolIconListener.js';
import AngleIcon from './AngleIcon.js';
import AngleNode from './AngleNode.js';
import NormalLine from './NormalLine.js';
import TimeControlNode from './TimeControlNode.js';
import WaveCanvasNode from './WaveCanvasNode.js';
import WaveWebGLNode from './WaveWebGLNode.js';

const anglesString = bendingLightStrings.angles;
const materialString = bendingLightStrings.material;
const normalLineString = bendingLightStrings.normalLine;

// constants
const INSET = 10;

class IntroView extends BendingLightView {

  /**
   * @param {IntroModel} introModel - model of intro screen
   * @param {boolean} hasMoreTools - whether contain more tools
   * @param {number} indexOfRefractionDecimals - decimalPlaces to show for index of refraction
   * @param {function} createLaserControlPanel
   * @param {Object} [options]
   */
  constructor( introModel, hasMoreTools, indexOfRefractionDecimals, createLaserControlPanel, options ) {

    options = merge( {

      // in the Intro screen, it is shifted 102 to the left since there is extra room above the protractor toolbox
      // for the laser to traverse to.
      horizontalPlayAreaOffset: 102,

      /**
       * Specify how the drag angle should be clamped, in this case the laser must remain in the top left quadrant
       * @param {number} angle
       * @returns {number}
       */
      clampDragAngle: angle => {
        while ( angle < 0 ) { angle += Math.PI * 2; }
        return Utils.clamp( angle, Math.PI / 2, Math.PI );
      },
      /**
       * Indicate if the laser is not at its max angle, and therefore can be dragged to larger angles
       * @param {number} laserAngle
       * @returns {boolean}
       */
      clockwiseArrowNotAtMax: laserAngle => {
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
      ccwArrowNotAtMax: laserAngle => laserAngle > Math.PI / 2
    }, options );

    super(
      introModel,

      // laserTranslationRegion - The Protractor shouldn't be rotatable in this screen
      () => Shape.rect( 0, 0, 0, 0 ),

      // laserRotationRegion - In this screen, clicking anywhere on the laser (i.e. on its 'full' bounds)
      // translates it, so always return the 'full' region.
      full => full,

      // laserHasKnob
      false,
      options
    );

    this.introModel = introModel; // @public (read-only)

    const stageWidth = this.layoutBounds.width;
    const stageHeight = this.layoutBounds.height;

    // add MediumNodes for top and bottom
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.topMediumProperty ) );
    this.mediumNode.addChild( new MediumNode( this.modelViewTransform, introModel.bottomMediumProperty ) );

    // add control panels for setting the index of refraction for each medium
    const topMediumControlPanel = new MediumControlPanel( this, introModel.mediumColorFactory,
      introModel.topMediumProperty, materialString, true, introModel.wavelengthProperty, indexOfRefractionDecimals, {
        yMargin: 7
      } );
    const topMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    topMediumControlPanel.setTranslation(
      stageWidth - topMediumControlPanel.getWidth() - 2 * INSET - topMediumControlPanelXOffset,
      this.modelViewTransform.modelToViewY( 0 ) - 2 * INSET - topMediumControlPanel.getHeight() + 4 );

    // @protected
    this.topMediumControlPanel = topMediumControlPanel;

    this.afterLightLayer3.addChild( topMediumControlPanel );

    // add control panels for setting the index of refraction for each medium
    const bottomMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    const bottomMediumControlPanel = new MediumControlPanel( this, introModel.mediumColorFactory,
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
    const normalLineHeight = stageHeight / 2;
    const normalLine = new NormalLine( normalLineHeight, [ 7, 6 ], {
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
      stepCallback => this.on( 'step', stepCallback )
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
    ], () => {
      for ( let k = 0; k < this.incidentWaveLayer.getChildrenCount(); k++ ) {
        this.incidentWaveLayer.children[ k ].step();
      }
      this.incidentWaveLayer.setVisible( introModel.laser.onProperty.value && introModel.laserViewProperty.value === 'wave' );
    } );

    // add laser view panel
    const laserViewXOffset = hasMoreTools ? 13 : 12;
    const laserViewYOffset = hasMoreTools ? 2 * INSET - 4 : 2 * INSET;

    const laserControlPanel = new Panel( createLaserControlPanel( introModel ), {
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
    const normalText = new Text( normalLineString, { fontSize: 12 } );
    const angleText = new Text( anglesString, { fontSize: 12 } );

    // add normal checkbox
    const normalIcon = new NormalLine( 17, [ 4, 3 ] );
    const normalCheckbox = new Checkbox( new HBox( {
      children: [
        normalText, normalIcon
      ], spacing: 12
    } ), introModel.showNormalProperty, {
      boxWidth: 15,
      spacing: 5
    } );

    // add angle checkbox
    const angleIcon = new AngleIcon();
    const angleCheckbox = new Checkbox( new HBox( {
      children: [
        angleText, angleIcon
      ], spacing: 12
    } ), introModel.showAnglesProperty, {
      boxWidth: 15,
      spacing: 5
    } );

    const checkboxPanelChildren = hasMoreTools ? [ normalCheckbox, angleCheckbox ] : [ normalCheckbox ];
    const checkboxPanel = new VBox( {
      children: checkboxPanelChildren,
      spacing: 6,
      align: 'left',
      bottom: this.layoutBounds.maxY - 10
    } );
    this.beforeLightLayer2.addChild( checkboxPanel );

    // create the protractor node
    const protractorNodeIcon = new ProtractorNode( this.showProtractorProperty, false, {
      scale: 0.24
    } );
    protractorNodeIcon.mouseArea = Shape.bounds( protractorNodeIcon.localBounds );
    protractorNodeIcon.touchArea = Shape.bounds( protractorNodeIcon.localBounds );
    this.showProtractorProperty.link( showProtractor => {
      protractorNodeIcon.visible = !showProtractor;
    } );

    const protractorNode = new ProtractorNode( this.showProtractorProperty, false, {
      scale: 0.8
    } );
    const protractorPosition = new Vector2( protractorNode.centerX, protractorNode.centerY );
    const protractorPositionProperty = new Property( protractorPosition );

    // When a node is released, check if it is over the toolbox.  If so, drop it in.
    const dropInToolbox = ( node, enabledProperty ) => {
      if ( node.getGlobalBounds().intersectsBounds( this.toolbox.getGlobalBounds() ) ) {
        enabledProperty.value = false;
      }
    };
    this.dropInToolbox = dropInToolbox;
    const protractorNodeListener = new MovableDragHandler( protractorPositionProperty, {
      endDrag: () => dropInToolbox( protractorNode, this.showProtractorProperty )
    } );

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the MovableDragHander
    // for the node in the play area
    protractorNodeIcon.addInputListener( new ToolIconListener( [ protractorNodeListener ], event => {
      // Show the protractor in the play area and hide the icon
      this.showProtractorProperty.value = true;

      // Center the protractor on the pointer
      protractorPositionProperty.value = protractorNode.globalToParentPoint( event.pointer.point );
    } ) );

    this.showProtractorProperty.linkAttribute( protractorNode, 'visible' );

    const modelViewTransform = this.modelViewTransform;

    // When a node is dropped behind a control panel, move it to the side so it won't be lost.
    const bumpLeft = ( node, positionProperty ) => {
      while ( node.getGlobalBounds().intersectsBounds( topMediumControlPanel.getGlobalBounds() ) ||
              node.getGlobalBounds().intersectsBounds( bottomMediumControlPanel.getGlobalBounds() ) ) {
        positionProperty.value = positionProperty.value.plusXY( modelViewTransform.viewToModelDeltaX( -20 ), 0 );
      }
    };

    protractorPositionProperty.link( protractorPosition => {
      protractorNode.center = protractorPosition;
    } );

    protractorNode.addInputListener( protractorNodeListener );

    // add intensity meter
    const intensityMeterNodeIcon = new IntensityMeterNode( this.modelViewTransform, introModel.intensityMeter.copy(), {
      scale: 0.45,
      cursor: 'pointer'
    } );
    intensityMeterNodeIcon.mouseArea = Shape.bounds( intensityMeterNodeIcon.localBounds );
    intensityMeterNodeIcon.touchArea = Shape.bounds( intensityMeterNodeIcon.localBounds );

    const intensityMeterNode = new IntensityMeterNode( this.modelViewTransform, introModel.intensityMeter );
    introModel.intensityMeter.enabledProperty.link( enabled => {
      intensityMeterNode.visible = enabled;
      intensityMeterNodeIcon.visible = !enabled;
    } );
    const probeListener = new MovableDragHandler( introModel.intensityMeter.sensorPositionProperty, {
      modelViewTransform: modelViewTransform,
      endDrag: () => {
        bumpLeft( intensityMeterNode.probeNode, introModel.intensityMeter.sensorPositionProperty );
        dropInToolbox( intensityMeterNode.probeNode, introModel.intensityMeter.enabledProperty );
      }
    } );
    intensityMeterNode.probeNode.addInputListener( probeListener );
    const bodyListener = new MovableDragHandler( introModel.intensityMeter.bodyPositionProperty, {
      modelViewTransform: modelViewTransform,
      endDrag: () => {
        bumpLeft( intensityMeterNode.bodyNode, introModel.intensityMeter.bodyPositionProperty );
        dropInToolbox( intensityMeterNode.bodyNode, introModel.intensityMeter.enabledProperty );
      }
    } );
    intensityMeterNode.bodyNode.addInputListener( bodyListener );

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the MovableDragHandler
    // for the node in the play area
    intensityMeterNodeIcon.addInputListener( new ToolIconListener( [ bodyListener, probeListener ], event => {

      // Show the probe in the play area and hide the icon
      introModel.intensityMeter.enabledProperty.value = true;

      // Center the center-bottom of the body on the pointer
      const bodyViewPosition = intensityMeterNode.bodyNode.globalToParentPoint( event.pointer.point )
        .plusXY( -intensityMeterNode.bodyNode.width / 2, -intensityMeterNode.bodyNode.height + 5 );
      introModel.intensityMeter.bodyPositionProperty.value = modelViewTransform.viewToModelPosition( bodyViewPosition );
      intensityMeterNode.resetRelativePositions();
      intensityMeterNode.syncModelFromView();
    } ) );

    // @protected for subclass usage in MoreToolsView
    this.bumpLeft = bumpLeft;

    let toolboxNodes = [
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
    const resetAllButton = new ResetAllButton( {
      listener: () => this.reset(),
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
      introModel.laserViewProperty.link( laserType => this.timeControlNode.setVisible( laserType === 'wave' ) );
    }

    FloatingLayout.floatRight( this, [ topMediumControlPanel, bottomMediumControlPanel, resetAllButton ] );
    FloatingLayout.floatLeft( this, [ laserControlPanel, this.toolbox ] );

    // Indent the checkboxes a bit so it looks more natural
    FloatingLayout.floatLeft( this, [ checkboxPanel ], 10 );

    FloatingLayout.floatTop( this, [ laserControlPanel ] );
    FloatingLayout.floatBottom( this, [ checkboxPanel, resetAllButton, this.timeControlNode ] );

    this.visibleBoundsProperty.link( () => {
      this.toolbox.bottom = checkboxPanel.top - 10;
    } );

    this.visibleBoundsProperty.link( function( visibleBounds ) {

      protractorNodeListener.setDragBounds( visibleBounds );
      probeListener.setDragBounds( modelViewTransform.viewToModelBounds( visibleBounds ) );

      // The body node origin is at its top left, so translate the allowed drag area so that the center of the body node
      // will remain in bounds
      const viewDragBounds = new Rectangle2(
        visibleBounds.left - intensityMeterNode.bodyNode.bounds.width / 2,
        visibleBounds.top - intensityMeterNode.bodyNode.bounds.height / 2,
        visibleBounds.width,
        visibleBounds.height
      );
      const dragBounds = modelViewTransform.viewToModelBounds( viewDragBounds );
      bodyListener.setDragBounds( dragBounds );
    } );
  }

  /**
   * @public - restore initial conditions
   */
  reset() {
    super.reset();
    this.introModel.reset();
    this.topMediumControlPanel.reset();
    this.bottomMediumControlPanel.reset();
  }

  /**
   * Allow subclasses to provide more tools
   * @returns {Node[]}
   * @protected
   */
  getAdditionalToolIcons() {
    return [];
  }

  /**
   * Called by the animation loop.
   * @protected
   */
  step() {
    this.trigger0( 'step' );
    super.step();
    if ( this.introModel.isPlayingProperty.value ) {
      this.updateWaveShape();
    }
  }

  /**
   * Update wave shape.
   * @public
   */
  updateWaveShape() {
    if ( this.introModel.laserViewProperty.value === 'wave' ) {
      for ( let k = 0; k < this.incidentWaveLayer.getChildrenCount(); k++ ) {
        this.incidentWaveLayer.children[ k ].step();
      }
    }
  }

  /**
   * Add light representations which are specific to this view.  In this case it is the wave representation.
   * @param {BendingLightModel} bendingLightModel
   * @private
   */
  addLightNodes( bendingLightModel ) {
    super.addLightNodes( bendingLightModel );

    this.addChild( this.incidentWaveLayer );

    // if WebGL is supported add WaveWebGLNode otherwise wave is rendered with the canvas.
    if ( bendingLightModel.allowWebGL ) {
      const waveWebGLNode = new WaveWebGLNode( this.modelViewTransform, bendingLightModel.rays );
      this.incidentWaveLayer.addChild( waveWebGLNode );
    }
    else {
      const waveCanvasNode = new WaveCanvasNode( this.bendingLightModel.rays, this.modelViewTransform, {
        canvasBounds: new Bounds2( 0, 0, 1000, 1000 )
      } );
      this.incidentWaveLayer.addChild( waveCanvasNode );
      this.visibleBoundsProperty.link( visibleBounds => {
        waveCanvasNode.setCanvasBounds( visibleBounds );
      } );
    }
  }
}

bendingLight.register( 'IntroView', IntroView );

export default IntroView;