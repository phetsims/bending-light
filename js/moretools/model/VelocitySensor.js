// Copyright  2002 - 2015, University of Colorado Boulder

/**
 * VelocitySensor that has a position and measures velocity
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @constructor
   */
  function VelocitySensor() {

    PropertySet.call( this, {
      position: new Vector2( -0.000018, -0.0000044 ), //position of the sensor
      value: new Vector2( 0, 0 ) // velocity as measured by the sensor
    } );

    this.addDerivedProperty( 'isArrowVisible', [ 'value' ], function( value ) {
      return value.magnitude() > 0;
    } );
  }

  return inherit( PropertySet, VelocitySensor, {

    /**
     * @public
     * @param {Vector2} delta
     */
    translate: function( delta ) {
      this.positionProperty.set( this.position.plus( delta ) );
    }
  } );
} );