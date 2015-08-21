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
  var SingleColorLightCanvasNode = require( 'BENDING_LIGHT/common/view/SingleColorLightCanvasNode' );
  var SingleColorLightWebGLNode = require( 'BENDING_LIGHT/common/view/SingleColorLightWebGLNode' );

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
    this.bendingLightModel = bendingLightModel;
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 834, 504 ) } );

    var bendingLightView = this;
    this.showProtractorProperty = new Property( true ); // @public

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
    this.incidentWaveLayer = new Node(); // @public

    this.singleColorLightNode = bendingLightModel.allowWebGL ?
                                new SingleColorLightWebGLNode( this.modelViewTransform, stageWidth, stageHeight, bendingLightModel.rays ) :
                                new SingleColorLightCanvasNode( this.modelViewTransform, stageWidth, stageHeight, bendingLightModel.rays );

    // layering
    this.addChild( this.beforeLightLayer2 );
    this.addChild( this.beforeLightLayer );
    this.addChild( this.singleColorLightNode );
    this.addLightNodes(); // Nodes specific to that view
    this.addChild( this.afterLightLayer );

    // This layer is to add laser view control panel
    // Note: this layer to make protractor behind laser view panel and laser node on top of laser view panel.
    this.laserViewLayer = new Node(); // @public
    this.addChild( this.laserViewLayer );

    // Used for radius and length of drag handlers
    var laserImageWidth = laserWithoutKnobImage.width;

    // add rotation for the laser that show if/when the laser can be rotated about its pivot
    var showRotationDragHandlesProperty = new Property( false );
    var showTranslationDragHandlesProperty = new Property( false );

    // add laser node rotation and translation arrows in array, to move them to front of all other nodes in prism screen
    this.laserLayerArray = [];
    this.addLaserHandles( showRotationDragHandlesProperty, showTranslationDragHandlesProperty, clockwiseArrowNotAtMax, ccwArrowNotAtMax, laserImageWidth );

    // add the laser
    var laserImage = (laserImageName === 'laser') ? laserWithoutKnobImage : laserKnobImage;
    var laserNode = new LaserNode( this.modelViewTransform, bendingLightModel.laser, showRotationDragHandlesProperty,
      showTranslationDragHandlesProperty, clampDragAngle, laserTranslationRegion, laserRotationRegion, laserImage,
      this.layoutBounds,
      occlusionHandler
    );
    this.addChild( laserNode );
    this.laserLayerArray.push( laserNode );

    this.addChild( this.afterLightLayer2 );

    // switches between ray and wave
    bendingLightModel.laserViewProperty.link( function( laserView ) {
      bendingLightModel.laser.wave = (laserView === 'wave');
    } );

    Property.multilink( [ bendingLightModel.laser.colorModeProperty, bendingLightModel.laserViewProperty ],
      function( colorMode, laserView ) {
        bendingLightView.singleColorLightNode.visible = laserView === 'ray' && colorMode !== 'white';
      }
    );

    this.events.on( 'layoutFinished', function( dx, dy, width, height ) {
        bendingLightView.singleColorLightNode.setCanvasBounds( new Bounds2( -dx, -dy, width - dx, height - dy ) );
      }
    );
  }

  return inherit( ScreenView, BendingLightView, {

    // @protected - intended to be overriden by subclasses
    step: function() {
      if ( this.singleColorLightNode.visible ) {
        this.singleColorLightNode.step();
      }
    },

    // @protected - overriden for IntroView to add the wave nodes
    addLightNodes: function() {},

    addLaserHandles: function( showRotationDragHandlesProperty, showTranslationDragHandlesProperty, clockwiseArrowNotAtMax, ccwArrowNotAtMax, laserImageWidth ) {
      var bendingLightModel = this.bendingLightModel;

      // Shows the direction in which laser can be rotated
      var leftRotationDragHandle = new RotationDragHandle( this.modelViewTransform, bendingLightModel.laser, Math.PI / 23,
        showRotationDragHandlesProperty, clockwiseArrowNotAtMax, laserImageWidth * 0.58, bendingLightModel.rotationArrowAngleOffset );
      this.addChild( leftRotationDragHandle );
      var rightRotationDragHandle = new RotationDragHandle( this.modelViewTransform, bendingLightModel.laser, -Math.PI / 23,
        showRotationDragHandlesProperty, ccwArrowNotAtMax, laserImageWidth * 0.58, bendingLightModel.rotationArrowAngleOffset );
      this.addChild( rightRotationDragHandle );

      this.laserLayerArray.push( leftRotationDragHandle, rightRotationDragHandle );
    }
  } );
} );