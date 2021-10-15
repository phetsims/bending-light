// Copyright 2015-2021, University of Colorado Boulder

/**
 * Radio button group for choosing between 1x monochromatic, 5x monochromatic or 1x white light.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Shape from '../../../../kite/js/Shape.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import laserImage from '../../../images/laser_png.js';
import bendingLight from '../../bendingLight.js';

class LaserTypeRadioButtonGroup extends RectangularRadioButtonGroup {

  /**
   * @param {Property.<LaserViewEnum>} radioButtonAdapterProperty
   * @param {Object} [options]
   */
  constructor( radioButtonAdapterProperty: Property<'white'|'singleColor'|'singleColor5x'>, options?: Partial<NodeOptions> ) {
    const laserImageNode = new Image( laserImage, {
      scale: 0.6,
      clipArea: Shape.rectangle( 100, 0, 44, 100 )
    } ) as unknown as Node;

    const lineWidth = 37;
    const redLineAt = ( y: number ) => new Line( 0, 0, lineWidth, 0, {
      stroke: 'red',
      lineWidth: 2,
      centerY: laserImageNode.centerY + y,
      left: laserImageNode.centerX
    } );

    const dy = 6.25;
    const padding = 2;// vertical padding above the laser in the white light radio button
    const overallScale = 0.875;
    super( radioButtonAdapterProperty, [ {
      value: 'singleColor',
      node: new Node( {
        scale: overallScale,
        children: [
          redLineAt( 0 ),
          laserImageNode
        ]
      } )
    }, {
      value: 'singleColor5x',
      node: new Node( {
        scale: overallScale,
        children: [
          redLineAt( 0 ),
          redLineAt( -dy ),
          redLineAt( -dy * 2 ),
          redLineAt( +dy ),
          redLineAt( +dy * 2 ),
          laserImageNode
        ]
      } )
    }, {
      value: 'white',
      node: new Node( {
        scale: overallScale,
        children: [
          new Rectangle( 60, -padding, 50, laserImageNode.height + padding * 2, { fill: '#261f21' } ),
          new Line( 0, 0, lineWidth, 0, {
            stroke: 'white',
            lineWidth: 2,
            centerY: laserImageNode.centerY,
            left: laserImageNode.centerX
          } ),
          laserImageNode
        ]
      } )
    } ], {
      orientation: 'horizontal',
      baseColor: 'white',
      selectedStroke: '#3291b8',
      selectedLineWidth: 2.5
    } );
    this.mutate( options );
  }
}

bendingLight.register( 'LaserTypeRadioButtonGroup', LaserTypeRadioButtonGroup );

export default LaserTypeRadioButtonGroup;