// Copyright 2002-2015, University of Colorado Boulder

/**
 * The 'Prisms' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var PrismsModel = require( 'BENDING_LIGHT/prisms/model/PrismsModel' );
  var PrismsView = require( 'BENDING_LIGHT/prisms/view/PrismsView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var prismsTitleString = require( 'string!BENDING_LIGHT/prisms' );

  /**
   * @constructor
   */
  function PrismsScreen() {
    var prismModel = new PrismsModel();
    Screen.call( this, prismsTitleString, new Rectangle( 0, 0, 548, 373, { fill: 'green' } ),
      function() {
        return prismModel;
      },
      function( model ) {
        return new PrismsView( model );
      }
    );
  }

  return inherit( Screen, PrismsScreen );
} );