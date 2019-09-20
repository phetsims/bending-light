// Copyright 2015-2019, University of Colorado Boulder

/**
 * Node that shows the chart in the "more tools" screen intensity sensor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const GridCanvasNode = require( 'BENDING_LIGHT/more-tools/view/GridCanvasNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Property = require( 'AXON/Property' );
  const SeriesCanvasNode = require( 'BENDING_LIGHT/more-tools/view/SeriesCanvasNode' );

  // stroke dash parameters
  const DASH_ON = 10;
  const DASH_OFF = 5;

  /**
   * Node for drawing the series of points.
   *
   * @param {Series} series - series of data points
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty - Transform between model and view coordinate
   *                                                                      frames
   * @param {Bounds2} chartBounds - bounds of the chart node
   * @constructor
   */
  function SeriesNode( series, modelViewTransformProperty, chartBounds ) {

    Node.call( this );

    // add series canvas
    const seriesCanvasNode = new SeriesCanvasNode(
      series.seriesProperty,
      modelViewTransformProperty,
      series.color.toCSS(), {
        canvasBounds: chartBounds
      }
    );
    this.addChild( seriesCanvasNode );

    // Update the series canvas for every change in series
    series.seriesProperty.link( function() {
      seriesCanvasNode.step();
    } );
  }

  inherit( Node, SeriesNode );

  /**
   * @param {Bounds2} chartBounds - bounds of the chart node
   * @param {array.<Series>} seriesArray - series of data points
   * @constructor
   */
  function ChartNode( chartBounds, seriesArray ) {

    const self = this;
    Node.call( this );
    this.chartBounds = chartBounds; // @public (read-only)
    this.seriesArray = seriesArray; // @public (read-only)

    // @public read-only
    // Amount of time to show on the horizontal axis of the chart
    this.timeWidth = 72E-16; // @public (read-only)

    // Mapping from model (SI) to chart coordinates
    this.modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleMapping( new Bounds2( 0, -1, this.timeWidth, 1 ), chartBounds ) );

    // Add grid to the chart
    this.gridLines = new ObservableArray(); // @public (read-only)
    this.gridCanvasNode = new GridCanvasNode( this.gridLines, this.modelViewTransformProperty, [ DASH_ON, DASH_OFF ], {
      canvasBounds: chartBounds
    } );
    this.addChild( this.gridCanvasNode );

    // Add nodes for the grid lines and series's
    seriesArray.forEach( function( series ) {
      self.addChild( new SeriesNode( series, self.modelViewTransformProperty, self.chartBounds ) );
    } );
  }

  bendingLight.register( 'ChartNode', ChartNode );
  
  return inherit( Node, ChartNode, {

    /**
     * @public
     * @param {number} time - simulation time
     */
    step: function( time ) {
      this.simulationTimeChanged( time );
    },

    /**
     * Move over the view port as time passes
     * @private
     * @param {number} time - simulation time
     */
    simulationTimeChanged: function( time ) {

      // Update the mapping from model to chart
      const minTime = time - this.timeWidth;
      this.modelViewTransformProperty.set( ModelViewTransform2.createRectangleMapping(
        new Bounds2( minTime, -1, minTime + this.timeWidth, 1 ), this.chartBounds ) );

      // Clear grid lines points and add them back in the new positions
      this.gridLines.clear();

      // Distance between vertical grid lines
      const verticalGridLineSpacing = this.timeWidth / 4;
      const verticalGridLineSpacingDelta = this.getDelta( verticalGridLineSpacing, time );

      // Add vertical grid lines
      for ( let x = minTime - verticalGridLineSpacingDelta + verticalGridLineSpacing;
            x <= minTime + this.timeWidth; x += verticalGridLineSpacing ) {
        this.addVerticalLine( x );
      }

      // Add one horizontal grid line
      const horizontalGridLineDelta = this.getDelta(
        this.modelViewTransformProperty.get().viewToModelDeltaX( DASH_ON + DASH_OFF ), time );

      // Horizontal axis
      this.gridLines.push( {
        x1: minTime, y1: 0,
        x2: minTime + this.timeWidth, y2: 0,
        lineDashOffset: this.modelViewTransformProperty.get().modelToViewDeltaX( horizontalGridLineDelta )
      } );
      this.gridCanvasNode.step();

      // Remove any points that have gone outside of the time window, otherwise it is a memory leak
      this.seriesArray.forEach( function( series ) {
        series.keepLastSamples( minTime );
      } );
    },

    /**
     * Compute the phase offset so that grid lines appear to be moving at the right speed
     * @private
     * @param {number} verticalGridLineSpacing - space between vertical grid lines
     * @param {number} time - simulation time
     * @returns {number}
     */
    getDelta: function( verticalGridLineSpacing, time ) {
      const totalNumPeriods = time / verticalGridLineSpacing;

      // for computing the phase so we make the right number of grid lines, just keep the fractional part
      return ( totalNumPeriods % 1 ) * verticalGridLineSpacing;
    },

    /**
     * Adds vertical lines to the grid
     * @private
     * @param {number} x - x coordinate of vertical grid lines
     */
    addVerticalLine: function( x ) {

      // -1 to +1 is far enough since in model coordinates
      this.gridLines.push( {
        x1: x, y1: -1,
        x2: x, y2: 1,
        lineDashOffset: 0
      } );
    }
  } );
} );