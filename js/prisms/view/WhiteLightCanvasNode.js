// Copyright 2015-2020, University of Colorado Boulder

/**
 * In order to support white light, we need to perform additive color mixing (not subtractive,
 * as is the default when drawing transparent colors on top of each other in Java).
 * <p/>
 * This class uses the Bresenham line drawing algorithm (with a stroke thickness of 2) to determine which pixels each
 * ray inhabits. When multiple rays hit the same pixel, their RGB values are added. If any of the RG or B values is
 * greater than the maximum of 255, then RGB values are scaled down and the leftover part is put into the "intensity"
 * value (which is the sum of the ray intensities). The intensity is converted to a transparency value according to
 * alpha = sqrt(intensity/3), which is also clamped to be between 0 and 255.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import inherit from '../../../../phet-core/js/inherit.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';

/**
 * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
 * @param {number} stageWidth - width of the dev area
 * @param {number} stageHeight - height of the dev area
 * @param {ObservableArray} whiteLightRays - array of white light rays
 * @param {Property.<Medium>} environmentMediumProperty
 * @param {MediumColorFactory} mediumColorFactory - for creating colors from index of refraction
 * @constructor
 */
function WhiteLightCanvasNode( modelViewTransform, stageWidth, stageHeight, whiteLightRays,
                               environmentMediumProperty, mediumColorFactory ) {

  CanvasNode.call( this, {
    canvasBounds: new Bounds2( 0, 0, stageWidth, stageHeight )
  } );
  this.invalidatePaint();
  this.modelViewTransform = modelViewTransform; // @private
  this.whiteLightRays = whiteLightRays; // @private
  this.environmentMediumProperty = environmentMediumProperty;
  const self = this;
  const update = function() {
    const a = environmentMediumProperty.value.substance.indexOfRefractionForRedLight;
    self.colorCSS = mediumColorFactory.getColor( a ).toCSS();
    self.invalidatePaint();
  };
  mediumColorFactory.lightTypeProperty.link( update );
  environmentMediumProperty.link( update );
}

bendingLight.register( 'WhiteLightCanvasNode', WhiteLightCanvasNode );

export default inherit( CanvasNode, WhiteLightCanvasNode, {

  /**
   * Paints the particles on the canvas node.
   * @protected
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas: function( context ) {
    context.lineWidth = 3;
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = this.colorCSS;
    context.save();
    context.setTransform( 1, 0, 0, 1, 0, 0 );
    context.fillRect( 0, 0, context.canvas.width, context.canvas.height );
    context.restore();

    // Have to save the previous globalCompositeOperation so it doesn't leak to the SingleColorLightCanvasNode on iOS
    // see #267
    context.save();

    // "Screen", basically adds colors together, making them lighter
    context.globalCompositeOperation = 'lighter';

    for ( let i = 0; i < this.whiteLightRays.length; i++ ) {
      const lightRay = this.whiteLightRays.get( i ); // {LightRay}

      const wavelength = Utils.roundSymmetric( lightRay.wavelengthInVacuum ); // convert back to (nm)

      // Get the line values to make the next part more readable
      const x1 = this.modelViewTransform.modelToViewX( lightRay.tip.x );
      const y1 = this.modelViewTransform.modelToViewY( lightRay.tip.y );
      const x2 = this.modelViewTransform.modelToViewX( lightRay.tail.x );
      const y2 = this.modelViewTransform.modelToViewY( lightRay.tail.y );

      // Scale intensity into a custom alpha range
      const a = Utils.clamp( BendingLightConstants.D65[ wavelength ] * Math.sqrt( lightRay.powerFraction ) / 118, 0, 1 )
                / 8;

      // skip alpha values that are just too light to see, which could also cause number format problems when creating
      // css color
      if ( a > 1E-5 ) {
        const c = VisibleColor.wavelengthToColor( wavelength );
        // var color = BendingLightConstants.XYZ_INTENSITIES[ wavelength ]

        const strokeStyle = 'rgb(' +
                            Utils.roundSymmetric( c.r * a / 0.9829313170995397 ) + ',' +
                            Utils.roundSymmetric( c.g * a ) + ',' +
                            Utils.roundSymmetric( c.b * a / 0.7144456644926587 ) +
                            ')';
        context.strokeStyle = strokeStyle;
        context.beginPath();
        context.moveTo( x1, y1 );
        context.lineTo( x2, y2 );
        context.stroke();
      }
    }
    context.restore();
  },

  /**
   * @public
   */
  step: function() {
    this.invalidatePaint();
  }
} );