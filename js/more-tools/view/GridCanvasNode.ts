// Copyright 2015-2021, University of Colorado Boulder

/**
 * Draws horizontal and vertical grid lines in the chart node.
 * These grid lines are drawn using canvas instead of using Path/Shape/Line in which stroke is applied in every
 * frame which leads to performance issues.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import bendingLight from '../../bendingLight.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';

class GridCanvasNode extends CanvasNode {
  modelViewTransformProperty: Property<ModelViewTransform2>;
  strokeDash: number[];
  gridLines: ObservableArray<{ x1: number, y1: number, x2: number, y2: number, lineDashOffset: number }>;

  /**
   * @param {ObservableArrayDef.<[]>} gridLines - contains details of each grid line
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty - Transform between model and view coordinates
   * @param {array.<number>} strokeDash
   * @param {Object} [providedOptions] - options that can be passed on to the underlying node
   */
  constructor( gridLines: ObservableArray<{ x1: number, y1: number, x2: number, y2: number, lineDashOffset: number }>, modelViewTransformProperty: Property<ModelViewTransform2>, strokeDash: number[], providedOptions?: Partial<NodeOptions> ) {

    super( providedOptions );
    this.gridLines = gridLines; // @private
    this.modelViewTransformProperty = modelViewTransformProperty; // @private
    this.strokeDash = strokeDash; // @private
  }

  /**
   * Paints the grid lines on the canvas node.
   * @protected
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas( context: CanvasRenderingContext2D ) {

    context.save();
    for ( let i = 0; i < this.gridLines.length; i++ ) {
      context.beginPath();
      const gridLine = this.gridLines[ i ];
      const modelViewTransform = this.modelViewTransformProperty.get();
      context.moveTo(
        modelViewTransform.modelToViewX( gridLine.x1 ),
        modelViewTransform.modelToViewY( gridLine.y1 ) );
      context.lineTo(
        modelViewTransform.modelToViewX( gridLine.x2 ),
        modelViewTransform.modelToViewY( gridLine.y2 ) );
      context.strokeStyle = 'lightGray';
      context.lineWidth = 2;
      context.setLineDash( this.strokeDash );
      // Have to model the phase to make it look like the grid line is moving
      context.lineDashOffset = gridLine.lineDashOffset;
      context.stroke();
      context.closePath();
    }
    context.restore();
  }

  /**
   * @public
   */
  step() {
    this.invalidatePaint();
  }
}

bendingLight.register( 'GridCanvasNode', GridCanvasNode );

export default GridCanvasNode;