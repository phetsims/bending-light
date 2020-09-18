// Copyright 2020, University of Colorado Boulder

/**
 * IO Type for Medium.  TODO: Just instrument the "substance" instead
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import bendingLight from '../../bendingLight.js';
import Medium from './Medium.js';

const MediumIO = new IOType( 'MediumIO', {
  isValidValue: value => value instanceof Medium,
  methods: {

    setName: {
      returnType: VoidIO,
      parameterTypes: [ StringIO ],
      implementation: text => {
        this.name = text;
      },
      documentation: 'Set the name of the solute',
      invocableForReadOnlyElements: false
    },

    setFormula: {
      returnType: VoidIO,
      parameterTypes: [ StringIO ],
      implementation: text => {
        this.formula = text;
      },
      documentation: 'Set the formula of the solute',
      invocableForReadOnlyElements: false
    }
  },

  // TODO: https://github.com/phetsims/tandem/issues/211 this looks bogus
  toStateObject( medium ) {
    return { hello: 'there' };
  },

  applyState( medium, fromStateObject ) {
    // medium.previousPosition.set( fromStateObject.position );
  }
} );

bendingLight.register( 'MediumIO', MediumIO );
export default MediumIO;