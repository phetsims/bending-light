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
  var Vector2 = require( 'DOT/Vector2' );

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

    this.patternIndex = 0;

    this.lightRay = lightRay;
    this.modelViewTransform = modelViewTransform;

    this.patterns = [];
    this.patterns.push( new Pattern( waveImage ) );
    this.patterns.push( new Pattern( knobImage ) );
    //Set the path based on the light ray shape
    //PPath that shows the oscillating wave view for the LightRay
    this.wavePath = new Path( modelViewTransform.modelToViewShape( lightRay.getWaveShape() ), {
      stroke: 'red', fill: this.patterns[ this.patternIndex ]
    } );
    this.addChild( this.wavePath );

    // todo: need to add  gradient to waves
  }

  return inherit( Node, LightWaveNode, {
    step: function() {
      // just change the pattern index property;
      //this.patternIndex = (this.patternIndex + 1) % this.patterns.length;
      //this.wavePath.fill = this.patterns[ this.patternIndex ];
      var newPos = this.wavePath.getTranslation().plus( this.modelViewTransform.modelToViewDelta( Vector2.createPolar( this.lightRay.wavelength / 60, this.lightRay.getAngle() ) ) );
      this.wavePath.setTranslation( newPos.x, newPos.y );

    }
  } );
} );

