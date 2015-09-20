// Copyright 2002-2015, University of Colorado Boulder

/**
 * View that connects a sensor (the probe) to its body (where the readout appears)
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var Bounds2 = require( 'DOT/Bounds2' );

  /**
   * Wire that connects the body and probe.
   *
   * @param {Property.<Vector2>} probePositionProperty - specifies probe position
   * @param {Property.<Vector2>} bodyPositionProperty - specifies body position
   * @param {Node} probeNode - node from where the wire connected
   * @param {Node} bodyNode - node to where the wire connected
   * @param {Color} color - color of the wire
   * @constructor
   */
  function WireCanvasNode( probePositionProperty, bodyPositionProperty, probeNode, bodyNode, color ) {

    this.probeNode = probeNode; // @public
    this.bodyNode = bodyNode; // @public
    this.color = color; // @public
    CanvasNode.call( this, {
      canvasBounds: new Bounds2( -100, 0, 834, 604 )
    } );
    var wireNode = this;

    // update the wire when body position changes
    bodyPositionProperty.link( function() {
      wireNode.invalidatePaint();
    } );

    // update the wire when probe position changes
    probePositionProperty.link( function() {
      wireNode.invalidatePaint();
    } );
  }

  return inherit( CanvasNode, WireCanvasNode, {

    /**
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      context.beginPath();

      var bodyNodeScaleVector = this.bodyNode.getScaleVector();
      var probeNodeScaleVector = this.probeNode.getScaleVector();
      var lineWidth = 5 * bodyNodeScaleVector.x;

      // connect left-center of body to bottom-center of probe.
      var bodyConnectionPointX = this.bodyNode.x;
      var bodyConnectionPointY = this.bodyNode.centerY;
      var probeConnectionPointX = this.probeNode.centerX;
      var probeConnectionPointY = this.probeNode.bottom;

      var connectionPointXOffsetFactor = 40;

      context.moveTo( bodyConnectionPointX, bodyConnectionPointY );
      context.bezierCurveTo(
        bodyConnectionPointX - connectionPointXOffsetFactor * bodyNodeScaleVector.x, bodyConnectionPointY,
        probeConnectionPointX, probeConnectionPointY + connectionPointXOffsetFactor * probeNodeScaleVector.x,
        probeConnectionPointX, probeConnectionPointY );
      context.lineWidth = lineWidth;
      context.lineCap = 'square';
      context.lineJoin = 'round';
      context.strokeStyle = this.color;
      context.stroke();
      context.closePath();
    }
  } );
} );