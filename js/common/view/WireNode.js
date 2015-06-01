// Copyright 2002-2015, University of Colorado Boulder

/**
 * View that connects a sensor (the probe) to its body (where the readout appears)
 *
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
   * @param {Property<Vector2>} probePositionProperty
   * @param {Property<Vector2>} bodyPositionProperty
   * @param {Node} probeNode
   * @param {Node} bodyNode
   * @param {Color} color
   * @constructor
   */
  function WireNode( probePositionProperty, bodyPositionProperty, probeNode, bodyNode, color ) {

    this.probeNode = probeNode;
    this.bodyNode = bodyNode;
    this.color = color;
    CanvasNode.call( this, {
      canvasBounds: new Bounds2( 0, 0, 834, 504 )
    } );
    var wireNode = this;
    bodyPositionProperty.link( function() {
      wireNode.invalidatePaint();
    } );
    probePositionProperty.link( function() {
      wireNode.invalidatePaint();
    } );
  }

  return inherit( CanvasNode, WireNode, {

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