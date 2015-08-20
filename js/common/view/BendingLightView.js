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
  var RotationDragHandle = require( 'BENDING_LIGHT/common/view/RotationDragHandle' );
  var TranslationDragHandle = require( 'BENDING_LIGHT/common/view/TranslationDragHandle' );
  var WaveCanvasNode = require( 'BENDING_LIGHT/intro/view/WaveCanvasNode' );
  var WaveWebGLNode = require( 'BENDING_LIGHT/intro/view/WaveWebGLNode' );
  var WhiteLightNode = require( 'BENDING_LIGHT/prisms/view/WhiteLightNode' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var SingleColorLightCanvasNode = require( 'BENDING_LIGHT/common/view/SingleColorLightCanvasNode' );

  // images
  var laserWithoutKnobImage = require( 'image!BENDING_LIGHT/laser.png' );
  var laserKnobImage = require( 'image!BENDING_LIGHT/laser_knob.png' );

  /**
   * @param {BendingLightModel} bendingLightModel - main model of the simulations
   * @param {function} clampDragAngle - function that limits the angle of laser to its bounds
   * @param {function} clockwiseArrowNotAtMax - shows whether laser at max angle
   * @param {function} ccwArrowNotAtMax - shows whether laser at min angle
   * @param {function} laserTranslationRegion - region that defines laser translation
   * @param {function} laserRotationRegion - region that defines laser rotation
   * @param {string} laserImageName - name of laser image
   * @param {number} centerOffsetLeft - amount of space that center to be shifted to left
   * @param {number} verticalOffset - how much to shift the model view transform in stage coordinates
   * @param {function} occlusionHandler - function that will move objects out from behind a control panel if dropped there
   * @constructor
   */
  function BendingLightView( bendingLightModel, clampDragAngle, clockwiseArrowNotAtMax, ccwArrowNotAtMax, laserTranslationRegion,
                             laserRotationRegion, laserImageName, centerOffsetLeft, verticalOffset, occlusionHandler ) {

    this.occlusionHandler = occlusionHandler;
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 834, 504 ) } );

    var bendingLightView = this;
    this.showProtractorProperty = new Property( true ); // @public
    this.lightRayLayer = new Node(); // @public

    // In order to make controls (including the laser itself) accessible (not obscured by the large protractor), KP
    // suggested this layering order:
    // laser on top
    // Control boxes next
    // Protractor
    // Laser beam
    // To implement this, we specify 2 before light layers and 2 after light layers
    this.beforeLightLayer = new Node(); // @public
    this.beforeLightLayer2 = new Node(); // @public

    // in back of afterLightLayer2
    this.afterLightLayer = new Node(); // @public
    this.afterLightLayer2 = new Node(); // @public

    var stageWidth = this.layoutBounds.width;
    var stageHeight = this.layoutBounds.height;

    // center the stage in the canvas, specifies how things scale up and down with window size, maps stage to pixels
    // create the transform from model (SI) to view (stage) coordinates
    var scale = stageHeight / bendingLightModel.modelHeight;

    // @public, read only
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( 0, 0 ),
      new Vector2( 388 - centerOffsetLeft, stageHeight / 2 + verticalOffset ),
      scale
    );

    // create and add the graphic for the environment medium
    this.mediumNode = new Node(); // @public
    this.addChild( this.mediumNode );
    this.incidentWaveCanvasLayer = new Node(); // @public
    this.whiteLightNode = new WhiteLightNode( this.modelViewTransform, bendingLightModel.rays, stageWidth, stageHeight );

    this.singleColorLightCanvasNode = new SingleColorLightCanvasNode( this.modelViewTransform, stageWidth, stageHeight, bendingLightModel.rays );

    // layering
    this.addChild( this.beforeLightLayer2 );
    this.addChild( this.beforeLightLayer );
    this.addChild( this.lightRayLayer );
    this.addChild( this.singleColorLightCanvasNode );
    this.waveCanvasLayer = new Node(); // @public
    this.addChild( this.waveCanvasLayer );
    this.addChild( this.incidentWaveCanvasLayer );
    this.addChild( this.whiteLightNode );
    this.addChild( this.afterLightLayer );

    // This layer is to add laser view control panel
    // Note: this layer to make protractor behind laser view panel and laser node on top of laser view panel.
    this.laserViewLayer = new Node(); // @public
    this.addChild( this.laserViewLayer );

    // switch between light render for white vs nonwhite light
    bendingLightModel.laser.colorModeProperty.link( function( color ) {
      var white = color === 'white';
      bendingLightView.whiteLightNode.setVisible( white );
      bendingLightView.lightRayLayer.setVisible( !white );
    } );

    // Used for radius and length of drag handlers
    var laserImageWidth = laserWithoutKnobImage.width;

    // add rotation for the laser that show if/when the laser can be rotated about its pivot
    var showRotationDragHandlesProperty = new Property( false );
    var showTranslationDragHandlesProperty = new Property( false );

    // Shows the direction in which laser can be rotated
    var leftRotationDragHandle = new RotationDragHandle( this.modelViewTransform, bendingLightModel.laser, Math.PI / 23,
      showRotationDragHandlesProperty, clockwiseArrowNotAtMax, laserImageWidth * 0.58, bendingLightModel.rotationArrowAngleOffset );
    this.addChild( leftRotationDragHandle );
    var rightRotationDragHandle = new RotationDragHandle( this.modelViewTransform, bendingLightModel.laser, -Math.PI / 23,
      showRotationDragHandlesProperty, ccwArrowNotAtMax, laserImageWidth * 0.58, bendingLightModel.rotationArrowAngleOffset );
    this.addChild( rightRotationDragHandle );

    // add translation indicators that show if/when the laser can be moved by dragging
    var arrowLength = 76;
    var horizontalTranslationDragHandle = new TranslationDragHandle( this.modelViewTransform, bendingLightModel.laser, arrowLength, 0,
      showTranslationDragHandlesProperty, laserImageWidth );
    this.addChild( horizontalTranslationDragHandle );
    var verticalTranslationDragHandle = new TranslationDragHandle( this.modelViewTransform, bendingLightModel.laser, 0, arrowLength,
      showTranslationDragHandlesProperty, laserImageWidth );
    this.addChild( verticalTranslationDragHandle );

    // if WebGL is supported add WaveWebGLNode otherwise wave is rendered with the canvas.
    if ( bendingLightModel.allowWebGL ) {
      var waveWebGLNode = new WaveWebGLNode( bendingLightView.modelViewTransform,
        bendingLightModel.rays,
        bendingLightView.layoutBounds.width,
        bendingLightView.layoutBounds.height );
      bendingLightView.incidentWaveCanvasLayer.addChild( waveWebGLNode );
    }

    // add the laser
    var laserImage = (laserImageName === 'laser') ? laserWithoutKnobImage : laserKnobImage;
    var laserNode = new LaserNode( this.modelViewTransform, bendingLightModel.laser, showRotationDragHandlesProperty,
      showTranslationDragHandlesProperty, clampDragAngle, laserTranslationRegion, laserRotationRegion, laserImage,
      this.layoutBounds,
      occlusionHandler
    );
    this.addChild( laserNode );

    // add laser node rotation and translation arrows in array, for to move them to front of all other nodes in prism screen
    this.laserLayerArray = [ leftRotationDragHandle, rightRotationDragHandle, horizontalTranslationDragHandle,
      verticalTranslationDragHandle, laserNode ];

    this.addChild( this.afterLightLayer2 );

    // switches between ray and wave
    bendingLightModel.laserViewProperty.link( function( laserView ) {
      bendingLightModel.laser.wave = (laserView === 'wave');
    } );

    Property.multilink( [ bendingLightModel.laser.colorModeProperty, bendingLightModel.laserViewProperty ],
      function( colorMode, laserView ) {
        bendingLightView.singleColorLightCanvasNode.visible = laserView === 'ray' && colorMode !== 'white';
      }
    );

    // As rays are added to the model add corresponding light rays WhiteLight/Ray/Wave
    bendingLightModel.rays.addItemAddedListener( function( ray ) {
      if ( !(bendingLightModel.laserView === 'ray' && bendingLightModel.laser.colorMode === 'singleColor' ) ) {
        if ( !bendingLightModel.allowWebGL ) {
          for ( var k = 0; k < bendingLightModel.rays.length; k++ ) {
            var waveShape = bendingLightModel.rays.get( k ).waveShape;
            var particleCanvasNode = new WaveCanvasNode( bendingLightModel.rays.get( k ).particles,
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

    // As rays are removed from model clear all light ray layers
    bendingLightModel.rays.addItemRemovedListener( function() {
      bendingLightView.lightRayLayer.removeAllChildren();
      bendingLightView.waveCanvasLayer.removeAllChildren();
      if ( !bendingLightModel.allowWebGL ) {
        bendingLightView.incidentWaveCanvasLayer.removeAllChildren();
      }
    } );  

    this.events.on( 'layoutFinished', function( dx, dy, width, height ) {
        bendingLightView.singleColorLightCanvasNode.setCanvasBounds( new Bounds2( -dx, -dy, width - dx, height - dy ) );
      }
    );
  }

  return inherit( ScreenView, BendingLightView, {

    // @protected - intended to be overriden by subclasses
    step: function() {
      if ( this.singleColorLightCanvasNode.visible ) {
        this.singleColorLightCanvasNode.step();
      }
    }
  } );
} );