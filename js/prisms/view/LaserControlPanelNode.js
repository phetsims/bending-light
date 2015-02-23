// Copyright 2002-2015, University of Colorado
/**
 * Control panel for the laser in the "prism break" tab,
 * such as choosing whether it is white light or one color, and the wavelength.
 * @author Sam Reid
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var WavelengthSlider = require( 'SCENERY_PHET/WavelengthSlider' );
  // strings
  var oneColorString = require( 'string!BENDING_LIGHT/oneColor' );
  var whiteLightString = require( 'string!BENDING_LIGHT/whiteLight' );

  /**
   *
   * @param laserColor
   * @param wavelengthProperty
   * @param options
   * @constructor
   */
  function LaserControlPanelNode( laserColor, wavelengthProperty, options ) {


    options = _.extend( {
      fill: '#eeeeee ',
      stroke: 'gray',
      lineWidth: 1
    }, options );

    //Add a radio button for "one color"
    var AQUA_RADIO_BUTTON_OPTIONS = { radius: 6, font: new PhetFont( 12 ) };
    var createButtonTextNode = function( text ) {
      return new Text( text, { font: new PhetFont( 12 ) } );
    };

    // Create the radio buttons

    var oneColorRadio = new AquaRadioButton( laserColor, 'oneColor', createButtonTextNode( oneColorString ),
      AQUA_RADIO_BUTTON_OPTIONS );
    var whiteLightRadio = new AquaRadioButton( laserColor, 'whiteLight', createButtonTextNode( whiteLightString ),
      AQUA_RADIO_BUTTON_OPTIONS );


    // touch areas
    var touchExpansion = 5;
    var maxRadioButtonWidth = _.max( [ oneColorRadio, whiteLightRadio ], function( item ) {
      return item.width;
    } ).width;

    //touch areas
    oneColorRadio.touchArea = new Bounds2(
      ( oneColorRadio.localBounds.minX - touchExpansion ),
      oneColorRadio.localBounds.minY,
      ( oneColorRadio.localBounds.minX + maxRadioButtonWidth ),
      oneColorRadio.localBounds.maxY
    );

    // Create  WavelengthSlider node
    var wavelengthSlider = new WavelengthSlider( wavelengthProperty,
      {
        cursorStroke: 'white',
        thumbWidth: 30,
        trackWidth:230,
        trackHeight: 25,
        tweakersVisible: false,
        valueVisible: false,
        thumbHeight: 40,
        thumbTouchAreaExpandY: 10,
        pointerAreasOverTrack: true
      } );
    var content = new VBox( {
      spacing: 10,
      children: [ oneColorRadio, whiteLightRadio, wavelengthSlider ],
      align: 'left'
    } );


    Panel.call( this, content, options );
    //Add the wavelength control for choosing the wavelength in "one color" mode

    //Add a radio button for "white light"
  }

  return inherit( Panel, LaserControlPanelNode );
} );

