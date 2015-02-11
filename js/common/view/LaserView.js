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
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SUN/HStrut' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // strings
  var laserString = require( 'string!BENDING_LIGHT/laser' );
  var waveString = require( 'string!BENDING_LIGHT/wave' );
  var laserViewString = require( 'string!BENDING_LIGHT/laserView' );

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
   * @param options
   * @constructor
   */
  function LaserView( model, options ) {
    options = _.extend( {
      cornerRadius: 5,
      xMargin: 7,
      yMargin: 6,
      fill: '#C6CACE',
      stroke: 'gray',
      lineWidth: 1,
      resize: false
    }, options );

    var width = 100;
    var titleText = new Text( laserViewString, { font: new PhetFont( 12 ), fontWeight: 'bold' } );
    this.rayNode = new RAY();
    this.waveNode = new WAVE();
    var AQUA_RADIO_BUTTON_OPTIONS = { radius: 6, font: new PhetFont( 12 ) };
    var createButtonTextNode = function( text ) { return new Text( text, { font: new PhetFont( 12 ) } ); };

    // Create the radio buttons

    var laserRadio = new AquaRadioButton( model.laserViewProperty, 'ray', createButtonTextNode( laserString ),
      AQUA_RADIO_BUTTON_OPTIONS );
    var waveRadio = new AquaRadioButton( model.laserViewProperty,'wave', createButtonTextNode( waveString ),
      AQUA_RADIO_BUTTON_OPTIONS );

    //dummy text for height
    var dummyText = new Text( '', { font: new PhetFont( 3 ) } );

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

    // center the title by adding space before and after. Also ensures that the panel's width is 'width'
    var createTitle = function( item ) {
      var strutWidth = ( width - item.width ) / 2 - options.xMargin;
      return new HBox( { children: [ new HStrut( strutWidth ), item, new HStrut( strutWidth ) ] } );
    };

    var content = new VBox( {
      spacing: 4,
      children: [ createTitle( titleText ), laserRadio, waveRadio, createTitle( dummyText ) ],
      align: 'left'
    } );



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