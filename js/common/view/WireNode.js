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
  var Vector2 = require( 'DOT/Vector2' );

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

    // re- usable vector
    var curveStartPoint = new Vector2( 0, 0 );
    var curveControlPoint1 = new Vector2( 0, 0 );
    var curveControlPoint2 = new Vector2( 0, 0 );
    var curveControlPoint3 = new Vector2( 0, 0 );

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

      curveControlPoint1.setXY( bodyConnectionPointX - connectionPointXOffsetFactor * bodyNodeScaleVector.x,
        bodyConnectionPointY );
      curveControlPoint2.setXY( probeConnectionPointX,
        probeConnectionPointY + connectionPointXOffsetFactor * probeNodeScaleVector.x );
      curveControlPoint3.setXY( probeConnectionPointX, probeConnectionPointY );
      curveStartPoint.setXY( bodyConnectionPointX, bodyConnectionPointY );

      wireNode.shape = new Shape()
        .moveToPoint( curveStartPoint )
        .cubicCurveToPoint( curveControlPoint1, curveControlPoint2, curveControlPoint3 );
    };

    bodyPositionProperty.link( updateCurve );
    probePositionProperty.link( updateCurve );
  }

  return inherit( Path, WireNode );
} );