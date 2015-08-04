// Copyright 2002-2015, University of Colorado Boulder

/**
 * Animation is used for the IntensityMeterNode, ProtractorNode, VelocitySensorNode and WaveSensorNode when they go into/
 * out of the toolbox.  The constants and tween setup are isolated here.
 *
 * See https://github.com/phetsims/bending-light/issues/108
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function() {
  'use strict';

  return {

    /**
     * @public
     * @param {Node} objectToTween - object to which tween to be applied
     * @param {Object} startPoint - object containing details of initial state i.e, x, y positions and scale
     * @param {Object} endPoint - object containing details of final state i.e, x, y positions and scale
     * @param {function} onUpdate
     */
    startTween: function( objectToTween, startPoint, endPoint, onUpdate ) {
      new TWEEN.Tween( startPoint )
        .to( endPoint, 100 )
        .easing( TWEEN.Easing.Linear.None )
        .onUpdate( onUpdate )
        .start();
    }
  };
} );