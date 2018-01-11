// Copyright 2015-2017, University of Colorado Boulder

/**
 * View for the "Prisms" Screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var BendingLightView = require( 'BENDING_LIGHT/common/view/BendingLightView' );
  var FloatingLayout = require( 'BENDING_LIGHT/common/view/FloatingLayout' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntersectionNode = require( 'BENDING_LIGHT/prisms/view/IntersectionNode' );
  var LaserTypeRadioButtonGroup = require( 'BENDING_LIGHT/prisms/view/LaserTypeRadioButtonGroup' );
  var MediumControlPanel = require( 'BENDING_LIGHT/common/view/MediumControlPanel' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PrismToolboxNode = require( 'BENDING_LIGHT/prisms/view/PrismToolboxNode' );
  var Property = require( 'AXON/Property' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var TranslationDragHandle = require( 'BENDING_LIGHT/common/view/TranslationDragHandle' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var WavelengthControl = require( 'BENDING_LIGHT/common/view/WavelengthControl' );
  var WhiteLightCanvasNode = require( 'BENDING_LIGHT/prisms/view/WhiteLightCanvasNode' );

  // constants
  var INSET = 10;

  // strings
  var environmentString = require( 'string!BENDING_LIGHT/environment' );

  /**
   * @param {PrismsModel} prismsModel - model of prisms screen
   * @constructor
   */
  function PrismsView( prismsModel ) {

    this.prismLayer = new Node( { layerSplit: true } );
    this.prismsModel = prismsModel;
    var self = this;

    BendingLightView.call( this,

      prismsModel,

      // laserTranslationRegion - The protractor can be rotated by dragging it by its ring, translated by dragging the cross-bar
      function( fullShape ) { return fullShape; },

      // laserRotationRegion - Rotation if the user clicks top on the object
      function( full, back ) { return back; },

      // laserHasKnob
      true,

      {
        // center the play area horizontally in the space between the left side of the screen and the control panels on
        // the right, and move the laser to the left.
        horizontalPlayAreaOffset: 240,

        // Center the play area vertically above the south control panel
        verticalPlayAreaOffset: -43,

        // if the prism is dropped behind a control panel, bump it to the left.
        occlusionHandler: function( node ) {

          var controlPanels = [
            laserControlPanel, // eslint-disable-line no-use-before-define
            laserTypeRadioButtonGroup, // eslint-disable-line no-use-before-define
            environmentMediumControlPanel // eslint-disable-line no-use-before-define
          ];
          controlPanels.forEach( function( controlPanel ) {
            if ( controlPanel.globalBounds.containsPoint( node.globalBounds.center ) ) {
              node.translateViewXY( node.globalToParentBounds( controlPanel.globalBounds ).minX - node.centerX, 0 );
            }
          } );
        }
      }
    );

    // Node for the environment that spans the screen (only for monochromatic light, the white light background
    // is rendered as opaque in the white light node for blending purposes)
    var environmentMediumNodeForMonochromaticLight = new Rectangle( 0, 0, 0, 0 );
    prismsModel.environmentMediumProperty.link( function( environmentMedium ) {

      // This medium node only shows the color for monochromatic light
      var indexOfRefractionForRed = environmentMedium.substance.dispersionFunction.getIndexOfRefractionForRed();
      var color = prismsModel.mediumColorFactory.getColorAgainstWhite( indexOfRefractionForRed );
      environmentMediumNodeForMonochromaticLight.fill = color;
    } );

    // Put it behind everything else
    this.insertChild( 0, environmentMediumNodeForMonochromaticLight );

    var indexOfRefractionDecimals = 2;

    // Add control panels for setting the index of refraction for each medium
    var environmentMediumControlPanel = new MediumControlPanel( this, prismsModel.mediumColorFactory, prismsModel.environmentMediumProperty,
      environmentString, false, prismsModel.wavelengthProperty,
      indexOfRefractionDecimals, {
        yMargin: 6,
        comboBoxListPosition: 'below'
      } );
    environmentMediumControlPanel.setTranslation(
      this.layoutBounds.right - 2 * INSET - environmentMediumControlPanel.width, this.layoutBounds.top + 15 );
    this.afterLightLayer2.addChild( environmentMediumControlPanel );

    var sliderEnabledProperty = new Property();

    var radioButtonAdapterProperty = new Property( 'singleColor' );
    radioButtonAdapterProperty.link( function( radioButtonAdapterValue ) {
      prismsModel.laser.colorModeProperty.value = radioButtonAdapterValue === 'white' ? 'white' :
                                                  'singleColor';
      prismsModel.manyRaysProperty.value = radioButtonAdapterValue === 'singleColor5x' ? 5 : 1;
      sliderEnabledProperty.value = radioButtonAdapterValue !== 'white';
    } );

    var laserTypeRadioButtonGroup = new LaserTypeRadioButtonGroup( radioButtonAdapterProperty );
    this.afterLightLayer2.addChild( laserTypeRadioButtonGroup );

    var laserControlPanel = new Panel( new VBox( {
      spacing: 10,
      children: [
        new WavelengthControl( prismsModel.wavelengthProperty, sliderEnabledProperty, 146 ) ]
    } ), {
      cornerRadius: 5,
      xMargin: 10,
      yMargin: 6,
      fill: '#EEEEEE',
      stroke: '#696969',
      lineWidth: 1.5
    } );

    this.afterLightLayer2.addChild( laserControlPanel );
    this.incidentWaveLayer.setVisible( false );

    // Optionally show the normal lines at each intersection
    prismsModel.intersections.addItemAddedListener( function( addedIntersection ) {
      if ( prismsModel.showNormalsProperty.value ) {
        var node = new IntersectionNode(
          self.modelViewTransform,
          addedIntersection,
          prismsModel.intersectionStrokeProperty
        );
        self.addChild( node );

        prismsModel.intersections.addItemRemovedListener( function( removedIntersection ) {
          if ( removedIntersection === addedIntersection ) {
            node.dispose();
            self.removeChild( node );
          }
        } );
      }
    } );

    // Add prisms toolbox Node
    var prismToolboxNode = new PrismToolboxNode(
      this.modelViewTransform,
      prismsModel,
      this.prismLayer,
      this.visibleBoundsProperty,
      this.occlusionHandler, {
        left: this.layoutBounds.minX + 12
      }
    );

    // Add the reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        prismsModel.reset();
        self.reset();
        environmentMediumControlPanel.reset();
        prismToolboxNode.objectMediumControlPanel.reset();
        radioButtonAdapterProperty.reset();
      },
      radius: 19
    } );

    this.afterLightLayer2.addChild( resetAllButton );

    this.afterLightLayer.addChild( prismToolboxNode );

    // Add the protractor node
    var protractorNode = new ProtractorNode( prismsModel.showProtractorProperty, true, {
      scale: 0.46
    } );
    var protractorLocationProperty = new Property( this.modelViewTransform.modelToViewXY( 2E-5, 0 ) );

    var protractorNodeListener = new MovableDragHandler( protractorLocationProperty, {
      targetNode: protractorNode,
      endDrag: function() {

        // If the protractor is hidden behind any of the controls in the top right, move it to the left
        var bounds = environmentMediumControlPanel.globalBounds
          .union( laserTypeRadioButtonGroup.globalBounds )
          .union( laserControlPanel.globalBounds );
        while ( bounds.intersectsBounds( protractorNode.globalBounds ) ) {
          protractorLocationProperty.value = protractorLocationProperty.value.plusXY( -10, 0 );
        }
      }
    } );
    protractorNode.barPath.addInputListener( protractorNodeListener );

    protractorLocationProperty.link( function( protractorLocation ) {
      protractorNode.center = protractorLocation;
    } );

    this.afterLightLayer.addChild( protractorNode );
    this.afterLightLayer.addChild( this.prismLayer );

    FloatingLayout.floatRight( this, [
      environmentMediumControlPanel,
      laserControlPanel,
      resetAllButton,
      laserTypeRadioButtonGroup
    ] );
    FloatingLayout.floatBottom( this, [ prismToolboxNode, resetAllButton ] );
    FloatingLayout.floatTop( this, [ environmentMediumControlPanel ] );

    this.visibleBoundsProperty.link( function( visibleBounds ) {
      laserTypeRadioButtonGroup.top = environmentMediumControlPanel.bottom + 15;
      laserControlPanel.top = laserTypeRadioButtonGroup.bottom + 15;
    } );

    this.visibleBoundsProperty.link( function( visibleBounds ) {
      self.whiteLightNode.setCanvasBounds( visibleBounds );
      protractorNodeListener.setDragBounds( visibleBounds );
      environmentMediumNodeForMonochromaticLight.setRect( visibleBounds.x, visibleBounds.y, visibleBounds.width, visibleBounds.height );
    } );

    this.resetPrismsView = function() {
      protractorLocationProperty.reset();
      protractorNode.reset();
    };

    // Add a thin gray line to separate the navigation bar when the environmentMediumNode is black
    var navigationBarSeparator = new Rectangle( 0, 0, 100, 100, { fill: '#999999', pickable: false } );
    this.visibleBoundsProperty.link( function( visibleBounds ) {
      var rectHeight = 2;
      navigationBarSeparator.setRect( visibleBounds.x, visibleBounds.y + visibleBounds.height - rectHeight, visibleBounds.width, rectHeight );
    } );
    prismsModel.laser.colorModeProperty.link( function( color ) {
      navigationBarSeparator.visible = color === 'white';
    } );
    this.addChild( navigationBarSeparator );

    prismsModel.laser.colorModeProperty.link( function( colorMode ) {
      prismsModel.mediumColorFactory.lightTypeProperty.value = colorMode;
    } );
  }

  bendingLight.register( 'PrismsView', PrismsView );
  
  return inherit( BendingLightView, PrismsView, {

    /**
     * @public
     */
    reset: function() {
      this.prismLayer.removeAllChildren();
      this.resetPrismsView();
    },

    /**
     * @protected
     */
    step: function() {
      BendingLightView.prototype.step.call( this );
      this.updateWhiteLightNode();
    },

    /**
     * @private, for internal use only.
     */
    updateWhiteLightNode: function() {
      if ( this.prismsModel.laser.colorModeProperty.value === 'white' && this.prismsModel.dirty ) {
        this.whiteLightNode.step();
        this.prismsModel.dirty = false;
      }
    },

    addLightNodes: function() {
      var stageWidth = this.layoutBounds.width;
      var stageHeight = this.layoutBounds.height;
      var self = this;

      var bendingLightModel = this.bendingLightModel;
      this.whiteLightNode = new WhiteLightCanvasNode(
        this.modelViewTransform,
        stageWidth,
        stageHeight,
        bendingLightModel.rays,
        this.prismsModel.environmentMediumProperty,
        this.prismsModel.mediumColorFactory
      );
      this.whiteLightNode.setExcludeInvisible( true );

      // Since the light canvas is opaque, it must be placed behind the control panels.
      this.addChild( this.whiteLightNode );

      // switch between light render for white vs nonwhite light
      bendingLightModel.laser.colorModeProperty.link( function( color ) {
        var white = color === 'white';
        self.whiteLightNode.setVisible( white );
      } );
    },

    addLaserHandles: function( showRotationDragHandlesProperty, showTranslationDragHandlesProperty,
                               clockwiseArrowNotAtMax, ccwArrowNotAtMax, laserImageWidth ) {
      var bendingLightModel = this.bendingLightModel;
      BendingLightView.prototype.addLaserHandles.call(
        this,
        showRotationDragHandlesProperty,
        showTranslationDragHandlesProperty,
        clockwiseArrowNotAtMax,
        ccwArrowNotAtMax,
        laserImageWidth
      );

      // add translation indicators that show if/when the laser can be moved by dragging
      var arrowLength = 83;

      var horizontalTranslationDragHandle = new TranslationDragHandle(
        this.modelViewTransform,
        bendingLightModel.laser,
        arrowLength,
        0,
        showTranslationDragHandlesProperty,
        laserImageWidth
      );
      this.addChild( horizontalTranslationDragHandle );

      var verticalTranslationDragHandle = new TranslationDragHandle(
        this.modelViewTransform,
        bendingLightModel.laser,
        0,
        arrowLength,
        showTranslationDragHandlesProperty,
        laserImageWidth
      );
      this.addChild( verticalTranslationDragHandle );
    }
  } );
} );