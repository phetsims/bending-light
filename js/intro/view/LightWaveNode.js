// Copyright 2002-2015, University of Colorado
/**
 * View for the light in "wave" form, i.e. oscillating with wave crests.
 *
 * @author Sam Reid\
 * @author Chandrashekar Bemagoni(Actual Concepts).
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );

  /**
   *
   * @param modelViewTransform
   * @param lightRay
   * @constructor
   */

  function LightWaveNode( modelViewTransform, lightRay ) {
    Node.call( this, { pickable: false } );

    //Set the path based on the light ray shape
    //PPath that shows the oscillating wave view for the LightRay
    var wavePath = new Path( modelViewTransform.modelToViewShape( lightRay.getWaveShape() ), {
      stroke: 'red', fill: 'blue'
    } );
    this.addChild( wavePath );

    // todo: need to add  gradient to waves
  }

  return inherit( Node, LightWaveNode );
} );

