// Copyright 2015-2022, University of Colorado Boulder

/**
 * Node for drawing the series of points.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import { CanvasNode, NodeOptions } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import DataPoint from '../model/DataPoint.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';

class SeriesCanvasNode extends CanvasNode {
  private readonly seriesProperty: Property<DataPoint[]>;
  private readonly modelViewTransformProperty: Property<ModelViewTransform2>;
  private readonly color: string;

  /**
   * @param seriesProperty - contains data points of series
   * @param modelViewTransformProperty - Transform between model and view coordinate
   *                                                                      frames
   * @param color - color of the series
   * @param [providedOptions] - options that can be passed on to the underlying node
   */
  public constructor( seriesProperty: Property<DataPoint[]>, modelViewTransformProperty: Property<ModelViewTransform2>,
                      color: string, providedOptions?: NodeOptions ) {

    super( providedOptions );
    this.seriesProperty = seriesProperty;
    this.modelViewTransformProperty = modelViewTransformProperty;
    this.color = color;
  }

  /**
   * Paints the series points on the canvas node.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
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
  }

  /**
   */
  public step(): void {
    this.invalidatePaint();
  }
}

bendingLight.register( 'SeriesCanvasNode', SeriesCanvasNode );

export default SeriesCanvasNode;