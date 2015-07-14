// Copyright 2002-2015, University of Colorado Boulder

/**
 * Base class for Bending Light
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var LaserNode = require( 'BENDING_LIGHT/common/view/LaserNode' );
  var LaserView = require( 'BENDING_LIGHT/common/view/LaserView' );
  var RotationDragHandle = require( 'BENDING_LIGHT/common/view/RotationDragHandle' );
  var TranslationDragHandle = require( 'BENDING_LIGHT/common/view/TranslationDragHandle' );
  var WaveCanvasNode = require( 'BENDING_LIGHT/intro/view/WaveCanvasNode' );
  var WaveWebGLNode = require( 'BENDING_LIGHT/intro/view/WaveWebGLNode' );
  var WhiteLightNode = require( 'BENDING_LIGHT/prisms/view/WhiteLightNode' );
  var ObservableArray = require( 'AXON/ObservableArray' );

  /**
   *
   * @param {BendingLightModel} model - main model of the simulations
   * @param {function} clampDragAngle - function that limits the angle of laser to its bounds
   * @param {function} clockwiseArrowNotAtMax - shows whether laser at max angle
   * @param {function} ccwArrowNotAtMax - shows whether laser at min angle
   * @param {function} laserTranslationRegion - region that defines laser translation
   * @param {function} laserRotationRegion - region that defines laser rotation
   * @param {string } laserImageName - name of laser image
   * @param {number} centerOffsetLeft - amount of space that center to be shifted to left
   * @constructor
   */
  function BendingLightView( model, clampDragAngle, clockwiseArrowNotAtMax, ccwArrowNotAtMax, laserTranslationRegion,
                             laserRotationRegion, laserImageName, centerOffsetLeft ) {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 834, 504 ) } );

    var bendingLightView = this;
    this.showProtractorProperty = new Property( true );
    this.lightRayLayer = new Node();
    this.laserView = new LaserView( model, false );

    // In order to make controls (including the laser itself) accessible (not obscured by the large protractor), KP
    // suggested this layering order:
    // laser on top
    // Control boxes next
    // Protractor
    // Laser beam
    // To implement this, we specify 2  before light layer and 2 after light layers
    this.beforeLightLayer = new Node();
    this.beforeLightLayer2 = new Node();

    // in back of afterLightLayer2
    this.afterLightLayer = new Node();
    this.afterLightLayer2 = new Node();

    var stageWidth = this.layoutBounds.width;
    var stageHeight = this.layoutBounds.height;

    // center the stage in the canvas, specifies how things scale up and down with window size, maps stage to pixels
    // create the transform from model (SI) to view (stage) coordinates
    var scale = stageHeight / model.modelHeight;
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 388 - centerOffsetLeft, stageHeight / 2 ), scale );

    // create and add the graphic for the environment medium
    this.mediumNode = new Node();
    this.addChild( this.mediumNode );
    this.incidentWaveCanvasLayer = new Node();
    var whiteLightRays = new ObservableArray();
    this.whiteLightNode = new WhiteLightNode( this.modelViewTransform, whiteLightRays, stageWidth, stageHeight );
    // layering
    this.addChild( this.beforeLightLayer2 );
    this.addChild( this.beforeLightLayer );
    this.addChild( this.lightRayLayer );
    this.waveCanvasLayer = new Node();
    this.addChild( this.waveCanvasLayer );
    this.addChild( this.incidentWaveCanvasLayer );
    this.addChild( this.whiteLightNode );
    this.addChild( this.afterLightLayer );

    // This layer  is to add laser view control panel
    // Note: this layer to make protractor behind laser view   panel and laser node on top of laser view panel.
    this.laserViewLayer = new Node();
    this.addChild( this.laserViewLayer );

    // switch between light render for white vs nonwhite light
    model.laser.colorModeProperty.link( function( color ) {
      var white = color === 'white';
      bendingLightView.whiteLightNode.setVisible( white );
      bendingLightView.lightRayLayer.setVisible( !white );
    } );

    // add rotation for the laser that show if/when the laser can be rotated about its pivot
    var showRotationDragHandlesProperty = new Property( false );
    var showTranslationDragHandlesProperty = new Property( false );

    var leftRotationDragHandle = new RotationDragHandle( this.modelViewTransform, model.laser, Math.PI / 25,
      showRotationDragHandlesProperty, clockwiseArrowNotAtMax );
    this.addChild( leftRotationDragHandle );
    var rightRotationDragHandle = new RotationDragHandle( this.modelViewTransform, model.laser, -Math.PI / 25,
      showRotationDragHandlesProperty, ccwArrowNotAtMax );
    this.addChild( rightRotationDragHandle );

    // add translation indicators that show if/when the laser can be moved by dragging
    var arrowLength = 76;
    var horizontalTranslationDragHandle = new TranslationDragHandle( this.modelViewTransform, model.laser, arrowLength, 0,
      showTranslationDragHandlesProperty );
    this.addChild( horizontalTranslationDragHandle );
    var verticalTranslationDragHandle = new TranslationDragHandle( this.modelViewTransform, model.laser, 0, arrowLength,
      showTranslationDragHandlesProperty );
    this.addChild( verticalTranslationDragHandle );

    if ( model.allowWebGL ) {
      var waveWebGLNode = new WaveWebGLNode( bendingLightView.modelViewTransform,
        model.rays,
        bendingLightView.layoutBounds.width,
        bendingLightView.layoutBounds.height );
      bendingLightView.incidentWaveCanvasLayer.addChild( waveWebGLNode );
    }

    // add the laser
    var laserNode = new LaserNode( this.modelViewTransform, model.laser, showRotationDragHandlesProperty,
      showTranslationDragHandlesProperty, clampDragAngle, laserTranslationRegion, laserRotationRegion, laserImageName,
      this.layoutBounds );
    this.addChild( laserNode );

    // add laser node  rotation  and translation  arrows in array  , for to move them to front of all other nodes in prism screen
    this.laserLayerArray = [ leftRotationDragHandle, rightRotationDragHandle, horizontalTranslationDragHandle,
      verticalTranslationDragHandle, laserNode ];

    this.addChild( this.afterLightLayer2 );

    model.laserViewProperty.link( function() {
      model.laser.wave = (model.laserViewProperty.value === 'wave');
    } );

    model.rays.addItemAddedListener( function( ray ) {
      var node;
      if ( model.laser.colorMode === 'white' ) {
        whiteLightRays.push( ray );
      }
      if ( model.laserViewProperty.value === 'ray' && model.laser.colorMode === 'singleColor' ) {
        node = bendingLightView.laserView.createLightRayNode( bendingLightView.modelViewTransform, ray );
        bendingLightView.lightRayLayer.addChild( node );
      }
      else {
        if ( !model.allowWebGL ) {
          for ( var k = 0; k < model.rays.length; k++ ) {
            var waveShape = model.rays.get( k ).getWaveShape();
            var particleCanvasNode = new WaveCanvasNode( model.rays.get( k ).particles,
              bendingLightView.modelViewTransform, {
                canvasBounds: bendingLightView.modelViewTransform.modelToViewShape( waveShape ).bounds,
                clipArea: bendingLightView.modelViewTransform.modelToViewShape( waveShape )
              } );
            k === 0 ? bendingLightView.incidentWaveCanvasLayer.addChild( particleCanvasNode ) :
            bendingLightView.waveCanvasLayer.addChild( particleCanvasNode );
          }
        }
      }
    } );
    model.rays.addItemRemovedListener( function() {
      bendingLightView.lightRayLayer.removeAllChildren();
      bendingLightView.waveCanvasLayer.removeAllChildren();
      if ( !model.allowWebGL ) {
        bendingLightView.incidentWaveCanvasLayer.removeAllChildren();
      }
      whiteLightRays.clear();
    } );
  }

  return inherit( ScreenView, BendingLightView );
} );