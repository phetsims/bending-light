// Copyright 2002-2015, University of Colorado Boulder

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
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Util = require( 'DOT/Util' );
  var BendingLightConstants = require( 'BENDING_LIGHT/common/BendingLightConstants' );
  var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {number} stageWidth - width of the dev area
   * @param {number} stageHeight - height of the dev area
   * @param {ObservableArray} whiteLightRays - array of white light rays
   * @param {Property.<Medium>} environmentMediumProperty
   * @constructor
   */
  function WhiteLightCanvasNode( modelViewTransform, stageWidth, stageHeight, whiteLightRays,
                                 environmentMediumProperty ) {

    CanvasNode.call( this, {
      canvasBounds: new Bounds2( 0, 0, stageWidth, stageHeight )
    } );
    this.invalidatePaint();
    this.modelViewTransform = modelViewTransform; // @private
    this.whiteLightRays = whiteLightRays; // @private
    this.environmentMediumProperty = environmentMediumProperty;
    var whiteLightCanvasNode = this;
    var update = function() {
      var a = environmentMediumProperty.value.substance.getIndexOfRefractionForRedLight();
      whiteLightCanvasNode.colorCSS = MediumColorFactory.getColor( a ).toCSS();
      whiteLightCanvasNode.invalidatePaint();
    };
    MediumColorFactory.lightTypeProperty.link( update );
    environmentMediumProperty.link( update );
  }

  return inherit( CanvasNode, WhiteLightCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      context.lineWidth = 3;
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = this.colorCSS;
      context.save();
      context.setTransform( 1, 0, 0, 1, 0, 0 );
      context.fillRect( 0, 0, wrapper.canvas.width, wrapper.canvas.height );
      context.restore();

      // "Screen", basically adds colors together, making them lighter
      context.globalCompositeOperation = 'lighter';

      for ( var i = 0; i < this.whiteLightRays.length; i++ ) {
        var lightRay = this.whiteLightRays.get( i ); // {LightRay}

        var wavelength = Math.round( lightRay.wavelengthInVacuum ); // convert back to (nm)

        // Get the line values to make the next part more readable
        var x1 = this.modelViewTransform.modelToViewX( lightRay.tip.x );
        var y1 = this.modelViewTransform.modelToViewY( lightRay.tip.y );
        var x2 = this.modelViewTransform.modelToViewX( lightRay.tail.x );
        var y2 = this.modelViewTransform.modelToViewY( lightRay.tail.y );

        // Scale intensity into a custom alpha range
        var a = Util.clamp(
                BendingLightConstants.D65[ wavelength ] * Math.sqrt( lightRay.powerFraction ) / 118,
            0,
            1
          ) / 8;

        // skip alpha values that are just too light to see, which could also cause number format problems when creating
        // css color
        if ( a > 1E-5 ) {
          var c = VisibleColor.wavelengthToColor( wavelength );
          // var color = BendingLightConstants.XYZ_INTENSITIES[ wavelength ]

          var strokeStyle = 'rgb(' +
                            Math.round( c.r * a / 0.9829313170995397 ) + ',' +
                            Math.round( c.g * a ) + ',' +
                            Math.round( c.b * a / 0.7144456644926587 ) +
                            ')';
          context.strokeStyle = strokeStyle;
          context.beginPath();
          context.moveTo( x1, y1 );
          context.lineTo( x2, y2 );
          context.stroke();
        }
      }

      // Try to draw a very transparent black over areas that have already been draw. This should turn a full white into
      // a gray, while not affecting fully transparent parts of the Canvas at all.
      // context.globalCompositeOperation = 'source-atop';
      // context.fillStyle = 'rgba(0,0,0,0.1)';
      // context.save();
      // context.setTransform( 1, 0, 0, 1, 0, 0 );
      // context.fillRect( 0, 0, wrapper.canvas.width, wrapper.canvas.height );
      // context.restore();
    },

    /**
     * @public
     */
    step: function() {
      this.invalidatePaint();
    }
  } );
} );