// Copyright 2002-2015, University of Colorado
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
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * Wire that connects the body and probe.
   *
   * @param {Property<Vector2>}probePositionProperty
   * @param {Property<Vector2>} bodyPositionProperty
   * @param {Node} probeNode
   * @param {Node} bodyNode
   * @param color
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

      // Connect left-center of body to bottom-center of probe.
      var bodyConnectionPoint = new Vector2( bodyNode.x, bodyNode.centerY );
      var probeConnectionPoint = new Vector2( probeNode.centerX, probeNode.bottom );

      wireNode.shape = new Shape()
        .moveTo( bodyConnectionPoint.x, bodyConnectionPoint.y )
        .cubicCurveTo( bodyConnectionPoint.x - 30, bodyConnectionPoint.y, probeConnectionPoint.x, probeConnectionPoint.y + 30, probeConnectionPoint.x, probeConnectionPoint.y );
    };

    bodyPositionProperty.link( updateCurve );
    probePositionProperty.link( updateCurve );
  }

  return inherit( Path, WireNode );
} );
