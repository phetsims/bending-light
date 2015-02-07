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


  function LightWaveNode( transform, lightRay ) {
    Node.call( this );
    this.debug = false;
    //PPath that shows the oscillating wave view for the LightRay
    this.addChild( new Path( this.createPaint( transform, lightRay ) ).withAnonymousClassBody( {
      initializer: function() {
        //Set the path based on the light ray shape
        setPathTo( transform.modelToView( lightRay.getWaveShape() ) );
        //Update the gradient paint when time passes
        lightRay.addStepListener( new VoidFunction0().withAnonymousClassBody( {
          apply: function() {
            setPaint( createPaint( transform, lightRay ) );
          }
        } ) );
      }
    } ) );
    //Don't intercept mouse events
    this.setPickable( false );
  }

  return inherit( Node, LightWaveNode, {

    createPaint: function( transform, lightRay ) {
      var viewWavelength = transform.modelToViewDeltaX( lightRay.getWavelength() );
      var directionVector = transform.modelToViewDelta( lightRay.toVector2D() ).normalized();
      var waveVector = directionVector.times( viewWavelength );
      //Choose the color of the peaks
      var color = lightRay.getColor();
      var red;
      var black;
      if ( this.debug ) {
        //For debugging the phase of the transmitted wave
        red = new Color( 1, 0, 0, 0.5 );
        black = new Color( 0, 0, 0, 0.5 );
      }
      else {
        red = new Color( color.getRed() / 255, color.getGreen() / 255, color.getBlue() / 255, Math.sqrt( lightRay.getPowerFraction() ) );
        black = new Color( 0, 0, 0, Math.sqrt( lightRay.getPowerFraction() ) );
      }
      //Has to match perfectly with the model so that sensor readings match up
      var totalPhaseOffsetInNumberOfWavelengths = lightRay.getPhaseOffset() / 2 / Math.PI;
      var phaseOffset = directionVector.times( transform.modelToViewDeltaX( totalPhaseOffsetInNumberOfWavelengths * lightRay.getWavelength() ) );
      //the rightmost term ensures that phase doesn't depend on angle of the beam.
      var x0 = (phaseOffset.getX() + transform.modelToViewX( lightRay.tail.getX() ));
      var y0 = (phaseOffset.getY() + transform.modelToViewY( lightRay.tail.getY() ));
      return new GradientPaint( x0, y0, red, x0 + waveVector.getX() / 2, y0 + waveVector.getY() / 2, black, true );
    }
  } );
} );

