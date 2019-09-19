// Copyright 2015-2017, University of Colorado Boulder

/**
 * Node for drawing the series of points.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Property.<[]>} seriesProperty - contains data points of series
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty - Transform between model and view coordinate
   *                                                                      frames
   * @param {string} color - color of the series
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function SeriesCanvasNode( seriesProperty, modelViewTransformProperty, color, options ) {

    CanvasNode.call( this, options );
    this.seriesProperty = seriesProperty; // @private
    this.modelViewTransformProperty = modelViewTransformProperty; // @private
    this.color = color; // @private
  }

  bendingLight.register( 'SeriesCanvasNode', SeriesCanvasNode );
  
  return inherit( CanvasNode, SeriesCanvasNode, {

    /**
     * Paints the series points on the canvas node.
     * @protected
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      let moved = false;

      context.beginPath();
      for ( let i = 0; i < this.seriesProperty.get().length; i++ ) {
        const dataPoint = this.seriesProperty.get()[ i ];

        // check for the data point and if exist draw series
        if ( dataPoint ) {
          const x = this.modelViewTransformProperty.get().modelToViewX( dataPoint.time );
          const y = this.modelViewTransformProperty.get().modelToViewY( dataPoint.value );
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