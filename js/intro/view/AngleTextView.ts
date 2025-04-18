// Copyright 2021-2025, University of Colorado Boulder

/**
 * Shows text with background for the AngleNode.
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import bendingLight from '../../bendingLight.js';

export default class AngleTextView extends Panel {
  private readonly textNode: Text;

  public constructor() {
    const textNode = new Text( '', { fontSize: 12, fill: 'black' } );

    super( textNode, {
      fill: 'white',
      opacity: 0.75,
      stroke: null,
      lineWidth: 0, // width of the background border
      xMargin: 3,
      yMargin: 3,
      cornerRadius: 6, // radius of the rounded corners on the background
      resize: true, // dynamically resize when content bounds change
      backgroundPickable: false,
      align: 'center', // {string} horizontal of content in the pane, left|center|right
      minWidth: 0 // minimum width of the panel
    } );

    this.textNode = textNode;
  }

  public setAngleText( text: string ): void {
    this.textNode.setString( text );
  }
}

bendingLight.register( 'AngleTextView', AngleTextView );