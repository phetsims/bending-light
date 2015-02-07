// Copyright 2002-2011, University of Colorado
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
  var Color = require( 'SCENERY/util/Color' );
  var Node = require( 'SCENERY/nodes/Node' );


  /**
   *
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {Property<Medium>} mediumProperty
   * @constructor
   */
  function MediumNode( modelViewTransform, mediumProperty ) {
    Node.call( this );
    //Add the shape that paints the medium
    var color = mediumProperty.value.color;
    var mediumRectangleNode = new Path( modelViewTransform.modelToViewShape( mediumProperty.value.shape ),
      {
        stroke: 'gray',
        fill: new Color( color.getRed(), color.getGreen(), color.getBlue() )
      } );
    this.addChild( mediumRectangleNode );
    mediumProperty.link( function( medium ) {
      mediumRectangleNode.fill = new Color( medium.color.getRed(), medium.color.getGreen(), medium.color.getBlue() )
    } )
  }

  return inherit( Node, MediumNode, {} );
} );

