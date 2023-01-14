// Copyright 2015-2023, University of Colorado Boulder

/**
 * Radio button group for choosing between 1x monochromatic, 5x monochromatic or 1x white light.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Image, Line, Node, NodeOptions, Rectangle } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import laser_png from '../../../images/laser_png.js';
import bendingLight from '../../bendingLight.js';
import LightType from '../model/LightType.js';

class LaserTypeRadioButtonGroup extends RectangularRadioButtonGroup<LightType> {

  /**
   * @param radioButtonAdapterProperty
   * @param [providedOptions]
   */
  public constructor( radioButtonAdapterProperty: Property<LightType>, providedOptions?: NodeOptions ) {
    const laserImageNode = new Image( laser_png, {
      scale: 0.6,
      clipArea: Shape.rectangle( 100, 0, 44, 100 )
    } );

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
      value: LightType.SINGLE_COLOR,
      createNode: () => new Node( {
        scale: overallScale,
        children: [
          redLineAt( 0 ),
          laserImageNode
        ]
      } )
    }, {
      value: LightType.SINGLE_COLOR_5X,
      createNode: () => new Node( {
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
      value: LightType.WHITE,
      createNode: () => new Node( {
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
      radioButtonOptions: {
        baseColor: 'white',
        buttonAppearanceStrategyOptions: {
          selectedStroke: '#3291b8',
          selectedLineWidth: 2.5
        }
      }
    } );
    this.mutate( providedOptions );
  }
}

bendingLight.register( 'LaserTypeRadioButtonGroup', LaserTypeRadioButtonGroup );

export default LaserTypeRadioButtonGroup;