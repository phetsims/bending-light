// Copyright 2015-2021, University of Colorado Boulder

/**
 * Node for drawing the series of points.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import bendingLight from '../../bendingLight.js';
import DataPoint from '../model/DataPoint.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';

class SeriesCanvasNode extends CanvasNode {
  seriesProperty: Property<DataPoint[]>;
  modelViewTransformProperty: Property<ModelViewTransform2>;
  color: string;

  /**
   * @param {Property.<[]>} seriesProperty - contains data points of series
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty - Transform between model and view coordinate
   *                                                                      frames
   * @param {string} color - color of the series
   * @param {Object} [providedOptions] - options that can be passed on to the underlying node
   */
  constructor( seriesProperty: Property<DataPoint[]>, modelViewTransformProperty: Property<ModelViewTransform2>, color: string, providedOptions?: Partial<NodeOptions> ) {

    super( providedOptions );
    this.seriesProperty = seriesProperty; // @private
    this.modelViewTransformProperty = modelViewTransformProperty; // @private
    this.color = color; // @private
  }

  /**
   * Paints the series points on the canvas node.
   * @protected
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas( context: CanvasRenderingContext2D ) {
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
   * @public
   */
  step() {
    this.invalidatePaint();
  }
}

bendingLight.register( 'SeriesCanvasNode', SeriesCanvasNode );

export default SeriesCanvasNode;