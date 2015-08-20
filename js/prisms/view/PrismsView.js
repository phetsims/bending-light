// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the "Prisms" Screen.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var BendingLightView = require( 'BENDING_LIGHT/common/view/BendingLightView' );
  var MediumControlPanel = require( 'BENDING_LIGHT/common/view/MediumControlPanel' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var IntersectionNode = require( 'BENDING_LIGHT/prisms/view/IntersectionNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PrismToolboxNode = require( 'BENDING_LIGHT/prisms/view/PrismToolboxNode' );
  var LaserControlPanel = require( 'BENDING_LIGHT/common/view/LaserControlPanel' );
  var LaserTypeControlPanel = require( 'BENDING_LIGHT/prisms/view/LaserTypeControlPanel' );
  var EventTimer = require( 'PHET_CORE/EventTimer' );
  var floatRight = require( 'BENDING_LIGHT/common/view/floatRight' );

  // constants
  var INSET = 10;

  // string
  var environmentString = require( 'string!BENDING_LIGHT/environment' );
  var oneColorString = require( 'string!BENDING_LIGHT/oneColor' );
  var whiteLightString = require( 'string!BENDING_LIGHT/whiteLight' );

  /**
   * @param {PrismsModel} prismsModel - model of prisms screen
   * @constructor
   */
  function PrismsView( prismsModel ) {

    this.prismLayer = new Node( { layerSplit: true } );
    this.prismsModel = prismsModel;
    var prismsView = this;

    // Specify how the drag angle should be clamped
    function clampDragAngle( angle ) {
      return angle;
    }

    // In prisms tab laser node can rotate 360 degrees.so arrows showing all the times when laser node rotate
    function clockwiseArrowNotAtMax() {
      return true;
    }

    function ccwArrowNotAtMax() {
      return true;
    }

    // Rotation if the user clicks top on the object
    function rotationRegionShape( full, back ) {
      return back;
    }

    function translationRegion( fullShape, backShape ) {

      // Empty shape since shouldn't be rotatable in this tab
      return fullShape;
    }

    BendingLightView.call( this,
      prismsModel,
      clampDragAngle,
      clockwiseArrowNotAtMax,
      ccwArrowNotAtMax,
      translationRegion,
      rotationRegionShape,
      'laserKnob',
      90,
      -43,
      // occlusion handler, if the prism is dropped behind a control panel, bump it to the left.
      function( node ) {

        var controlPanels = [ laserControlPanel, environmentMediumControlPanel ];
        controlPanels.forEach( function( controlPanel ) {
          if ( controlPanel.globalBounds.containsPoint( node.globalBounds.center ) ) {
            node.translateViewXY( node.globalToParentBounds( controlPanel.globalBounds ).minX - node.centerX, 0 );
          }
        } );
      }
    );

    var IndexOfRefractionDecimals = 2;

    // Add control panels for setting the index of refraction for each medium
    var environmentMediumControlPanel = new MediumControlPanel( this, prismsModel.environmentMediumProperty,
      environmentString, false, prismsModel.wavelengthProperty, IndexOfRefractionDecimals, {
        xMargin: 7,
        yMargin: 6,
        comboBoxListPosition: 'below'
      } );
    environmentMediumControlPanel.setTranslation(
      this.layoutBounds.right - 2 * INSET - environmentMediumControlPanel.width, this.layoutBounds.top + 15 );
    this.afterLightLayer2.addChild( environmentMediumControlPanel );

    var laserControlPanel = new LaserControlPanel( prismsModel.laser.colorModeProperty,
      prismsModel.wavelengthProperty, 'white', 'singleColor', whiteLightString, oneColorString, true, {
        xMargin: 5,
        yMargin: 10,
        radioButtonradius: 7,
        spacing: 8.4,
        disableUnselected: true,
        top: environmentMediumControlPanel.bottom + 15,
        right: this.layoutBounds.right - 2 * INSET,
        minWidth: environmentMediumControlPanel.width,
        align: 'center'
      } );
    this.afterLightLayer2.addChild( laserControlPanel );
    this.incidentWaveCanvasLayer.setVisible( false );

    // Optionally show the normal lines at each intersection
    prismsModel.intersections.addItemAddedListener( function( addedIntersection ) {
      if ( prismsModel.showNormals ) {
        var node = new IntersectionNode( prismsView.modelViewTransform, addedIntersection );
        prismsView.addChild( node );

        prismsModel.intersections.addItemRemovedListener( function( removedIntersection ) {
          if ( removedIntersection === addedIntersection ) {
            prismsView.removeChild( node );
          }
        } );
      }
    } );

    var laserTypeControlPanel = new LaserTypeControlPanel( prismsModel.manyRaysProperty, {
      top: this.layoutBounds.top + INSET,
      left: this.layoutBounds.minX + INSET
    } );
    this.addChild( laserTypeControlPanel );

    // Add the reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        prismsModel.reset();
        prismsView.reset();
        laserControlPanel.reset();
        environmentMediumControlPanel.reset();
        prismToolboxNode.objectMediumControlPanel.reset();
      },
      bottom: this.layoutBounds.bottom - 14,
      right: this.layoutBounds.right - 2 * INSET,
      radius: 19
    } );

    this.afterLightLayer2.addChild( resetAllButton );

    // Get the function that chooses which region of the protractor can be used for rotation--none in this tab.
    var getProtractorRotationRegion = function( fullShape, innerBar, outerCircle ) {

      // Empty shape since shouldn't be rotatable in this tab
      return outerCircle;
    };

    // Get the function that chooses which region of the protractor can be used for translation--both the inner bar and
    // outer circle in this tab
    var getProtractorDragRegion = function( fullShape, innerBar, outerCircle ) {
      return innerBar;
    };

    // Add the protractor node
    var protractorNode = new ProtractorNode( this.afterLightLayer, this.beforeLightLayer2, this.modelViewTransform, prismsModel.showProtractorProperty,
      prismsModel.protractorModel, getProtractorDragRegion, getProtractorRotationRegion, 125, null,
      this.layoutBounds );
    this.addChild( protractorNode );

    // Add prisms tool box Node
    var prismToolboxNode = new PrismToolboxNode(
      this.modelViewTransform,
      prismsModel,
      this.prismLayer,
      this.layoutBounds,
      this.occlusionHandler, {
        left: this.layoutBounds.minX + 12,
        bottom: this.layoutBounds.bottom - INSET
      }
    );
    this.beforeLightLayer.addChild( prismToolboxNode );
    this.beforeLightLayer.addChild( this.prismLayer );

    // Call updateWhiteLightNode at a rate of 10 times per second
    this.timer = new EventTimer( new EventTimer.ConstantEventModel( 30 ), function() {
      prismsView.updateWhiteLightNode();
    } );

    // Move the laser node to front of all other nodes of prism screen.
    prismsModel.laser.emissionPointProperty.link( function() {
      for ( var i = 0; i < prismsView.laserLayerArray.length; i++ ) {
        prismsView.laserLayerArray[ i ].moveToFront();
      }
    } );

    floatRight( this, [ environmentMediumControlPanel, laserControlPanel, resetAllButton ] );
  }

  return inherit( BendingLightView, PrismsView, {

    /**
     * @public
     */
    reset: function() {
      this.prismLayer.removeAllChildren();
    },

    /**
     * @protected
     * @param {number} dt - time
     */
    step: function( dt ) {
      BendingLightView.prototype.step.call( this );
      this.timer.step( dt );
    },

    /**
     * @private, for internal use only.
     */
    updateWhiteLightNode: function() {
      if ( this.prismsModel.laser.colorMode === 'white' && this.prismsModel.dirty ) {
        this.whiteLightNode.step();
        this.prismsModel.dirty = false;
      }
    }
  } );
} );