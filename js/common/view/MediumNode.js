// Copyright 2002-2015, University of Colorado Boulder
/**
 * Graphic that draws a medium such as air, water, glass, etc.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {Property<Medium>} mediumProperty
   * @constructor
   */
  function MediumNode( modelViewTransform, mediumProperty ) {
    Node.call( this, { pickable: false } );  // user can't interact with the medium except through control panels.

    // add the shape that paints the medium
    var mediumRectangleNode = new Path( modelViewTransform.modelToViewShape( mediumProperty.value.shape ), {
      stroke: 'gray',
      fill: mediumProperty.value.color
    } );
    this.addChild( mediumRectangleNode );

    // Update whenever the medium changes
    mediumProperty.link( function( medium ) {
      mediumRectangleNode.fill = medium.color;
    } );
  }

  return inherit( Node, MediumNode );
} );
