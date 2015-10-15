// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the intensity meter, including its movable sensor and readout region (called the body).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var WireNode = require( 'BENDING_LIGHT/common/view/WireNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var ProbeNode = require( 'SCENERY_PHET/ProbeNode' );

  // strings
  var intensityString = require( 'string!BENDING_LIGHT/intensity' );

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {IntensityMeter} intensityMeter - model for the intensity meter
   * @param {Object} [options]
   * @constructor
   */
  function IntensityMeterNode( modelViewTransform, intensityMeter, options ) {

    var intensityMeterNode = this;
    Node.call( intensityMeterNode );
    this.modelViewTransform = modelViewTransform; // @public
    this.intensityMeter = intensityMeter;

    this.probeNode = new ProbeNode( { cursor: 'pointer' } );

    // add body node
    var rectangleWidth = 150;
    var rectangleHeight = 105;

    // adding outer rectangle
    var outerRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 5, 5, {
      stroke: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#408260' )
        .addColorStop( 1, '#005127' ),
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#06974C' )
        .addColorStop( 0.6, '#00773A' ),
      lineWidth: 2
    } );

    // second rectangle
    var innerRectangle = new Rectangle( 2, 2, rectangleWidth - 10, rectangleHeight - 10, 5, 5, {
      fill: '#008541',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );

    // adding inner rectangle
    var innerMostRectangle = new ShadedRectangle( new Bounds2( 10, 0, rectangleWidth * 0.8, rectangleHeight * 0.5 ), {
      baseColor: 'white',
      lightSource: 'rightBottom',
      centerX: innerRectangle.centerX,
      centerY: rectangleHeight * 0.6
    } );

    // Add a "Intensity" title to the body node
    var titleNode = new Text( intensityString, { font: new PhetFont( 20 ), fill: 'white' } );
    if ( titleNode.width > rectangleWidth - 15 ) {
      titleNode.scale( (rectangleWidth - 15) / titleNode.width );
    }

    // Add the reading to the body node
    var valueNode = new Text( intensityMeter.reading.getString(), {
      font: new PhetFont( 25 ),
      fill: 'black'
    } );

    // add up all the shapes to form a body node
    this.bodyNode = new Node( {
      children: [ outerRectangle, innerRectangle, innerMostRectangle, titleNode, valueNode ],
      cursor: 'pointer'
    } );
    titleNode.setTranslation( (this.bodyNode.getWidth() - titleNode.getWidth()) / 2, this.bodyNode.getHeight() * 0.23 );

    // displayed value
    intensityMeter.readingProperty.link( function() {
      valueNode.setText( intensityMeter.reading.getString() );
      valueNode.setTranslation(
        innerMostRectangle.centerX - valueNode.width / 2,
        innerMostRectangle.centerY + valueNode.height / 2
      );
    } );

    // Connect the sensor to the body with a gray wire
    this.wireNode = new WireNode( this.probeNode, this.bodyNode, 'gray' );

    intensityMeter.sensorPositionProperty.link( function( sensorPosition ) {
      intensityMeterNode.probeNode.translation = modelViewTransform.modelToViewPosition( sensorPosition );
      intensityMeterNode.updateWireShape();
    } );

    intensityMeter.bodyPositionProperty.link( function( bodyPosition ) {
      intensityMeterNode.bodyNode.translation = modelViewTransform.modelToViewPosition( bodyPosition );
      intensityMeterNode.updateWireShape();
    } );

    // add the components
    this.addChild( this.wireNode );
    this.addChild( this.probeNode );
    this.addChild( this.bodyNode );

    /**
     * @public - when the nodes are positioned by moving the node itself (for view layout), synchonize the model
     * Without this, when the body node is bumped out of the medium panels, it would have the wrong model location and
     * hence
     */
    this.syncModelFromView = function() {
      var sensorPosition = modelViewTransform.viewToModelPosition( intensityMeterNode.probeNode.translation );
      var bodyPosition = modelViewTransform.viewToModelPosition( intensityMeterNode.bodyNode.translation );

      intensityMeter.sensorPosition = sensorPosition;
      intensityMeter.bodyPosition = bodyPosition;
    };

    this.mutate( options );

    this.resetRelativeLocations();
    this.syncModelFromView();
  }

  return inherit( Node, IntensityMeterNode, {
    resetRelativeLocations: function() {
      this.bodyNode.center = this.probeNode.center.plusXY( 180, 0 );
      this.wireNode.updateWireShape();
    },
    updateWireShape: function() {
      this.wireNode.updateWireShape();
    }
  } );
} );