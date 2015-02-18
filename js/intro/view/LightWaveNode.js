// Copyright 2002-2012, University of Colorado
/**
 * This node depicts the light in "wave" form, i.e. oscillating with wave crests.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Color = require( 'SCENERY/util/Color' );
  var Path = require( 'SCENERY/nodes/Path' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  /**
   *
   * @param modelViewTransform
   * @param lightRay
   * @constructor
   */

  function LightWaveNode( modelViewTransform, lightRay ) {
    Node.call( this );

    //Set the path based on the light ray shape
    //PPath that shows the oscillating wave view for the LightRay
    this.wavePath = new Path( modelViewTransform.modelToViewShape( lightRay.getWaveShape() ), {
      stroke: 'red', fill: 'blue', lineWidth: modelViewTransform.modelToViewDeltaX( lightRay.getWaveWidth() )
    } );
    this.addChild( this.wavePath );
    //Don't intercept mouse events
    this.setPickable( false );
  }

  return inherit( Node, LightWaveNode, {

    /**
     * Update the gradient paint when time passes
     * @param modelViewTransform
     * @param lightRay
     */
    createPaint: function( modelViewTransform, lightRay ) {

      /*    var viewWavelength = modelViewTransform.modelToViewDeltaX( lightRay.getWavelength() );
       var directionVector = modelViewTransform.modelToViewDelta( lightRay.toVector2D() ).normalized();
       // var waveVector = directionVector.times( viewWavelength );

       //Choose the color of the peaks
       var color = lightRay.getColor();
       var red = new Color( color.getRed() / 255, color.getGreen() / 255, color.getBlue() / 255, Math.sqrt( lightRay.getPowerFraction() ) );
       var black = new Color( 0, 0, 0, Math.sqrt( lightRay.getPowerFraction() ) );

       //Has to match perfectly with the model so that sensor readings match up
       var totalPhaseOffsetInNumberOfWavelengths = lightRay.getPhaseOffset() / 2 / Math.PI;
       var phaseOffset = directionVector.times( modelViewTransform.modelToViewDeltaX(
       totalPhaseOffsetInNumberOfWavelengths * lightRay.getWavelength() ) );
       //the rightmost term ensures that phase doesn't depend on angle of the beam.
       //var x0 = (phaseOffset.getX() + modelViewTransform.modelToViewX( lightRay.tail.getX() ));
       //var y0 = (phaseOffset.y + modelViewTransform.modelToViewY( lightRay.tail.y) );
       // return new GradientPaint( x0, y0, red, x0 + waveVector.getX() / 2, y0 + waveVector.getY() / 2, black, true );
       return new LinearGradient( 0, 0, 0, 4 ).addColorStop( 0, 'red',
       0.5, 'black' );*/
    }
  } );
} );

