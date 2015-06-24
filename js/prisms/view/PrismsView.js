// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the "Prisms" Screen.
 *
 * @author Sam Reid
 * @author Chandrashekar  Bemagoni(Actual Concepts)
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
  var LaserControlPanelNode = require( 'BENDING_LIGHT/prisms/view/LaserControlPanelNode' );
  var LaserTypeControlPanel = require( 'BENDING_LIGHT/prisms/view/LaserTypeControlPanel' );
  var EventTimer = require( 'PHET_CORE/EventTimer' );

  // constants
  var INSET = 10;

  // string
  var environmentString = require( 'string!BENDING_LIGHT/environment' );

  /**
   *
   * @param {PrismBreakModel} prismBreakModel - model of  prisms screen
   * @constructor
   */
  function PrismsView( prismBreakModel ) {

    this.prismLayer = new Node();
    this.prismBreakModel = prismBreakModel;
    var prismBreakView = this;

    // Specify how the drag angle should be clamped
    function clampDragAngle( angle ) {
      return angle;
    }

    // In prisms tab  laser node can rotate 360 degrees  .so  arrows showing  all the times when laser node rotate
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
      //empty shape since shouldn't be rotatable in this tab
      return fullShape;
    }

    BendingLightView.call( this, prismBreakModel,
      clampDragAngle,
      clockwiseArrowNotAtMax,
      ccwArrowNotAtMax,
      translationRegion,
      rotationRegionShape, 'laserKnob',
      90 );

    var IndexOfRefractionDecimals = 2;

    // Add control panels for setting the index of refraction for each medium
    var environmentMediumControlPanel = new MediumControlPanel( this, prismBreakModel.environmentMediumProperty,
      environmentString, false, prismBreakModel.wavelengthProperty, IndexOfRefractionDecimals, {
        xMargin: 7,
        yMargin: 6
      } );
    environmentMediumControlPanel.setTranslation(
      this.layoutBounds.right - 2 * INSET - environmentMediumControlPanel.width, this.layoutBounds.top + 15 );
    this.afterLightLayer2.addChild( environmentMediumControlPanel );

    var laserControlPanelNode = new LaserControlPanelNode( prismBreakModel.laser.colorModeProperty,
      prismBreakModel.wavelengthProperty, {
        top:   environmentMediumControlPanel.bottom + 15,
        right: this.layoutBounds.right - 2 * INSET,
        minWidth: environmentMediumControlPanel.width,
        align: 'center'
      } );
    this.afterLightLayer2.addChild( laserControlPanelNode );
    this.incidentWaveCanvasLayer.setVisible( false );

    // Optionally show the normal lines at each intersection
    prismBreakModel.intersections.addItemAddedListener( function( addedIntersection ) {
      if ( prismBreakModel.showNormalsProperty.get() ) {
        var node = new IntersectionNode( prismBreakView.modelViewTransform, addedIntersection );
        prismBreakView.addChild( node );

        prismBreakModel.intersections.addItemRemovedListener( function( removedIntersection ) {
          if ( removedIntersection === addedIntersection ) {
            prismBreakView.removeChild( node );
          }
        } );
      }
    } );

    var laserTypeControlPanel = new LaserTypeControlPanel( prismBreakModel.manyRaysProperty, {
      top: this.layoutBounds.top + INSET,
      left: this.layoutBounds.minX + INSET
    } );
    this.addChild( laserTypeControlPanel );

    //Add the reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        prismBreakModel.reset();
        prismBreakView.reset();
        laserControlPanelNode.reset();
        environmentMediumControlPanel.reset();
        prismToolboxNode.objectMediumControlPanel.reset();
      },
      bottom: this.layoutBounds.bottom - 14,
      right:  this.layoutBounds.right - 2 * INSET,
      radius: 19
    } );

    this.afterLightLayer2.addChild( resetAllButton );

    // Get the function that chooses which region of the protractor can be used for rotation--none in this tab.
    var getProtractorRotationRegion = function( fullShape, innerBar, outerCircle ) {
      // Empty shape since shouldn't be rotatable in this tab
      return outerCircle;
    };

    // get the function that chooses which region of the protractor can be used for translation--both the inner bar and
    // outer circle in this tab
    var getProtractorDragRegion = function( fullShape, innerBar, outerCircle ) {
      return innerBar;
    };

    // Add the protractor node
    var protractorNode = new ProtractorNode( this, this.modelViewTransform, prismBreakModel.showProtractorProperty,
      prismBreakModel.protractorModel,
      getProtractorDragRegion, getProtractorRotationRegion, 125, null, this.layoutBounds );
    this.addChild( protractorNode );

    // Add prisms tool box Node
    var prismToolboxNode = new PrismToolboxNode( this, this.modelViewTransform, prismBreakModel,
      { left: this.layoutBounds.minX + 12, bottom: this.layoutBounds.bottom - INSET } );
    this.beforeLightLayer.addChild( prismToolboxNode );
    this.beforeLightLayer.addChild( this.prismLayer );

    // Call stepInternal at a rate of 10 times per second
    this.timer = new EventTimer( new EventTimer.ConstantEventModel( 30 ), function() {
      prismBreakView.stepInternal();
    } );

    // Move the laser node to front of all other nodes of prism screen.
    prismBreakModel.laser.emissionPointProperty.link( function() {
      for ( var i = 0; i < prismBreakView.laserLayerArray.length; i++ ) {
        prismBreakView.laserLayerArray[ i ].moveToFront();
      }
    } );
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
      this.timer.step( dt );
    },

    /**
     * @private
     */
    stepInternal: function() {
      if ( this.prismBreakModel.laser.colorModeProperty.value === 'white' && this.prismBreakModel.dirty ) {
        this.whiteLightNode.step();
        this.prismBreakModel.dirty = false;
      }
    }
  } );
} );