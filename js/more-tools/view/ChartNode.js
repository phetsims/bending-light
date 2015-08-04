// Copyright 2002-2015, University of Colorado Boulder

/**
 * Node that shows the chart in the "more tools" screen intensity sensor.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Property = require( 'AXON/Property' );
  var SeriesCanvasNode = require( 'BENDING_LIGHT/more-tools/view/SeriesCanvasNode' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var GridCanvasNode = require( 'BENDING_LIGHT/more-tools/view/GridCanvasNode' );

  //stroke dash parameters
  var DASH_ON = 10;
  var DASH_OFF = 5;

  /**
   * Node for drawing the series of points.
   *
   * @param {Series} series - series of data points
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty - Transform between model and view coordinate frames
   * @param {Bounds2} chartBounds - bounds of the chart node
   * @constructor
   */
  function SeriesNode( series, modelViewTransformProperty, chartBounds ) {

    Node.call( this );
    var seriesCanvasNode = new SeriesCanvasNode( series.seriesProperty, modelViewTransformProperty, series.color.toCSS(), {
      canvasBounds: chartBounds
    } );
    this.addChild( seriesCanvasNode );

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

    var chartNode = this;
    Node.call( this );
    this.chartBounds = chartBounds; // @public
    this.seriesArray = seriesArray; // @public

    // @public read-only
    // Amount of time to show on the horizontal axis of the chart
    this.timeWidth = 72E-16; // @public

    // Mapping from model (SI) to chart coordinates
    Property.addProperty( this, 'modelViewTransform', ModelViewTransform2.createRectangleMapping(
      new Bounds2( 0, -1, this.timeWidth, 1 ), chartBounds ) );

    this.gridLines = new ObservableArray(); // @public
    this.gridCanvasNode = new GridCanvasNode( this.gridLines, this.modelViewTransformProperty, [ DASH_ON, DASH_OFF ], {
      canvasBounds: chartBounds
    } );
    this.addChild( this.gridCanvasNode );

    // Add nodes for the grid lines and series's
    seriesArray.forEach( function( series ) {
      chartNode.addChild( new SeriesNode( series, chartNode.modelViewTransformProperty, chartNode.chartBounds ) );
    } );
  }

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
      var minTime = time - this.timeWidth;
      this.modelViewTransformProperty.set( ModelViewTransform2.createRectangleMapping(
        new Bounds2( minTime, -1, minTime + this.timeWidth, 1 ), this.chartBounds ) );

      // Clear grid lines points and add them back in the new positions
      this.gridLines.clear();

      // Distance between vertical grid lines
      var verticalGridLineSpacing = this.timeWidth / 4;
      var verticalGridLineSpacingDelta = this.getDelta( verticalGridLineSpacing, time );

      // Add vertical grid lines
      for ( var x = minTime - verticalGridLineSpacingDelta + verticalGridLineSpacing;
            x <= minTime + this.timeWidth; x += verticalGridLineSpacing ) {
        this.addVerticalLine( x );
      }

      // Add one horizontal grid line
      var horizontalGridLineDelta = this.getDelta(
        this.modelViewTransform.viewToModelDeltaX( DASH_ON + DASH_OFF ), time );

      // Horizontal axis
      this.gridLines.push( {
        x1: minTime, y1: 0,
        x2: minTime + this.timeWidth, y2: 0,
        lineDashOffset: this.modelViewTransform.modelToViewDeltaX( horizontalGridLineDelta )
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
      var totalNumPeriods = time / verticalGridLineSpacing;

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