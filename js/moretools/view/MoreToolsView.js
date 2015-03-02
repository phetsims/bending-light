// Copyright 2002-2012, University of Colorado
/**
 * Canvas for the "more tools" tab, which adds more tools to the toolbox, and a few more controls for the laser.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroView = require( 'BENDING_LIGHT/intro/view/IntroView' );

  /**
   *
   * @param model
   * @constructor
   */
  function MoreToolsView( model ) {
    this.arrowScale = 1.5E-14;
    IntroView.call( this, model, true, true );
  }

  return inherit( IntroView, MoreToolsView );

} );

