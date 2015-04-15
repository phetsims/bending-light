// Copyright 2002-2015, University of Colorado Boulder
/**
 * In the "more tools" tab, the protractor can be expanded with a "+" button and returned to
 * the original size with a "-" button.
 *
 * @author Sam Reid
 * @author Chandrashekar  Bemagoni (Actual Concepts).
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );

  /**
   *
   * @param {MoreToolsView} moreToolsView - main view of more tools screen
   * @param {ModelViewTransform2} modelViewTransform transform to convert between model and view values
   * @param {Property<Boolean>} showProtractorProperty  controls the protractor visibility
   * @param {ProtractorModel} protractorModel model of protractor
   * @param translateShape
   * @param rotateShape
   * @param {Number} ICON_WIDTH
   * @param {Bounds2} containerBounds - bounds of container for all tools, needed to snap protractor to initial position when it in container
   * @param {Bounds2} dragBounds - bounds that define where the protractor    may be dragged
   * @constructor
   */
  function ExpandableProtractorNode( moreToolsView, modelViewTransform, showProtractorProperty, protractorModel, translateShape, rotateShape, ICON_WIDTH, containerBounds, dragBounds ) {

    ProtractorNode.call( this, moreToolsView, modelViewTransform, showProtractorProperty, protractorModel, translateShape, rotateShape, ICON_WIDTH, containerBounds, dragBounds );
    var expandableProtractorNode = this;

    // add expandable /collapse  button
    var expandCollapseButton = new ExpandCollapseButton( this.expandedProperty );
    this.addChild( expandCollapseButton );

    expandCollapseButton.setTranslation( expandableProtractorNode.getCenterX() + this.protractorImageNode.getWidth() / 1.6,
      expandableProtractorNode.getCenterY() + this.protractorImageNode.getHeight() / 5 );

    this.expandedProperty.link( function( expand ) {
      expandableProtractorNode.setExpanded( expand );
    } );
    this.setProtractorScale( this.multiScale );
    this.expandedButtonVisibilityProperty.link( function( visibility ) {
      expandCollapseButton.visible = visibility;
    } );
  }

  return inherit( ProtractorNode, ExpandableProtractorNode, {

    /**
     * Set whether the protractor should be shown as large (expanded) or regular
     * @private
     * @param {Boolean}expanded
     */
    setExpanded: function( expanded ) {
      this.setProtractorScale( expanded ? 0.8 : 0.4 );
    }
  } );
} );

