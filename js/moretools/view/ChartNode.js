/*
// Copyright 2002-2011, University of Colorado
*/
/**
 * Node that shows the chart in the "more tools" tab's intensity sensor.
 *
 * @author Sam Reid
 *//*

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Line2D = require( 'java.awt.geom.Line2D' );
  var Rectangle = require( 'KITE/Rectangle' );
  var ArrayList = require( 'java.util.ArrayList' );
  var BendingLightModel = require( 'edu.colorado.phet.bendinglight.model.BendingLightModel' );
  var Clock = require( 'edu.colorado.phet.common.phetcommon.model.clock.Clock' );
  var ClockAdapter = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter' );
  var ClockEvent = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockEvent' );
  var Property = require( 'AXON/Property' );
  var SimpleObserver = require( 'edu.colorado.phet.common.phetcommon.util.SimpleObserver' );
  var ModelViewTransform = require( 'edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform' );
  var RectangleUtils = require( 'edu.colorado.phet.common.phetcommon.view.util.RectangleUtils' );
  var PhetPPath = require( 'edu.colorado.phet.common.piccolophet.nodes.PhetPPath' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PClip = require( 'edu.umd.cs.piccolox.nodes.PClip' );
  var MAX_DT = require( 'edu.colorado.phet.bendinglight.model.BendingLightModel.MAX_DT' );//static
  var TIME_SPEEDUP_SCALE = require( 'edu.colorado.phet.bendinglight.model.BendingLightModel.TIME_SPEEDUP_SCALE' );//static
  var createRectangleMapping = require( 'edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform.createRectangleMapping' );//static

//stroke dash parameters
  var DASH_ON = 10;
  var DASH_OFF = 5;

  function ChartNode( clock, chartArea, series ) {
    //Mapping from model (SI) to chart coordinates

    //private
    this.transform;

    //private
    this.gridLines = new Node();

    // non-static inner class: SeriesNode
    var SeriesNode =
      //Node for drawing the series of points.

      //private
      define( function( require ) {
        function SeriesNode( s ) {
          addChild( new PhetPPath( new BasicStroke( 2 ), s.getColor() ).withAnonymousClassBody( {
            initializer: function() {
              s.path.addObserver( new SimpleObserver().withAnonymousClassBody( {
                update: function() {
                  setPathTo( transform.get().modelToView( s.toShape() ) );
                }
              } ) );
            }
          } ) );
        }

        return inherit( Node, SeriesNode, {} );
      } );
    // non-static inner class: GridLine
    var GridLine =
      //Draw a horizontal or vertical grid line
      define( function( require ) {
        function GridLine( x1, y1, x2, y2, //Have to model the phase to make it look like the grid line is moving
                           phase ) {
          var strokeWidth = 2;
          addChild( new PhetPPath( new BasicStroke( strokeWidth, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 1
          f, new float[ ]
          { DASH_ON, DASH_OFF }
        ,
          phase
        ),
          Color.lightGray
        ).
          withAnonymousClassBody( {
            initializer: function() {
              //Grid lines are dynamically generated and therefore do not need to observe the transform
              setPathTo( transform.get().modelToView( new Line2D.Number( x1, y1, x2, y2 ) ) );
            },
            //Provide a faster implementation because regenerating grid lines with original getPathBoundsWithStroke is too expensive
            getPathBoundsWithStroke: function() {
              return RectangleUtils.expand( getPathReference().getBounds2D(), strokeWidth, strokeWidth );
            }
          } )
        )
          ;
        }

        return inherit( Node, GridLine, {} );
      } );
    setPathTo( chartArea );
    setStroke( null );
    //Amount of time to show on the horizontal axis of the chart
    var timeWidth = 100 * MAX_DT / TIME_SPEEDUP_SCALE;
    var maxSampleCount = Math.ceil( timeWidth / BendingLightModel.MIN_DT );
    transform = new Property( createRectangleMapping( new Rectangle.Number( 0, -1, timeWidth, 2 ), chartArea ) );
    //Add nodes for the grid lines and serieses
    addChild( gridLines );
    for ( var s in series ) {
      addChild( new SeriesNode( s ) );
    }
    //Move over the view port as time passes
    clock.addClockListener( new ClockAdapter().withAnonymousClassBody( {
      simulationTimeChanged: function( clockEvent ) {
        //Update the mapping from model to chart
        var minTime = clock.getSimulationTime() - timeWidth;
        transform.set( createRectangleMapping( new Rectangle.Number( minTime, -1, timeWidth, 2 ), chartArea ) );
        //Clear grid lines and add them back in the new positions
        gridLines.removeAllChildren();
        //distance between vertical grid lines
        var verticalGridLineSpacing = timeWidth / 4;
        var verticalGridLineSpacingDelta = getDelta( verticalGridLineSpacing, clock );
        for ( var x = minTime - verticalGridLineSpacingDelta; x <= minTime + timeWidth; x += timeWidth / 4 ) {
          addVerticalLine( x );
        }
        //Add one horizontal grid line
        var horizontalGridLineDelta = getDelta( DASH_ON + DASH_OFF, clock );
        //horizontal axis
        gridLines.addChild( new GridLine( minTime - horizontalGridLineDelta, 0, minTime + timeWidth, 0, 0 ) );
        //You can confirm this is working by passing in maxSampleCount/2 instead of maxSampleCount and turning the DT down to MIN_DT
        for ( var s in series ) {
          s.keepLastSamples( maxSampleCount );
        }
      }
    } ) );
  }

  return inherit( PClip, ChartNode, {
//Compute the phase offset so that grid lines appear to be moving at the right speed

      //private
      getDelta: function( verticalGridLineSpacing, clock ) {
        var totalNumPeriods = clock.getSimulationTime() / verticalGridLineSpacing;
        //for computing the phase so we make the right number of grid lines
        var integralNumberOfPeriods = totalNumPeriods;
        return (totalNumPeriods - integralNumberOfPeriods) * verticalGridLineSpacing;
      },

      //private
      addVerticalLine: function( x ) {
        //-1 to +1 is far enough since in model coordinates
        gridLines.addChild( new GridLine( x, -1, x, 1, 0 ) );
      },
    },
//statics
    {
      DASH_ON: DASH_ON,
      DASH_OFF: DASH_OFF
    } );
} );

*/
