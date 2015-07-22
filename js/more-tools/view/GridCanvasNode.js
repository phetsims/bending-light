// Copyright 2002-2015, University of Colorado Boulder

/**
 * Draw a horizontal or vertical grid line
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   *
   * @param {ObservableArray<[]>} gridPoints - contains details of each grid line
   * @param {array.<number>} strokeDash
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function GridCanvasNode( gridPoints, strokeDash, options ) {

    CanvasNode.call( this, options );
    this.gridPoints = gridPoints;
    this.strokeDash = strokeDash;
  }

  return inherit( CanvasNode, GridCanvasNode, {

    /**
     * Paints the grid lines on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;

      for ( var i = 0; i < this.gridPoints.length; i++ ) {
        context.beginPath();
        var grid = this.gridPoints.get( i );
        context.moveTo( grid[ 5 ].get().modelToViewX( grid[ 0 ] ), grid[ 5 ].get().modelToViewY( grid[ 1 ] ) );
        context.lineTo( grid[ 5 ].get().modelToViewX( grid[ 2 ] ), grid[ 5 ].get().modelToViewY( grid[ 3 ] ) );
        context.strokeStyle = 'lightGray';
        context.lineWidth = 2;
        context.setLineDash( this.strokeDash );
        context.lineDashOffset = grid[ 4 ]; // Have to model the phase to make it look like the grid line is moving
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