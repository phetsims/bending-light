// Copyright 2015-2020, University of Colorado Boulder

/**
 * View for the intensity meter, including its movable sensor and readout region (called the body).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NodeProperty = require( 'SCENERY/util/NodeProperty' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const ProbeNode = require( 'SCENERY_PHET/ProbeNode' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );
  const WireNode = require( 'SCENERY_PHET/WireNode' );

  // strings
  const intensityString = require( 'string!BENDING_LIGHT/intensity' );

  // constants
  const NORMAL_DISTANCE = 25;
  const bodyNormalProperty = new Vector2Property( new Vector2( NORMAL_DISTANCE, 0 ) );
  const sensorNormalProperty = new Vector2Property( new Vector2( 0, NORMAL_DISTANCE ) );

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {IntensityMeter} intensityMeter - model for the intensity meter
   * @param {Object} [options]
   * @constructor
   */
  function IntensityMeterNode( modelViewTransform, intensityMeter, options ) {

    const self = this;
    Node.call( self );
    this.modelViewTransform = modelViewTransform; // @public (read-only)
    this.intensityMeter = intensityMeter;

    this.probeNode = new ProbeNode( { cursor: 'pointer', scale: 0.6 } );

    // add body node
    const rectangleWidth = 150;
    const rectangleHeight = 95;

    // adding outer rectangle
    const outerRectangle = new Rectangle( 0, 0, rectangleWidth, rectangleHeight, 5, 5, {
      stroke: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#408260' )
        .addColorStop( 1, '#005127' ),
      fill: new LinearGradient( 0, 0, 0, rectangleHeight )
        .addColorStop( 0, '#06974C' )
        .addColorStop( 0.6, '#00773A' ),
      lineWidth: 2
    } );

    // second rectangle
    const innerRectangle = new Rectangle( 2, 2, rectangleWidth - 10, rectangleHeight - 10, 5, 5, {
      fill: '#008541',
      centerX: outerRectangle.centerX,
      centerY: outerRectangle.centerY
    } );

    // adding inner rectangle
    const valueBackground = new ShadedRectangle( new Bounds2( 0, 0, rectangleWidth * 0.8, rectangleHeight * 0.4 ), {
      baseColor: 'white',
      lightSource: 'rightBottom',
      centerX: innerRectangle.centerX,
      top: 10
    } );

    // Add a "Intensity" title to the body node
    const titleNode = new Text( intensityString, {
      font: new PhetFont( 24 ),
      fill: 'white'
    } );
    if ( titleNode.width > rectangleWidth - 15 ) {
      titleNode.scale( ( rectangleWidth - 15 ) / titleNode.width );
    }

    // Add the reading to the body node
    const valueNode = new Text( intensityMeter.readingProperty.get().getString(), {
      font: new PhetFont( 25 ),
      fill: 'black',
      maxWidth: valueBackground.width * 0.85
    } );

    // add up all the shapes to form a body node
    this.bodyNode = new Node( {
      children: [ outerRectangle, innerRectangle, valueBackground, titleNode, valueNode ],
      cursor: 'pointer',
      scale: 0.6
    } );
    titleNode.bottom = innerRectangle.bottom - 3;
    titleNode.centerX = outerRectangle.centerX;

    // displayed value
    intensityMeter.readingProperty.link( function( reading ) {
      valueNode.setText( reading.getString() );
      valueNode.center = valueBackground.center;
    } );

    // Connect the sensor to the body with a gray wire
    const above = function( amount ) {
      return function( position ) {return position.plusXY( 0, -amount );};
    };

    const rightBottomProperty = new NodeProperty( this.bodyNode, 'bounds', 'rightBottom' );

    // @private
    this.wireNode = new WireNode(
      new DerivedProperty( [ rightBottomProperty ], above( 12 ) ), bodyNormalProperty,
      new NodeProperty( this.probeNode, 'bounds', 'centerBottom' ), sensorNormalProperty, {
        lineWidth: 3,
        stroke: 'gray'
      }
    );

    intensityMeter.sensorPositionProperty.link( function( sensorPosition ) {
      self.probeNode.translation = modelViewTransform.modelToViewPosition( sensorPosition );
    } );

    intensityMeter.bodyPositionProperty.link( function( bodyPosition ) {
      self.bodyNode.translation = modelViewTransform.modelToViewPosition( bodyPosition );
    } );

    // add the components
    this.addChild( this.wireNode );
    this.addChild( this.probeNode );
    this.addChild( this.bodyNode );

    /**
     * @public - when the nodes are positioned by moving the node itself (for view layout), synchonize the model
     * Without this, when the body node is bumped out of the medium panels, it would have the wrong model position and
     * hence
     */
    this.syncModelFromView = function() {
      const sensorPosition = modelViewTransform.viewToModelPosition( self.probeNode.translation );
      const bodyPosition = modelViewTransform.viewToModelPosition( self.bodyNode.translation );

      intensityMeter.sensorPositionProperty.value = sensorPosition;
      intensityMeter.bodyPositionProperty.value = bodyPosition;
    };

    this.mutate( options );

    this.resetRelativePositions();
    this.syncModelFromView();
  }

  bendingLight.register( 'IntensityMeterNode', IntensityMeterNode );

  return inherit( Node, IntensityMeterNode, {
    resetRelativePositions: function() {
      this.probeNode.center = this.bodyNode.center.plusXY( 90, -10 );
    }
  } );
} );
