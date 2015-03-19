define( function( require ) {
  'use strict';

// modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   *
   * @param thumbnail
   * @param showProtractorProperty
   * @param modelViewTransform
   * @param canvas
   * @constructor
   */
  function ToolIconNode( thumbnail, showProtractorProperty, modelViewTransform, canvas ) {

    Node.call( this );
    var toolIconNode = this;
    this.showProtractorProperty = showProtractorProperty;
    this.modelViewTransform = modelViewTransform;
    this.canvas = canvas;
    this.node = null;
    this.intersect = false;

    canvas.afterLightLayer.addChild( thumbnail );
    this.showProtractorProperty.link( function( showProtractor ) {
      thumbnail.setVisible( !showProtractor );
    } );
    var start;
    var end;

    thumbnail.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        toolIconNode.showProtractorProperty.set( true );
        thumbnail.setVisible( false );

        if ( toolIconNode.node === null ) {
          start = thumbnail.globalToParentPoint( event.pointer.point );
          var nodeRef = canvas.createNode( modelViewTransform, showProtractorProperty, modelViewTransform.viewToModelX( start.x ), modelViewTransform.viewToModelX( start.y ) );
          toolIconNode.node = nodeRef;

          // var anyIntersection = false;
          /* for( var child in nodeRef.getDroppableComponents() ) {
           if ( canvas.toolboxNode.getBounds().intersectsBounds( child.getBounds() ) ) {
           anyIntersection = true;
           }
           }*/
          if ( canvas.toolboxNode.getBounds().intersectsBounds( nodeRef.getBounds() ) ) {
            toolIconNode.intersect = true;
          }
          canvas.afterLightLayer.addChild( nodeRef );
        }
      },
      drag: function( event ) {
        end = thumbnail.globalToParentPoint( event.pointer.point );
        toolIconNode.node.dragAll( end.minus( start ) );
      },
      end: function() {
        toolIconNode.intersect = canvas.toolboxNode.getBounds().intersectsBounds(
          toolIconNode.node.getBounds() );

        toolIconNode.testDropIn( toolIconNode.node );
      }

    } ) );
  }

  return inherit( Node, ToolIconNode, {
    //Remove the created node, if any
    reset: function() {
      //The node is removed in the resetModel listener above, this part just sets a flag to indicate that a new toolnode should be created
      this.node = null;
    },
    /**
     *
     * @param node
     */
    testDropIn: function( node ) {
      if ( this.intersect ) {
        //Update the model to signify the tool is out of the play area
        this.showProtractorProperty.set( false );

        //Show the thumbnail again so it can be dragged out again
        this.setVisible( true );

        if ( node !== null ) {
          this.canvas.afterLightLayer.removeChild( node );
        }
        //Remove the tool from the play area
        this.reset();
      }
    }
  } );
} );
