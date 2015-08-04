// Copyright 2002-2015, University of Colorado Boulder

/**
 * Draws horizontal or vertical grid lines in the chart node.
 * These grid lines are drawn using canvas instead of using Path/Shape/Line in which stroke is applied in every
 * frame which leads to performance issues.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   * @param {ObservableArray<[]>} gridLines - contains details of each grid line
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty - Transform between model and view coordinate frames
   * @param {array.<number>} strokeDash
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function GridCanvasNode( gridLines, modelViewTransformProperty, strokeDash, options ) {

    CanvasNode.call( this, options );
    this.gridLines = gridLines; // @private
    this.modelViewTransformProperty = modelViewTransformProperty; // @private
    this.strokeDash = strokeDash; // @private
  }

  return inherit( CanvasNode, GridCanvasNode, {

    /**
     * Paints the grid lines on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;

      for ( var i = 0; i < this.gridLines.length; i++ ) {
        context.beginPath();
        var gridLine = this.gridLines.get( i );
        var modelViewTransform = this.modelViewTransformProperty.get();
        context.moveTo(
          modelViewTransform.modelToViewX( gridLine.x1 ),
          modelViewTransform.modelToViewY( gridLine.y1 ) );
        context.lineTo(
          modelViewTransform.modelToViewX( gridLine.x2 ),
          modelViewTransform.modelToViewY( gridLine.y2 ) );
        context.strokeStyle = 'lightGray';
        context.lineWidth = 2;
        context.setLineDash( this.strokeDash );
        // Have to model the phase to make it look like the grid line is moving
        context.lineDashOffset = gridLine.lineDashOffset;
        context.stroke();
        context.closePath();
      }
    },

    /**
     * @public
     */
    step: function() {
      this.invalidatePaint();
    }

  } );
} );