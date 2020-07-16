// Copyright 2020, University of Colorado Boulder

/**
 * IO type for Medium.  TODO: Just instrument the "substance" instead
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import bendingLight from '../../bendingLight.js';
import Medium from './Medium.js';

class MediumIO extends ObjectIO {

  /**
   * Serializes an instance.
   * @param {Medium} medium
   * @returns {Object}
   * @public
   * @override
   */
  static toStateObject( medium ) {
    validate( medium, this.validator );
    return { hello: 'there' };
  }

  /**
   * Set the position of the medium using the value parsed in fromStateObject.  This method is automatically called by
   * phetioEngine.js when setting the state.
   * @param {Medium} medium
   * @param {{position: Vector2}} fromStateObject - the value returned by fromStateObject
   * @public
   * @override
   */
  static applyState( medium, fromStateObject ) {
    // validate( medium, this.validator );
    // medium.previousPosition.set( fromStateObject.position );
  }
}

MediumIO.methods = {

  setName: {
    returnType: VoidIO,
    parameterTypes: [ StringIO ],
    implementation: text => {
      this.phetioObject.name = text;
    },
    documentation: 'Set the name of the solute',
    invocableForReadOnlyElements: false
  },

  setFormula: {
    returnType: VoidIO,
    parameterTypes: [ StringIO ],
    implementation: text => {
      this.phetioObject.formula = text;
    },
    documentation: 'Set the formula of the solute',
    invocableForReadOnlyElements: false
  }
};

MediumIO.documentation = 'a solute';
MediumIO.validator = { isValidValue: value => value instanceof Medium };
MediumIO.typeName = 'MediumIO';
ObjectIO.validateSubtype( MediumIO );

bendingLight.register( 'MediumIO', MediumIO );
export default MediumIO;