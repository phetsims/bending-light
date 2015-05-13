// Copyright 2002-2015, University of Colorado Boulder
/**
 * Base class for Bending Light
 *
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
  var Util = require( 'SCENERY/util/Util' );

  /**
   *
   * @param {BendingLightModel} model - main model of  the simulations
   * @param {function} clampDragAngle
   * @param {function} clockwiseArrowNotAtMax
   * @param {function} ccwArrowNotAtMax
   * @param {function} laserTranslationRegion
   * @param {function} laserRotationRegion
   * @param {string } laserImageName
   * @param {number} centerOffsetLeft
   * @constructor
   */
  function BendingLightView( model, clampDragAngle, clockwiseArrowNotAtMax,
                             ccwArrowNotAtMax, laserTranslationRegion, laserRotationRegion,
                             laserImageName, centerOffsetLeft ) {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 834, 504 ) } );

    var bendingLightView = this;
    this.showProtractorProperty = new Property( true );
    this.model = model;
    this.lightRayLayer = new Node();
    this.lightWaveLayer = new Node();
    this.laserView = new LaserView( model, false );

    //In order to make controls (including the laser itself) accessible (not obscured by the large protractor), KP
    // suggested this layering order:
    //laser on top
    //Control boxes next
    //Protractor
    //Laser beam
    //To implement this, we specify 2  before light layer and 2 after light layers
    this.beforeLightLayer = new Node();
    this.beforeLightLayer2 = new Node();

    // in back of afterLightLayer2
    this.afterLightLayer = new Node();
    this.afterLightLayer2 = new Node();

    var stageWidth = this.layoutBounds.width;
    var stageHeight = this.layoutBounds.height;


    // center the stage in the canvas, specifies how things scale up and down with window size, maps stage to pixels
    // create the transform from model (SI) to view (stage) coordinates
    var scale = stageHeight / this.model.getHeight();
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 388 - centerOffsetLeft, stageHeight / 2 ), scale );

    // create and add the graphic for the environment medium
    this.mediumNode = new Node();
    this.addChild( this.mediumNode );
    this.incidentWaveCanvasLayer = new Node();

    this.whiteLightNode = new WhiteLightNode( this.lightRayLayer, stageWidth, stageHeight);
    // layering
    this.addChild( this.beforeLightLayer2 );
    this.addChild( this.beforeLightLayer );
    this.addChild( this.lightRayLayer );
    this.addChild( this.lightWaveLayer );
    this.waveCanvasLayer = new Node();
    this.addChild( this.waveCanvasLayer );
    this.addChild( this.incidentWaveCanvasLayer );
    this.addChild( this.whiteLightNode );
    this.addChild( this.afterLightLayer );

    // This layer  is to add laser view control panel
    //  Note: this layer to make protractor behind laser view   panel and laser node on top of laser view panel.
    this.laserViewLayer = new Node();
    this.addChild( this.laserViewLayer );

    // switch between light render for white vs nonwhite light
    model.getLaser().colorModeProperty.link( function( color ) {
      var white = color === 'white';
      bendingLightView.whiteLightNode.setVisible( white );
      bendingLightView.lightRayLayer.setVisible( !white );
      bendingLightView.lightWaveLayer.setVisible( !white );
    } );

    // add rotation for the laser that show if/when the laser can be rotated
    // about its pivot
    var showRotationDragHandlesProperty = new Property( false );
    var showTranslationDragHandlesProperty = new Property( false );

    var leftRotationDragHandle = new RotationDragHandle( this.modelViewTransform, model.getLaser(), Math.PI / 25,
      showRotationDragHandlesProperty, clockwiseArrowNotAtMax );
    this.addChild( leftRotationDragHandle );
    var rightRotationDragHandle = new RotationDragHandle( this.modelViewTransform, model.getLaser(), -Math.PI / 25,
      showRotationDragHandlesProperty, ccwArrowNotAtMax );
    this.addChild( rightRotationDragHandle );

    // add translation indicators that show if/when the laser can be moved by dragging
    var arrowLength = 100;
    var leftTranslationDragHandle = new TranslationDragHandle( this.modelViewTransform, model.getLaser(), -arrowLength, 0,
      showTranslationDragHandlesProperty );
    this.addChild( leftTranslationDragHandle );
    var rightTranslationDragHandle = new TranslationDragHandle( this.modelViewTransform, model.getLaser(), 0, -arrowLength,
      showTranslationDragHandlesProperty );
    this.addChild( rightTranslationDragHandle );
    var topTranslationDragHandle = new TranslationDragHandle( this.modelViewTransform, model.getLaser(), arrowLength, 0,
      showTranslationDragHandlesProperty );
    this.addChild( topTranslationDragHandle );
    var bottomTranslationDragHandle = new TranslationDragHandle( this.modelViewTransform, model.getLaser(), 0, arrowLength,
      showTranslationDragHandlesProperty );
    this.addChild( bottomTranslationDragHandle );

    // Check to see if WebGL was prevented by a query parameter
    var disallowWebGL = phet.chipper.getQueryParameter( 'webgl' ) === 'false';

    // The mobile WebGL implementation will work with basic WebGL support
    var allowMobileWebGL = Util.checkWebGLSupport() && !disallowWebGL;

    // The unlimited-particle implementation will work only with OES_texture_float where writing to
    // float textures is supported.
    var allowWebGL = allowMobileWebGL && Util.checkWebGLSupport( [ 'OES_texture_float' ] );

    model.allowWebGL = allowWebGL;
    if ( allowWebGL ) {
      var waveWebGLNode = new WaveWebGLNode( bendingLightView.modelViewTransform,
        model.rays,
        bendingLightView.layoutBounds.width,
        bendingLightView.layoutBounds.height );
      bendingLightView.incidentWaveCanvasLayer.addChild( waveWebGLNode );
    }

    // add the laser
    var laserNode = new LaserNode( this.modelViewTransform, model.getLaser(), showRotationDragHandlesProperty,
      showTranslationDragHandlesProperty, clampDragAngle, laserTranslationRegion, laserRotationRegion, laserImageName,
      this.layoutBounds );
    this.addChild( laserNode );

    // add laser node  rotation  and translation  arrows in array  , for to move them to front of all other nodes in prism screen
    this.laserLayerArray = [ leftRotationDragHandle, rightRotationDragHandle, leftTranslationDragHandle,
      rightTranslationDragHandle, topTranslationDragHandle, bottomTranslationDragHandle, laserNode ];

    this.addChild( this.afterLightLayer2 );

    model.laserViewProperty.link( function() {
      model.laser.wave = (model.laserViewProperty.value === 'wave');
    } );


    model.rays.addItemAddedListener( function( ray ) {
      var node;
      if ( model.laserViewProperty.value === 'ray' ) {
        node = bendingLightView.laserView.createLightRayNode( bendingLightView.modelViewTransform, ray );
        bendingLightView.lightRayLayer.addChild( node );
      }
      else {
        if ( !allowWebGL ) {
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
      bendingLightView.lightWaveLayer.removeAllChildren();
      bendingLightView.waveCanvasLayer.removeAllChildren();
      if ( !allowWebGL ) {
        bendingLightView.incidentWaveCanvasLayer.removeAllChildren();
      }
    } );
  }

  return inherit( ScreenView, BendingLightView );
} );

