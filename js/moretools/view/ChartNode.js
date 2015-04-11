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
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Property = require( 'AXON/Property' );

  //stroke dash parameters
  var DASH_ON = 10;
  var DASH_OFF = 5;

  /**
   * Node for drawing the series of points.
   *
   * @param {Series} series
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @constructor
   */
  function SeriesNode( series, modelViewTransformProperty ) {
    var seriesNode = this;
    Path.call( this, null, {
      stroke: series.getColor(),
      lineWidth: 2
    } );
    series.pathProperty.link( function() {
      seriesNode.setShape( modelViewTransformProperty.get().modelToViewShape( series.toShape() ) );
    } );
  }

  inherit( Path, SeriesNode );

  /**
   * Draw a horizontal or vertical grid line
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} phase - Have to model the phase to make it look like the grid line is moving
   * @param modelViewTransformProperty
   * @constructor
   */
  function GridLine( x1, y1, x2, y2, phase, modelViewTransformProperty ) {

    Path.call( this, modelViewTransformProperty.get().modelToViewShape(
      new Shape().moveTo( x1, y1 ).lineTo( x2, y2 ) ), {
      stroke: 'lightGray',
      lineWidth: 2,
      lineDash: [ DASH_ON, DASH_OFF ],
      lineDashOffset: phase
    } );
  }

  inherit( Path, GridLine );

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

    //Amount of time to show on the horizontal axis of the chart
    this.timeWidth = 72E-16;
    this.maxSampleCount = 72;
    this.gridLines = new Node();
    //Mapping from model (SI) to chart coordinates
    this.modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleMapping(
      new Bounds2( 0, -1, this.timeWidth, 1 ), chartBounds ) );

    //Add nodes for the grid lines and series's
    this.addChild( this.gridLines );
    series.forEach( function( s ) {
      chartNode.addChild( new SeriesNode( s, chartNode.modelViewTransformProperty ) );
    } );
  }

  return inherit( Node, ChartNode, {

    /**
     *
     * @param {number} time
     * @param {number} dt
     */
    step: function( time, dt ) {
      this.simulationTimeChanged( time, dt );
    },
    /**
     * Move over the view port as time passes
     *
     * @param {number} time
     * @param {number} dt
     */
    simulationTimeChanged: function( time, dt ) {

      //Update the mapping from model to chart
      var minTime = time - this.timeWidth;
      this.modelViewTransformProperty.set( ModelViewTransform2.createRectangleMapping(
        new Bounds2( minTime, -1, minTime + this.timeWidth, 1 ), this.chartBounds ) );

      //Clear grid lines and add them back in the new positions
      this.gridLines.removeAllChildren();

      //distance between vertical grid lines
      var verticalGridLineSpacing = this.timeWidth / 4;
      var verticalGridLineSpacingDelta = this.getDelta( verticalGridLineSpacing, time );
      //Add vertical grid lines
      for ( var x = minTime - verticalGridLineSpacingDelta + verticalGridLineSpacing;
            x <= minTime + this.timeWidth; x += this.timeWidth / 4 ) {
        this.addVerticalLine( x );
      }

      //Add one horizontal grid line
      var horizontalGridLineDelta = this.getDelta(
        this.modelViewTransformProperty.get().viewToModelDeltaX( DASH_ON + DASH_OFF ), time );
      //horizontal axis
      this.gridLines.addChild( new GridLine(
        minTime, 0, minTime + this.timeWidth, 0,
        this.modelViewTransformProperty.get().modelToViewDeltaX( horizontalGridLineDelta ),
        this.modelViewTransformProperty ) );

      if ( this.timeWidth / dt > this.maxSampleCount ) {
        this.maxSampleCount += 0.5;
      }
      else if ( this.timeWidth / dt < this.maxSampleCount ) {
        this.maxSampleCount -= 1;
      }
      //Remove any points that have gone outside of the time window, otherwise it is a memory leak
      var chartNode = this;
      this.series.forEach( function( series ) {
        series.keepLastSamples( chartNode.maxSampleCount );
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
      //for computing the phase so we make the right number of grid lines
      return ( totalNumPeriods % 1 ) * verticalGridLineSpacing;
    },

    /**
     *
     * @param {number} x
     */
    addVerticalLine: function( x ) {
      //-1 to +1 is far enough since in model coordinates
      this.gridLines.addChild( new GridLine( x, -1, x, 1, 0, this.modelViewTransformProperty ) );
    }
  } );
} );