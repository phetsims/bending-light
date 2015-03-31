// Copyright 2002-2015, University of Colorado
/**
 * Base class for Bending Light
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Property = require( 'AXON/Property' );
  var LaserNode = require( 'BENDING_LIGHT/common/view/LaserNode' );
  var LaserView = require( 'BENDING_LIGHT/common/view/LaserView' );
  var RotationDragHandle = require( 'BENDING_LIGHT/common/view/RotationDragHandle' );
  var TranslationDragHandle = require( 'BENDING_LIGHT/common/view/TranslationDragHandle' );
  var WaveCanvasNode = require( 'BENDING_LIGHT/intro/view/WaveCanvasNode' );
  var WhiteLightNode = require( 'BENDING_LIGHT/prisms/view/WhiteLightNode' );
  //Font for labels in controls
  var labelFont = new PhetFont( 16 );

  /**
   *
   * @param model
   * @param clampDragAngle
   * @param clockwiseArrowNotAtMax
   * @param ccwArrowNotAtMax
   * @param showNormal
   * @param laserTranslationRegion
   * @param laserRotationRegion
   * @param laserImageName
   * @param centerOffsetLeft
   * @constructor
   */
  function BendingLightView( model, clampDragAngle, clockwiseArrowNotAtMax,
                             ccwArrowNotAtMax, showNormal, laserTranslationRegion, laserRotationRegion,
                             laserImageName, centerOffsetLeft ) {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 834, 504 ) } );

    var bendingLightView = this;
    this.showProtractorProperty = new BooleanProperty( true );
    this.model = model;
    this.lightRayLayer = new Node();
    this.lightWaveLayer = new Node();
    this.laserView = new LaserView( model, false );

    //In order to make controls (including the laser itself) accessible (not obscured by the large protractor), KP suggested this layering order:
    //laser on top
    //Control boxes next
    //Protractor
    //Laser beam
    //To implement this, we specify before light layer and 2 after light layers
    this.beforeLightLayer = new Node();
    //in back of afterLightLayer2
    this.afterLightLayer = new Node();
    this.afterLightLayer2 = new Node();

    this.showNormal = new BooleanProperty( showNormal );
    // Root of our scene graph
    var rootNode = new Node();
    this.addChild( rootNode );
    var stageWidth = 834;
    var stageHeight = 504;

    //Use the model aspect ratio and specified stage width to create the stage dimension
    this.stageSize = new Dimension2( stageWidth, stageHeight );
    //Center the stage in the canvas, specifies how things scale up and down with window size, maps stage to pixels
    //Create the transform from model (SI) to view (stage) coordinates
    var scale = this.stageSize.height / this.model.getHeight();
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 300, stageHeight / 2 ), scale );

    //Create and add the graphic for the environment medium
    this.mediumNode = new Node();
    this.addChild( this.mediumNode );
    this.incidentWaveCanvasLayer = new Node();

    this.whiteLightNode = new WhiteLightNode( this.lightRayLayer, this.stageSize.width, this.stageSize.height );
    //layering
    this.addChild( this.beforeLightLayer );
    this.addChild( this.lightRayLayer );
    this.addChild( this.lightWaveLayer );
    this.waveCanvasLayer = new Node();
    this.addChild( this.waveCanvasLayer );
    this.addChild( this.incidentWaveCanvasLayer );
    this.addChild( this.whiteLightNode );
    this.addChild( this.afterLightLayer );
    this.addChild( this.afterLightLayer2 );

    //Switch between light renderers for white vs nonwhite light
    model.getLaser().colorModeProperty.link( function( color ) {
      var white = color === 'white';
      bendingLightView.whiteLightNode.setVisible( white );
      bendingLightView.lightRayLayer.setVisible( !white );
      bendingLightView.lightWaveLayer.setVisible( !white );
    } );

    //Add rotation for the laser that show if/when the laser can be rotated
    // about its pivot
    var showRotationDragHandlesProperty = new Property( false );
    var showTranslationDragHandlesProperty = new Property( false );

    this.addChild( new RotationDragHandle( this.modelViewTransform, model.getLaser(), Math.PI / 22, showRotationDragHandlesProperty, clockwiseArrowNotAtMax ) );
    this.addChild( new RotationDragHandle( this.modelViewTransform, model.getLaser(), -Math.PI / 22, showRotationDragHandlesProperty, ccwArrowNotAtMax ) );

    //Add translation indicators that show if/when the laser can be moved by dragging
    var arrowLength = 100;
    this.addChild( new TranslationDragHandle( this.modelViewTransform, model.getLaser(), -arrowLength, 0, showTranslationDragHandlesProperty ) );
    this.addChild( new TranslationDragHandle( this.modelViewTransform, model.getLaser(), 0, -arrowLength, showTranslationDragHandlesProperty ) );
    this.addChild( new TranslationDragHandle( this.modelViewTransform, model.getLaser(), arrowLength, 0, showTranslationDragHandlesProperty ) );
    this.addChild( new TranslationDragHandle( this.modelViewTransform, model.getLaser(), 0, arrowLength, showTranslationDragHandlesProperty ) );

    //Add the laser itself
    var laserNode = new LaserNode( this.modelViewTransform, model.getLaser(), showRotationDragHandlesProperty, showTranslationDragHandlesProperty, clampDragAngle, laserTranslationRegion, laserRotationRegion, laserImageName/* model.visibleModelBounds */ );
    this.addChild( laserNode );
    model.laserViewProperty.link( function() {
      model.laser.wave = (model.laserViewProperty.value === 'wave');
    } );

    model.rays.addItemAddedListener( function( ray ) {
      var node;
      if ( model.laserViewProperty.value === 'ray' ) {
        node = bendingLightView.laserView.rayNode.createNode( bendingLightView.modelViewTransform, ray );
        bendingLightView.lightRayLayer.addChild( node );
      }
      else {
        /// node = bendingLightView.laserView.waveNode.createNode( bendingLightView.modelViewTransform, ray );
        //  bendingLightView.lightWaveLayer.addChild( node );
        var points;
        var minX;
        var minY;
        var maxX;
        var maxY;
        var reflectedRaMinY;
        var reflectedRayMaxY;
        for ( var k = 0; k < model.rays.length; k++ ) {
          points = model.rays.get( k ).getWaveBounds();
          minX = bendingLightView.modelViewTransform.modelToViewX( points[ 1 ].x );
          reflectedRaMinY = bendingLightView.modelViewTransform.modelToViewY( points[ 2 ].y );
          maxX = bendingLightView.modelViewTransform.modelToViewX( points[ 3 ].x );
          reflectedRayMaxY = bendingLightView.modelViewTransform.modelToViewY( points[ 0 ].y );
          minY = bendingLightView.modelViewTransform.modelToViewY( points[ 0 ].y );
          maxY = bendingLightView.modelViewTransform.modelToViewY( points[ 2 ].y );
          minY = k === 1 ? reflectedRaMinY : minY;
          maxY = k === 1 ? reflectedRayMaxY : maxY;
          var particleCanvasNode = new WaveCanvasNode( model.rays.get( k ).particles, bendingLightView.modelViewTransform, {
            canvasBounds: new Bounds2( minX, minY, maxX, maxY ),
            clipArea: bendingLightView.modelViewTransform.modelToViewShape( model.rays.get( k ).getWaveShape() )
          } );
          k === 0 ? bendingLightView.incidentWaveCanvasLayer.addChild( particleCanvasNode ) : bendingLightView.waveCanvasLayer.addChild( particleCanvasNode );
        }
      }
    } );
    model.rays.addItemRemovedListener( function() {
      bendingLightView.lightRayLayer.removeAllChildren();
      bendingLightView.lightWaveLayer.removeAllChildren();
      bendingLightView.waveCanvasLayer.removeAllChildren();
      bendingLightView.incidentWaveCanvasLayer.removeAllChildren();
    } );


  }

  return inherit( ScreenView, BendingLightView, {},
    //statics
    {
      labelFont: labelFont
    } );
} );

