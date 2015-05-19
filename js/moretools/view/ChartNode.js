// Copyright 2002-2015, University of Colorado Boulder

/**
 * Node that shows the chart in the "more tools" screen  intensity sensor.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Property = require( 'AXON/Property' );
  var SeriesCanvasNode = require( 'BENDING_LIGHT/moretools/view/SeriesCanvasNode' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var GridCanvasNode = require( 'BENDING_LIGHT/moretools/view/GridCanvasNode' );

  //stroke dash parameters
  var DASH_ON = 10;
  var DASH_OFF = 5;

  /**
   * Node for drawing the series of points.
   *
   * @param {Series} series
   * @param {Property<ModelViewTransform2>} modelViewTransformProperty
   * @param {Bounds2} chartBounds
   * @constructor
   */
  function SeriesNode( series, modelViewTransformProperty, chartBounds ) {
    Node.call( this );
    var seriesCanvasNode = new SeriesCanvasNode( series.points, series.getColor().toCSS(), {
      canvasBounds: chartBounds
    } );
    this.addChild( seriesCanvasNode );
    series.pathProperty.link( function() {
      series.points.clear();
      series.pathProperty.get().forEach( function( value ) {
        series.points.push( [ modelViewTransformProperty.get().modelToViewX( value.time ),
          modelViewTransformProperty.get().modelToViewY( value.value ) ] );
      } );
      seriesCanvasNode.step();
    } );
  }

  inherit( Node, SeriesNode );

  /**
   *
   * @param {Bounds2} chartBounds
   * @param {Series[]} series
   * @constructor
   */
  function ChartNode( chartBounds, series ) {

    var chartNode = this;
    Node.call( this );
    this.chartBounds = chartBounds;
    this.series = series;

    // Amount of time to show on the horizontal axis of the chart
    this.timeWidth = 72E-16;
    this.gridPoints = new ObservableArray();

    this.gridCanvasNode = new GridCanvasNode( this.gridPoints, [ DASH_ON, DASH_OFF ], {
      canvasBounds: chartBounds
    } );
    this.addChild( this.gridCanvasNode );
    // Mapping from model (SI) to chart coordinates
    this.modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleMapping(
      new Bounds2( 0, -1, this.timeWidth, 1 ), chartBounds ) );

    // Add nodes for the grid lines and series's
    series.forEach( function( s ) {
      chartNode.addChild( new SeriesNode( s, chartNode.modelViewTransformProperty, chartNode.chartBounds ) );
    } );
  }

  return inherit( Node, ChartNode, {

    /**
     *
     * @param {number} time
     */
    step: function( time ) {
      this.simulationTimeChanged( time );
    },

    /**
     * Move over the view port as time passes
     *
     * @param {number} time
     */
    simulationTimeChanged: function( time ) {

      // Update the mapping from model to chart
      var minTime = time - this.timeWidth;
      this.modelViewTransformProperty.set( ModelViewTransform2.createRectangleMapping(
        new Bounds2( minTime, -1, minTime + this.timeWidth, 1 ), this.chartBounds ) );

      // Clear grid lines points and add them back in the new positions
      this.gridPoints.clear();

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
        this.modelViewTransformProperty.get().viewToModelDeltaX( DASH_ON + DASH_OFF ), time );

      // Horizontal axis
      this.gridPoints.push( [ minTime, 0, minTime + this.timeWidth, 0,
        this.modelViewTransformProperty.get().modelToViewDeltaX( horizontalGridLineDelta ),
        this.modelViewTransformProperty ] );

      this.gridCanvasNode.step();

      // Remove any points that have gone outside of the time window, otherwise it is a memory leak
      this.series.forEach( function( series ) {
        series.keepLastSamples( minTime );
      } );
    },

    /**
     * Compute the phase offset so that grid lines appear to be moving at the right speed
     *
     * @param {number} verticalGridLineSpacing
     * @param {number} time
     * @returns {number}
     */
    getDelta: function( verticalGridLineSpacing, time ) {
      var totalNumPeriods = time / verticalGridLineSpacing;

      // for computing the phase so we make the right number of grid lines
      return ( totalNumPeriods % 1 ) * verticalGridLineSpacing;
    },

    /**
     *
     * @param {number} x
     */
    addVerticalLine: function( x ) {

      // -1 to +1 is far enough since in model coordinates
      this.gridPoints.push( [ x, -1, x, 1, 0, this.modelViewTransformProperty ] );
    }
  } );
} );