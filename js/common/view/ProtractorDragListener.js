//  Copyright 2002-2015, University of Colorado Boulder

/**
 * A tool is any node that can be dragged from a toolbox, carousel, panel, etc.
 *
 * TODO: This file is highly volatile and not ready for public consumption.  It is being actively developed
 * as part of https://github.com/phetsims/scenery-phet/issues/186 for work in Bending Light.  If it cannot be generalized
 * for usage in other simulations, it will be moved to Bending Light.  The API and implementation are subject to
 * change, and this disclaimer will be removed when the code is ready for review or usage.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );
  var Events = require( 'AXON/Events' );

  /**
   * Move a node from one parent to another but keeping it in exactly the same position/scale/orientation on the screen.
   * Require the oldParent explicitly rather than inferring it from the node to support multiparent nodes.
   * @param node
   * @param oldParent
   * @param newParent
   */
  var reparent = function( node, oldParent, newParent ) {
    var g1 = node.getLocalToGlobalMatrix();

    oldParent.removeChild( node );
    newParent.addChild( node );

    var p2 = newParent.getGlobalToLocalMatrix();

    var m2 = p2.timesMatrix( g1 );
    node.setMatrix( m2 );
  };

  /**
   * When the tool is dragged to/from the toolbox it shrinks/grows with animation.
   * @param node
   * @param scale
   * @param centerX
   * @param centerY
   * @returns {*}
   */
  var animateScale = function( node, scale, centerX, centerY ) {
    var parameters = {
      scale: node.getScaleVector().x,
      centerX: node.centerX,
      centerY: node.centerY
    }; // initial state, modified as the animation proceeds
    return new TWEEN.Tween( parameters )
      .easing( TWEEN.Easing.Cubic.InOut )
      .to( {
        scale: scale,
        centerX: centerX,
        centerY: centerY
      }, 200 )
      .onUpdate( function() {
        node.setScaleMagnitude( parameters.scale );
        node.center = new Vector2( parameters.centerX, parameters.centerY );
      } )
      .onComplete( function() {
      } )
      .start();
  };

  /**
   *
   * @constructor
   */
  function ProtractorDragListener( node, toolboxNode, playAreaNode, playAreaBoundsProperty, inToolbox, toolboxScale, playAreaScale,
                                   //
                                   // Function that determines where the object should animate to in the toolbox, when dropped back 
                                   // in the toolbox.  This must be a function since sometimes the place things go back to in the 
                                   // toolbox is different than where they came from, for instance in the Fractions sims stacks of 
                                   // cards
                                   getToolboxPosition ) {
    var events = new Events();

    // @public
    this.events = events;

    var inToolboxProperty = new Property( inToolbox );
    this.positionInToolbox = function() {
      node.setScaleMagnitude( inToolbox ? toolboxScale : playAreaScale );
      if ( getToolboxPosition ) {
        node.center = inToolbox ? getToolboxPosition() : node.center;
      }
    };

    var startOffset = null;

    var moveToToolbox = function() {
      reparent( node, playAreaNode, toolboxNode );
      inToolboxProperty.value = true;
      if ( getToolboxPosition ) {
        var toolboxPosition = getToolboxPosition();
        animateScale( node, toolboxScale, toolboxPosition.x, toolboxPosition.y );
      }
    };

    // @public {read-only}
    this.moveToToolbox = moveToToolbox;

    var options = {
      allowTouchSnag: true,
      start: function( event ) {
        var wasInToolbox = inToolboxProperty.value;
        inToolboxProperty.value = false;

        // Note the options.startDrag can change the locationProperty, so read it again above, see https://github.com/phetsims/scenery-phet/issues/157
        var location = node.getCenter();

        if ( wasInToolbox ) {
          startOffset = new Vector2( 0, 0 );
        }
        else {
          startOffset = node.globalToParentPoint( event.pointer.point ).minus( location );
        }

        if ( wasInToolbox && !inToolboxProperty.value ) {

          events.trigger( 'draggedOutOfToolbox', function() {
            reparent( node, toolboxNode, playAreaNode );

            var parentPoint = node.globalToParentPoint( event.pointer.point ).minus( startOffset );
            parentPoint = playAreaBoundsProperty.value.closestPointTo( parentPoint );

            animateScale( node, playAreaScale, parentPoint.x, parentPoint.y );
          } );
        }
      },
      drag: function( event ) {
        var parentPoint = node.globalToParentPoint( event.pointer.point ).minus( startOffset );
        parentPoint = playAreaBoundsProperty.value.closestPointTo( parentPoint );
        //self.events.trigger1( 'startedCallbacksForDragged', location );

        //locationProperty.set( location );
        node.setCenter( parentPoint );
        events.trigger( 'dragged' );

        //options.onDrag( event );

        //self.events.trigger0( 'endedCallbacksForDragged' );
      },
      end: function( event ) {

        // Drop into the toolbox.  But when there is no toolbox (when playAreaNode===toolboxNode) then do nothing.
        if ( toolboxNode !== playAreaNode && node.getGlobalBounds().intersectsBounds( toolboxNode.getGlobalBounds() ) ) {

          events.trigger( 'droppedInToolbox', moveToToolbox );
        }
        else {
          // TODO: should we use a named options callback or axon event here?  Precedent may be for the latter.
          events.trigger( 'droppedInThePlayArea' );
        }
      }
    };

    SimpleDragHandler.call( this, options );

    // If the drag bounds changes, make sure the protractor didn't go out of bounds
    playAreaBoundsProperty.link( function( playAreaBounds ) {
      node.center = playAreaBounds.getClosestPoint( node.centerX, node.centerY );
    } );

    /**
     *
     * @param {Bounds2} parentBounds -
     * @param {Bounds2} childBounds -
     * @return {Vector2} - a translation vector that moves the childBounds to fit within the parentBounds, null
     *                   - if it cannot fit or ZERO if it is already within bounds.
     */
      //var getTranslationVectorToMoveInBounds = function( parentBounds, childBounds ) {
      //  if ( parentBounds.containsBounds( childBounds ) ) {
      //    return Vector2.ZERO;
      //  }
      //  else if ( childBounds.width > parentBounds.width || childBounds.height > parentBounds.height ) {
      //    return null;
      //  }
      //  else {
      //    var dx = 0;
      //    var dy = 0;
      //    if ( childBounds.minX < parentBounds.minX ) {
      //      dx = parentBounds.minX - childBounds.minX;
      //    }else if (childBounds.)
      //  }
      //};
    this.resetProtractorDragListener = function() {
      if ( !inToolboxProperty.value ) {
        inToolboxProperty.value = true;
        reparent( node, playAreaNode, toolboxNode );

        node.setScaleMagnitude( toolboxScale );
        if ( getToolboxPosition ) {
          node.center = getToolboxPosition();
        }
      }
    };
  }

  return inherit( SimpleDragHandler, ProtractorDragListener, {

    /**
     * The ProtractorDragListener knows how to put tools back in the toolbox, so it has a reset method that can be used
     * to reset tools.
     * @public, Overrideable
     */
    reset: function() {
      this.resetProtractorDragListener();
    }
  } );
} );