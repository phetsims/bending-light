// Copyright 2002-2015, University of Colorado Boulder

/**
 * Node for drawing the series of points.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   * @param {Property.<[]>} seriesProperty - contains data points of series
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty - Transform between model and view coordinate frames
   * @param {string} color - color of the series
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function SeriesCanvasNode( seriesProperty, modelViewTransformProperty, color, options ) {

    CanvasNode.call( this, options );
    this.seriesProperty = seriesProperty;
    this.modelViewTransformProperty = modelViewTransformProperty;
    this.color = color;
  }

  return inherit( CanvasNode, SeriesCanvasNode, {

    /**
     * Paints the series points on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var moved = false;

      context.beginPath();
      for ( var i = 0; i < this.seriesProperty.get().length; i++ ) {
        var dataPoint = this.seriesProperty.get()[ i ];
        if ( dataPoint ) {
          var x = this.modelViewTransformProperty.get().modelToViewX( dataPoint.time );
          var y = this.modelViewTransformProperty.get().modelToViewY( dataPoint.value );
          if ( !moved ) {
            context.moveTo( x, y );
            moved = true;
          }
          else {
            context.lineTo( x, y );
          }
        }
      }
      context.strokeStyle = this.color;
      context.lineWidth = 2;
      context.setLineDash( [] );
      context.lineDashOffset = 0;
      context.stroke();
      context.closePath();
    },

    /**
     * @public
     */
    step: function() {
      this.invalidatePaint();
    }

  } );
} );