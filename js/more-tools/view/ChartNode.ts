// Copyright 2015-2022, University of Colorado Boulder

/**
 * Node that shows the chart in the "more tools" screen intensity sensor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Node } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import Series from '../model/Series.js';
import GridCanvasNode from './GridCanvasNode.js';
import SeriesCanvasNode from './SeriesCanvasNode.js';

// stroke dash parameters
const DASH_ON = 10;
const DASH_OFF = 5;

class SeriesNode extends Node {

  /**
   * Node for drawing the series of points.
   *
   * @param series - series of data points
   * @param modelViewTransformProperty - Transform between model and view coordinate
   *                                                                      frames
   * @param chartBounds - bounds of the chart node
   */
  public constructor( series: Series, modelViewTransformProperty: Property<ModelViewTransform2>, chartBounds: Bounds2 ) {

    super();

    // add series canvas
    const seriesCanvasNode = new SeriesCanvasNode(
      series.seriesProperty,
      modelViewTransformProperty,
      series.color.toCSS(), {

        // @ts-expect-error
        canvasBounds: chartBounds
      }
    );
    this.addChild( seriesCanvasNode );

    // Update the series canvas for every change in series
    series.seriesProperty.link( () => seriesCanvasNode.step() );
  }
}

class ChartNode extends Node {
  private chartBounds: Bounds2;
  private seriesArray: Series[];
  private timeWidth: number;
  private modelViewTransformProperty: Property<ModelViewTransform2>;
  private gridLines: ObservableArray<{ x1: number; y1: number; x2: number; y2: number; lineDashOffset: number }>;
  private gridCanvasNode: GridCanvasNode;

  /**
   * @param chartBounds - bounds of the chart node
   * @param seriesArray - series of data points
   */
  public constructor( chartBounds: Bounds2, seriesArray: Series[] ) {

    super();
    this.chartBounds = chartBounds; // (read-only)
    this.seriesArray = seriesArray; // (read-only)

    // read-only
    // Amount of time to show on the horizontal axis of the chart
    this.timeWidth = 72E-16; // (read-only)

    // Mapping from model (SI) to chart coordinates
    this.modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleMapping( new Bounds2( 0, -1, this.timeWidth, 1 ), chartBounds ) );

    // Add grid to the chart
    this.gridLines = createObservableArray(); // (read-only)
    this.gridCanvasNode = new GridCanvasNode( this.gridLines, this.modelViewTransformProperty, [ DASH_ON, DASH_OFF ], {

      // @ts-expect-error
      canvasBounds: chartBounds
    } );
    this.addChild( this.gridCanvasNode );

    // Add nodes for the grid lines and series's
    seriesArray.forEach( series => this.addChild( new SeriesNode( series, this.modelViewTransformProperty, this.chartBounds ) ) );
  }

  /**
   * @param time - simulation time
   */
  public step( time: number ): void {
    this.simulationTimeChanged( time );
  }

  /**
   * Move over the view port as time passes
   * @param time - simulation time
   */
  private simulationTimeChanged( time: number ): void {

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
    this.seriesArray.forEach( series => series.keepLastSamples( minTime ) );
  }

  /**
   * Compute the phase offset so that grid lines appear to be moving at the right speed
   * @param verticalGridLineSpacing - space between vertical grid lines
   * @param time - simulation time
   */
  private getDelta( verticalGridLineSpacing: number, time: number ): number {
    const totalNumPeriods = time / verticalGridLineSpacing;

    // for computing the phase so we make the right number of grid lines, just keep the fractional part
    return ( totalNumPeriods % 1 ) * verticalGridLineSpacing;
  }

  /**
   * Adds vertical lines to the grid
   * @param x - x coordinate of vertical grid lines
   */
  private addVerticalLine( x: number ): void {

    // -1 to +1 is far enough since in model coordinates
    this.gridLines.push( {
      x1: x, y1: -1,
      x2: x, y2: 1,
      lineDashOffset: 0
    } );
  }
}

bendingLight.register( 'ChartNode', ChartNode );

export default ChartNode;