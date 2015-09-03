//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Shows the angles between the rays and the vertical when enabled.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   *
   * @constructor
   */
  function AngleNode( showAnglesProperty, rays ) {
    Node.call( this );
  }

  return inherit( Node, AngleNode );
} );