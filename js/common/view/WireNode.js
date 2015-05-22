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
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

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

    var wireNode = this;
    Path.call( wireNode, new Shape(), {
      stroke: color,
      lineWidth: 5,
      lineCap: 'square',
      lineJoin: 'round',
      pickable: false // no need to drag the wire, and we don't want to do cubic-curve intersection here, or have it get in the way
    } );

    var updateCurve = function() {
      var bodyNodeScaleVector = bodyNode.getScaleVector();
      var probeNodeScaleVector = probeNode.getScaleVector();
      wireNode.lineWidth = 5 * bodyNodeScaleVector.x;

      // connect left-center of body to bottom-center of probe.
      var bodyConnectionPointX = bodyNode.x;
      var bodyConnectionPointY = bodyNode.centerY;
      var probeConnectionPointX = probeNode.centerX;
      var probeConnectionPointY = probeNode.bottom;

      var connectionPointXOffsetFactor = 40;
      wireNode.shape = new Shape()
        .moveTo( bodyConnectionPointX, bodyConnectionPointY )
        .cubicCurveTo( bodyConnectionPointX - connectionPointXOffsetFactor * bodyNodeScaleVector.x,
        bodyConnectionPointY,
        probeConnectionPointX,
        probeConnectionPointY + connectionPointXOffsetFactor * probeNodeScaleVector.x,
        probeConnectionPointX, probeConnectionPointY );
    };

    bodyPositionProperty.link( updateCurve );
    probePositionProperty.link( updateCurve );
  }

  return inherit( Path, WireNode );
} );