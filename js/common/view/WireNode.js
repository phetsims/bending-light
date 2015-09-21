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
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  /**
   * Wire that connects the body and probe.
   *
   * @param {Node} probeNode - node from where the wire connected
   * @param {Node} bodyNode - node to where the wire connected
   * @param {Color} color - color of the wire
   * @constructor
   */
  function WireNode( probeNode, bodyNode, color ) {

    this.probeNode = probeNode; // @public
    this.bodyNode = bodyNode; // @public
    this.color = color; // @public

    Path.call( this, null, {
      lineWidth: 5 * bodyNode.getScaleVector().x,
      stroke: color
    } );
    var wireNode = this;

    this.updateWireShape = function() {

      // connect left-center of body to bottom-center of probe.
      var bodyConnectionPointX = bodyNode.x;
      var bodyConnectionPointY = bodyNode.centerY;
      var probeConnectionPointX = probeNode.centerX;
      var probeConnectionPointY = probeNode.bottom;

      var connectionPointXOffsetFactor = 40;

      wireNode.shape = new Shape()
        .moveTo( bodyConnectionPointX, bodyConnectionPointY )
        .cubicCurveTo(
          bodyConnectionPointX - connectionPointXOffsetFactor, bodyConnectionPointY,
          probeConnectionPointX, probeConnectionPointY + connectionPointXOffsetFactor,
          probeConnectionPointX, probeConnectionPointY
        );
    };
  }

  return inherit( Path, WireNode );
} );