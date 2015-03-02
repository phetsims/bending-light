/*
// Copyright 2002-2012, University of Colorado
*/
/**
 * PNode for the wave sensor, which shows 2 sensor probes and a chart area (the body)
 *
 * @author Sam Reid
 *//*

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Rectangle = require( 'java.awt.Rectangle' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var ArrayList = require( 'java.util.ArrayList' );
  var WireNode = require( 'edu.colorado.phet.bendinglight.view.WireNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var SimpleObserver = require( 'edu.colorado.phet.common.phetcommon.util.SimpleObserver' );
  var ModelViewTransform = require( 'edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var CursorHandler = require( 'edu.colorado.phet.common.piccolophet.event.CursorHandler' );
  var ToolNode = require( 'edu.colorado.phet.common.piccolophet.nodes.ToolNode' );
  var CanvasBoundedDragHandler = require( 'edu.colorado.phet.common.piccolophet.nodes.toolbox.CanvasBoundedDragHandler' );
  var DragEvent = require( 'edu.colorado.phet.common.piccolophet.nodes.toolbox.DragEvent' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PImage = require( 'edu.umd.cs.piccolo.nodes.PImage' );
  var PText = require( 'edu.umd.cs.piccolo.nodes.PText' );
  var PDimension = require( 'edu.umd.cs.piccolo.util.PDimension' );
  var RESOURCES = require( 'edu.colorado.phet.bendinglight.BendingLightApplication.RESOURCES' );//static
  var TIME = require( 'edu.colorado.phet.bendinglight.BendingLightStrings.TIME' );//static
  var white = require( 'java.awt.Color.white' );//static

  function WaveSensorNode( transform, waveSensor ) {
    //color taken from the image
    this.darkProbeColor = new Color( 88, 89, 91 );
    this.lightProbeColor = new Color( 147, 149, 152 );

    //private
    this.transform;

    //private
    this.waveSensor;
    this.bodyNode;
    this.probe1Node;
    this.probe2Node;

    // non-static inner class: ProbeNode
    var ProbeNode =
      //Class for rendering a probe that can be used to sense wave values
      define( function( require ) {
        function ProbeNode( probe, imageName ) {
          //Draw the probe
          addChild( new PImage( RESOURCES.getImage( imageName ) ) );
          //Interaction: translates when dragged, but keep it bounded within the play area
          addInputEventListener( new CursorHandler() );
          addInputEventListener( new CanvasBoundedDragHandler( this ).withAnonymousClassBody( {
            dragNode: function( event ) {
              probe.translate( transform.viewToModelDelta( event.delta ) );
            }
          } ) );
          probe.position.addObserver( new SimpleObserver().withAnonymousClassBody( {
            update: function() {
              var viewPoint = transform.modelToView( probe.position.get() ).toPoint2D();
              setOffset( viewPoint.getX() - getFullBounds().getWidth() / 2, viewPoint.getY() - getFullBounds().getHeight() / 2 );
            }
          } ) );
        }

        return inherit( Node, ProbeNode, {} );
      } );
    this.transform = transform;
    this.waveSensor = waveSensor;
    //Bounds are based on the provided images, and will need to be updated if the image changes
    var titleBounds = new Rectangle( 63, 90, 37, 14 );
    var chartArea = new Rectangle( 15, 15, 131, 68 );
    //Create the body where the chart is shown
    bodyNode = new PImage( RESOURCES.getImage( "wave_detector_box.png" ) ).withAnonymousClassBody( {
      initializer: function() {
        //Add the "time" axis label at the bottom center of the chart
        addChild( new PText( TIME ).withAnonymousClassBody( {
          initializer: function() {
            setFont( new PhetFont( 18 ) );
            setTextPaint( white );
            setOffset( titleBounds.getCenterX() - getFullBounds().getWidth() / 2, titleBounds.getCenterY() - getFullBounds().getHeight() / 2 );
          }
        } ) );
        //Add the chart inside the body, with one series for each of the dark and light probes
        addChild( new ChartNode( waveSensor.clock, chartArea, [].withAnonymousClassBody( {
          initializer: function() {
            add( new Series( waveSensor.probe1.series, darkProbeColor ) );
            add( new Series( waveSensor.probe2.series, lightProbeColor ) );
          }
        } ) ) );
        //Synchronize the body position with the model (centered on the model point)
        waveSensor.bodyPosition.addObserver( new SimpleObserver().withAnonymousClassBody( {
          update: function() {
            var viewPoint = transform.modelToView( waveSensor.bodyPosition.get() ).toPoint2D();
            setOffset( viewPoint.getX() - getFullBounds().getWidth() / 2, viewPoint.getY() - getFullBounds().getHeight() );
          }
        } ) );
        //Add interaction, the body is draggable, but keep it constrained to stay in the play area
        addInputEventListener( new CursorHandler() );
        addInputEventListener( new CanvasBoundedDragHandler( WaveSensorNode.this ).withAnonymousClassBody( {
          dragNode: function( event ) {
            waveSensor.translateBody( transform.viewToModelDelta( event.delta ) );
          }
        } ) );
      }
    } );
    //Create the probes
    probe1Node = new ProbeNode( waveSensor.probe1, "wave_detector_probe_dark.png" );
    probe2Node = new ProbeNode( waveSensor.probe2, "wave_detector_probe_light.png" );
    //Rendering order, including wires
    addChild( new WireNode( probe1Node, bodyNode, darkProbeColor ) );
    addChild( new WireNode( probe2Node, bodyNode, lightProbeColor ) );
    addChild( bodyNode );
    addChild( probe1Node );
    addChild( probe2Node );
  }

  return inherit( ToolNode, WaveSensorNode, {
//Called when dragged out of the toolbox, drags all parts together (including body and probes)
    dragAll: function( delta ) {
      waveSensor.translateAll( new Vector2( transform.viewToModelDelta( delta ) ) );
    },
//When any probe or body is dropped in the toolbox, the whole WaveSensor goes back in the toolbox
    getDroppableComponents: function() {
      return new Node[ ]
      { bodyNode, probe1Node, probe2Node }
      ;
    },
  } );
} );

*/
