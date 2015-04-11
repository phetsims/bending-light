// Copyright 2002-2015, University of Colorado
/**
 * Display type for the rays, can be shown as rays (non moving lines) or waves (animating).
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LightWaveNode = require( 'BENDING_LIGHT/intro/view/LightWaveNode' );
  var LightRayNode = require( 'BENDING_LIGHT/common/view/LightRayNode' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var WavelengthSlider = require( 'SCENERY_PHET/WavelengthSlider' );
  //var LaserColor = require( 'BENDING_LIGHT/common/view/LaserColor' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ArrowButton = require( 'SCENERY_PHET/buttons/ArrowButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );

  // strings
  var laserString = require( 'string!BENDING_LIGHT/laser' );
  var waveString = require( 'string!BENDING_LIGHT/wave' );
  var units_nmString = require( 'string!BENDING_LIGHT/units_nm' );

  // constants
  var PLUS_MINUS_SPACING = 4;

  //Ray view creates LightRayNodes and shows in the lightRayLayer
  function RAY() {

  }

  inherit( Object, RAY, {
    createNode: function( transform, lightRay ) {
      return new LightRayNode( transform, lightRay );
    },
    getLayer: function( lightRayLayer, lightWaveLayer ) {
      return lightRayLayer;
    }
  } );

  //Wave view uses the LightWaveNode and renders in the lightWaveLayer
  function WAVE() {

  }

  inherit( Object, WAVE, {
    createNode: function( transform, lightRay ) {
      return new LightWaveNode( transform, lightRay );
    },
    getLayer: function( lightRayLayer, lightWaveLayer ) {
      return lightWaveLayer;
    }
  } );

  /**
   *
   * @param model
   * @param hasMoreTools
   * @param {Object} [options]
   * @constructor
   */
  function LaserView( model, hasMoreTools, options ) {
    options = _.extend( {
      cornerRadius: 5,
      xMargin: 7,
      yMargin: 6,
      fill: '#C6CACE',
      stroke: 'gray',
      lineWidth: 1,
      resize: false
    }, options );

    //var width = 100;
    this.rayNode = new RAY();
    this.waveNode = new WAVE();
    var AQUA_RADIO_BUTTON_OPTIONS = { radius: 6, font: new PhetFont( 12 ) };
    var createButtonTextNode = function( text ) {
      return new Text( text, { font: new PhetFont( 12 ) } );
    };

    // Create the radio buttons

    var laserRadio = new AquaRadioButton( model.laserViewProperty, 'ray', createButtonTextNode( laserString ),
      AQUA_RADIO_BUTTON_OPTIONS );
    var waveRadio = new AquaRadioButton( model.laserViewProperty, 'wave', createButtonTextNode( waveString ),
      AQUA_RADIO_BUTTON_OPTIONS );


    // touch areas
    var touchExpansion = 5;
    var maxRadioButtonWidth = _.max( [ laserRadio, waveRadio ], function( item ) {
      return item.width;
    } ).width;

    //touch areas
    laserRadio.touchArea = new Bounds2(
      ( laserRadio.localBounds.minX - touchExpansion ),
      laserRadio.localBounds.minY,
      ( laserRadio.localBounds.minX + maxRadioButtonWidth ),
      laserRadio.localBounds.maxY
    );

    waveRadio.touchArea = new Bounds2(
      ( waveRadio.localBounds.minX - touchExpansion ),
      waveRadio.localBounds.minY,
      ( waveRadio.localBounds.minX + maxRadioButtonWidth ),
      waveRadio.localBounds.maxY );

    var content;
    if ( hasMoreTools ) {
      var mediumWavelengthProperty = new Property( model.wavelengthProperty.value * 1E9 );
      // Create  WavelengthSlider node
      var wavelengthSlider = new WavelengthSlider( mediumWavelengthProperty,
        {
          cursorStroke: 'white',
          maxWavelength: 700,
          thumbWidth: 20,
          thumbHeight: 20,
          trackWidth: 140,
          trackHeight: 15,
          tweakersVisible: false,
          valueVisible: false,
          thumbTouchAreaExpandY: 10,
          pointerAreasOverTrack: true
        } );

      var wavelengthValueText = new Text( mediumWavelengthProperty.get() + units_nmString );
      var wavelengthBoxShape = new Rectangle( 0, 0, 50, 18, 2, 2,
        { fill: 'white', stroke: 'black' } );

      var plusButton = new ArrowButton( 'right', function propertyPlus() {
        mediumWavelengthProperty.set( Math.min( mediumWavelengthProperty.get() + 1, VisibleColor.MAX_WAVELENGTH ) );
      }, {
        scale: 0.6
      } );
      plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
        plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 20 );

      var minusButton = new ArrowButton( 'left', function propertyMinus() {
        mediumWavelengthProperty.set( Math.max( mediumWavelengthProperty.get() - 1, VisibleColor.MIN_WAVELENGTH ) );
      }, {
        scale: 0.6
      } );
      minusButton.touchArea = new Bounds2( minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
        minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 20 );

      wavelengthBoxShape.centerX = wavelengthSlider.centerX;
      wavelengthBoxShape.bottom = wavelengthSlider.top - 10;

      wavelengthValueText.centerX = wavelengthBoxShape.centerX;
      wavelengthValueText.centerY = wavelengthBoxShape.centerY;

      // plus button to the right of the value
      plusButton.left = wavelengthBoxShape.right + PLUS_MINUS_SPACING;
      plusButton.centerY = wavelengthBoxShape.centerY;

      // minus button to the left of the value
      minusButton.right = wavelengthBoxShape.left - PLUS_MINUS_SPACING;
      minusButton.centerY = wavelengthBoxShape.centerY;


      var wavelengthValue = new Node( {
        children: [ minusButton, wavelengthBoxShape, wavelengthValueText,
          plusButton, wavelengthSlider ]
      } );

      content = new VBox( {
        spacing: 10,
        children: [ laserRadio, waveRadio, wavelengthValue ],
        align: 'left'
      } );
      mediumWavelengthProperty.link( function( wavelength ) {
        model.wavelengthProperty.set( wavelength / 1E9 );
        wavelengthValueText.text = wavelength + units_nmString;
      } );
    }
    else {
      content = new VBox( {
        spacing: 10,
        children: [ laserRadio, waveRadio ],
        align: 'left'
      } );
    }

    Panel.call( this, content, options );
  }

  return inherit( Panel, LaserView, {

      /**
       * Create the node for the specified lightRay
       * @param transform
       * @param lightRay
       */
      createNode: function( transform, lightRay ) {},

      /**
       * Determine which layer to put the PNode in.
       * @param lightRayLayer
       * @param lightWaveLayer
       */
      getLayer: function( lightRayLayer, lightWaveLayer ) {}
    },
    //statics
    {
      RAY: new RAY(),
      WAVE: new WAVE()
    } );
} );