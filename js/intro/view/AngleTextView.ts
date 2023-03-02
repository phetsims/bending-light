// Copyright 2021-2023, University of Colorado Boulder
import { Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import bendingLight from '../../bendingLight.js';

/**
 * Shows text with background for the AngleNode.
 * @author Sam Reid (PhET Interactive Simulations)
 */
class AngleTextView extends Panel {
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
export default AngleTextView;