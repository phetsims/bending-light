// Copyright 2002-2015, University of Colorado
/**
 * View for the light in "wave" form, i.e. oscillating with wave crests.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni(Actual Concepts).
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Pattern = require( 'SCENERY/util/Pattern' );
  var Color = require( 'SCENERY/util/Color' );

  // images
  var waveImage = require( 'image!BENDING_LIGHT/wave.png' );
  var knobImage = require( 'image!BENDING_LIGHT/knob.png' );

  /**
   *
   * @param modelViewTransform
   * @param lightRay
   * @constructor
   */

  function LightWaveNode( modelViewTransform, lightRay ) {
    Node.call( this, { pickable: false } );

    //this.patternIndex = 0;

    this.lightRay = lightRay;
    this.modelViewTransform = modelViewTransform;

    this.patterns = [];
    this.patterns.push( new Pattern( waveImage ) );
    this.patterns.push( new Pattern( knobImage ) );
    //Set the path based on the light ray shape
    //PPath that shows the oscillating wave view for the LightRay
    var color = lightRay.getColor();
    color = new Color( color.getRed(), color.getGreen(), color.getBlue(), Math.sqrt( lightRay.getPowerFraction() ) );
    this.wavePath = new Path( modelViewTransform.modelToViewShape( lightRay.getWaveShape() ), {
      fill: color
    } );
    this.addChild( this.wavePath );

    // todo: need to add  gradient to waves
  }

  return inherit( Node, LightWaveNode );
} );
