// Copyright 2002-2015, University of Colorado Boulder

/**
 * Draw a horizontal or vertical grid line
 *
 * @author Chandrashekar Bemagoni  (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   *
   * @param {ObservableArray<[]>} gridPoints
   * @param {number[]} strokeDash
   * @param {Object} [options]
   * @constructor
   */
  function GridCanvasNode( gridPoints, strokeDash, options ) {

    CanvasNode.call( this, options );
    this.gridPoints = gridPoints;
    this.strokeDash = strokeDash;
  }

  return inherit( CanvasNode, GridCanvasNode, {

    /**
     * Paints the gris lines on the canvas node.
     *
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
        context.lineDashOffset = grid[ 4 ];
        context.stroke();
        context.closePath();
      }
    },

    step: function() {
      this.invalidatePaint();
    }

  } );
} );