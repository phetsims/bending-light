// Copyright 2002-2011, University of Colorado
/**
 * In order to support white light, we need to perform additive color mixing (not subtractive,
 * as is the default when drawing transparent colors on top of each other in Java).
 * <p/>
 * This class uses the Bresenham line drawing algorithm (with a stroke thickness of 2) to determine which pixels each ray inhabits.
 * When multiple rays hit the same pixel, their RGB values are added.  If any of the RG or B values is greater than the maximum of 255,
 * then RGB values are scaled down and the leftover part is put into the "intensity" value (which is the sum of the ray intensities).
 * The intensity is converted to a transparency value according to alpha = sqrt(intensity/3), which is also clamped to be between 0 and 255.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  //var LightRayNode = require( 'edu.colorado.phet.bendinglight.view.LightRayNode' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   *
   * @param rayLayer
   * @param stageWidth
   * @param stageHeight
   * @constructor
   */
  function WhiteLightNode( rayLayer, stageWidth, stageHeight ) {

    Node.call( this );

    //private
    this.rayLayer;
    //Buffer into which the light is rendered, only in the stage (light moving off the stage won't be seen even if it is in the canvas)
    //this.buffer = new BufferedImage( stageWidth, stageHeight, BufferedImage.TYPE_INT_ARGB_PRE );
    this.rayLayer = rayLayer;
    //White light cannot be interacted with directly
    this.setPickable( false );
    this.setChildrenPickable( false );
  }

  return inherit( Node, WhiteLightNode, {
    /*updateImage: function() {
     //Prepare and clear the Graphics2D to render the rays
     var graphics = buffer.createGraphics();
     graphics.setBackground( new Color( 0, 0, 0, 0 ) );
     graphics.clearRect( 0, 0, buffer.getWidth(), buffer.getHeight() );
     //maps Point => r,g,b,intensity
     var map = new HashMap();
     for ( var i = 0; i < rayLayer.getChildrenCount(); i++ ) {
     var child = rayLayer.getChild( i );
     var bresenhamLineAlgorithm = new BresenhamLineAlgorithm().withAnonymousClassBody( {
     //The specified pixel got hit by white light, so update the map
     setPixel: function( x0, y0 ) {
     var color = child.getColor();
     var intensity = child.getLightRay().getPowerFraction();
     addToMap( x0, y0, color, intensity, map );
     //Some additional points makes it look a lot better (less sparse) without slowing it down too much
     addToMap( x0 + 1, y0, color, intensity, map );
     addToMap( x0, y0 + 1, color, intensity, map );
     },
     isOutOfBounds: function( x0, y0 ) {
     return x0 < 0 || y0 < 0 || x0 > buffer.getWidth() || y0 > buffer.getHeight();
     }
     } );
     //Get the line values to make the next part more readable
     var x1 = child.getLine().x1;
     var y1 = child.getLine().y1;
     var x2 = child.getLine().x2;
     var y2 = child.getLine().y2;
     //Some lines don't start in the play area; have to check and swap to make sure the line isn't pruned
     if ( bresenhamLineAlgorithm.isOutOfBounds( x1, y1 ) ) {
     bresenhamLineAlgorithm.draw( x2, y2, x1, y1 );
     }
     else {
     bresenhamLineAlgorithm.draw( x1, y1, x2, y2 );
     }
     }
     //Don't let things become completely white, since the background is white
     var whiteLimit = 0.2;
     var maxChannel = 1 - whiteLimit;
     //extra factor to make it white instead of cream/orange
     var scale = 2;
     //could maybe speed up by caching colors for individual points, but right now performance is acceptable
     for ( var point in map.keySet() ) {
     var samples = map.get( point );
     var intensity = samples[ 3 ];
     //move excess samples value into the intensity column
     var max = samples[ 0 ];
     if ( samples[ 1 ] > max ) {
     max = samples[ 1 ];
     }
     if ( samples[ 2 ] > max ) {
     max = samples[ 2 ];
     }
     //Scale and clamp the samples
     samples[ 0 ] = clamp( 0, samples[ 0 ] / max * scale - whiteLimit, maxChannel );
     samples[ 1 ] = clamp( 0, samples[ 1 ] / max * scale - whiteLimit, maxChannel );
     samples[ 2 ] = clamp( 0, samples[ 2 ] / max * scale - whiteLimit, maxChannel );
     intensity = intensity * max;
     //don't let it become fully opaque or it looks too dark against white background
     var alpha = clamp( 0, Math.sqrt( intensity ), 1 );
     //Set the color and fill in the pixel in the buffer
     graphics.setPaint( new Color( samples[ 0 ], samples[ 1 ], samples[ 2 ], alpha ) );
     graphics.fillRect( point.x, point.y, 1, 1 );
     }
     //Cleanup and show the image.
     graphics.dispose();
     setImage( buffer );
     },
     //Add the specified point to the HashMap, creating a new entry if necessary, otherwise adding it to existing values.
     //Take the intensity as the last component of the array

     //private
     addToMap: function( x0, y0, color, intensity, map ) {
     //so that rays don't start fully saturated: this makes it so that it is possible to see the decrease in intensity after a (nontotal) reflection
     var brightnessFactor = 0.017;
     var point = new Point( x0, y0 );
     if ( !map.containsKey( point ) ) {
     //seed with zeros so it can be summed
     map.put( point, new float[ 4 ] );
     }
     var current = map.get( point );
     var term = color.getComponents( null );
     //don't apply brightness factor to intensities
     for ( var a = 0; a < 3; a++ ) {
     current[ a ] = current[ a ] + term[ a ] * brightnessFactor;
     }
     //add intensities, then convert to alpha later;
     current[ 3 ] = current[ 3 ] + intensity;
     }*/
  } );
} );

