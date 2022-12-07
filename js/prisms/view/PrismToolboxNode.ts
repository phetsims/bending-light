// Copyright 2015-2022, University of Colorado Boulder

/**
 * Prism toolbox which contains draggable prisms as well as the control panel for their index of refraction.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ProtractorNode from '../../../../scenery-phet/js/ProtractorNode.js';
import { DragListener, HBox, HStrut, Node, NodeOptions, Path, Rectangle, SceneryEvent, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import bendingLight from '../../bendingLight.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import MediumControlPanel from '../../common/view/MediumControlPanel.js';
import Prism from '../model/Prism.js';
import PrismsModel from '../model/PrismsModel.js';
import PrismNode from './PrismNode.js';

const normalLineStringProperty = BendingLightStrings.normalLineStringProperty;
const objectsStringProperty = BendingLightStrings.objectsStringProperty;
const protractorStringProperty = BendingLightStrings.protractorStringProperty;
const reflectionsStringProperty = BendingLightStrings.reflectionsStringProperty;

// constants
const MAX_TEXT_WIDTH = 115;
const MAX_PRISM_COUNT = 6; // for each type

class PrismToolboxNode extends Node {
  public readonly objectMediumControlPanel: MediumControlPanel;

  /**
   * @param modelViewTransform - converts between model and view co-ordinates
   * @param prismsModel - model of the prism screen
   * @param prismLayer - layer in which prisms are present when in play area
   * @param dragBoundsProperty - Bounds of prisms screen.
   * @param occlusionHandler - function that takes one node as a parameter and updates it if occluded by a
   *                                    - control panel
   * @param [providedOptions] that can be passed on to the underlying node
   */
  public constructor( modelViewTransform: ModelViewTransform2, prismsModel: PrismsModel, prismLayer: Node, dragBoundsProperty: Property<Bounds2>, occlusionHandler: ( n: Node ) => void,
                      providedOptions?: Partial<NodeOptions> ) {

    super();
    const content = new HBox( {
      spacing: 8.4,
      excludeInvisibleChildrenFromBounds: false
    } );

    // Create prism icon
    const createPrismIcon = ( prism: Prism ) => {
      const prismShape = prism.copy();
      return new PrismNode( prismsModel, modelViewTransform, prismShape, this, prismLayer,
        dragBoundsProperty, occlusionHandler, true );
    };

    // Iterate over the prism prototypes in the model and create a draggable icon for each one
    let prismNode: PrismNode;
    prismsModel.getPrismPrototypes().forEach( prism => {
      const prismIcon = createPrismIcon( prism );

      const listener = () => {
        const count = prismsModel.prisms.count( ( p: Prism ) => p.typeName === prism.typeName );
        prismIcon.visible = count < MAX_PRISM_COUNT;
      };
      prismsModel.prisms.addItemAddedListener( listener );
      prismsModel.prisms.addItemRemovedListener( listener );
      const prismIconBounds = prismIcon.bounds;
      prismIcon.scale( 55 / prismIcon.height );
      const prismToolboxIconNode = new Path( Shape.rectangle(
        prismIconBounds.minX,
        prismIconBounds.minY,
        prismIconBounds.getWidth(),
        prismIconBounds.getHeight()
      ), {
        pickable: true,
        cursor: 'pointer'
      } );

      // Add drag listener for the prisms icon
      const dragListener = DragListener.createForwardingListener( ( event: SceneryEvent ) => {

        const start = this.globalToParentPoint( event.pointer.point );
        const prismShape = prism.copy();
        prismShape.translate(
          modelViewTransform.viewToModelX( start.x ),
          modelViewTransform.viewToModelY( start.y )
        );

        // add prism model to the prisms model
        prismsModel.addPrism( prismShape );

        // create a prism node and add to the prisms layer
        prismNode = new PrismNode( prismsModel, modelViewTransform, prismShape, this, prismLayer, dragBoundsProperty, occlusionHandler, false );
        prismLayer.addChild( prismNode );

        // @ts-expect-error
        prismNode.dragListener.press( event, prismNode );
      } );
      prismToolboxIconNode.addInputListener( dragListener );

      // touch area
      prismIcon.touchArea = prismIcon.localBounds;
      content.addChild( prismIcon );
      prismIcon.addChild( prismToolboxIconNode );
    } );

    // Allow the user to control the type of material in the prisms
    const environmentMediumMaterialListParent = new Node();

    // @ts-expect-error
    const objectMediumControlPanel = new MediumControlPanel( environmentMediumMaterialListParent,
      prismsModel.mediumColorFactory,
      prismsModel.prismMediumProperty,
      objectsStringProperty,
      false,
      prismsModel.wavelengthProperty,
      2, {
        lineWidth: 0,
        yMargin: 4
      } );
    this.objectMediumControlPanel = objectMediumControlPanel;
    const dividerBetweenPrismsAndPanel = new Rectangle( 0, 0, 0.6, objectMediumControlPanel.height - 10, 10, 10, {
      stroke: 'gray', lineWidth: 0.2, fill: 'gray'
    } );
    content.addChild( dividerBetweenPrismsAndPanel );

    content.addChild( objectMediumControlPanel );
    const dividerBetweenMediumPanelAndControlPanel = new Rectangle( 0, 0, 0.6, objectMediumControlPanel.height - 10, 10,
      10, {
        stroke: 'gray', lineWidth: 0.2, fill: 'gray'
      } );
    content.addChild( dividerBetweenMediumPanelAndControlPanel );

    // Add checkboxes
    const textOptions = { font: new PhetFont( 10 ) };

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    const showReflections = { label: new Text( reflectionsStringProperty, textOptions ), icon: null };
    const showNormal = { label: new Text( normalLineStringProperty, textOptions ), icon: null };
    const showProtractor = {
      label: new Text( protractorStringProperty, textOptions ),
      icon: ProtractorNode.createIcon( {
        scale: 0.066 // determined empirically
      } )
    };

    // compute the maximum item width

    // @ts-expect-error
    const widestItem: { label: Node; icon: Node | null } = _.maxBy( [ showReflections, showNormal, showProtractor ], item => item.label.width + ( ( item.icon ) ? item.icon.width : 0 ) );
    const widestItemWidth = widestItem.label.width + ( ( widestItem.icon ) ? widestItem.icon.width : 0 );
    const maxWidth = Math.min( widestItemWidth + 10, MAX_TEXT_WIDTH );

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    const createItem = ( itemSpec: { label: Node; icon: Node | null } ) => {
      if ( itemSpec.icon ) {
        const textWidth = maxWidth - itemSpec.icon.width - 10;
        if ( itemSpec.label.width > textWidth ) {
          itemSpec.label.scale( textWidth / itemSpec.label.width );
        }
        const strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width;
        return new HBox( { children: [ itemSpec.label, new HStrut( strutWidth ), itemSpec.icon ] } );
      }
      else {
        if ( itemSpec.label.width > maxWidth ) {
          itemSpec.label.scale( MAX_TEXT_WIDTH / itemSpec.label.width );
        }
        return new HBox( { children: [ itemSpec.label ] } );
      }
    };

    const checkboxOptions = {
      boxWidth: 15,
      spacing: 5
    };

    // add checkboxes for reflections, normal and protractor
    const showReflectionsCheckbox = new Checkbox( prismsModel.showReflectionsProperty, createItem( showReflections ), checkboxOptions );
    const showNormalCheckbox = new Checkbox( prismsModel.showNormalsProperty, createItem( showNormal ), checkboxOptions );
    const showProtractorCheckbox = new Checkbox( prismsModel.showProtractorProperty, createItem( showProtractor ), checkboxOptions );

    // @ts-expect-error
    const maxCheckboxWidth = _.maxBy( [ showReflectionsCheckbox, showNormalCheckbox, showProtractorCheckbox ],
      item => item.width
    ).width + 5;

    const SPACING = 9;

    // touch Areas
    showReflectionsCheckbox.touchArea = new Bounds2(
      showReflectionsCheckbox.localBounds.minX - 5,
      showReflectionsCheckbox.localBounds.minY,
      showReflectionsCheckbox.localBounds.minX + maxCheckboxWidth,
      showReflectionsCheckbox.localBounds.maxY
    ).dilatedY( SPACING / 2 );

    showNormalCheckbox.touchArea = new Bounds2(
      showNormalCheckbox.localBounds.minX - 5,
      showNormalCheckbox.localBounds.minY,
      showNormalCheckbox.localBounds.minX + maxCheckboxWidth,
      showNormalCheckbox.localBounds.maxY
    ).dilatedY( SPACING / 2 );

    showProtractorCheckbox.touchArea = new Bounds2(
      showProtractorCheckbox.localBounds.minX - 5,
      showProtractorCheckbox.localBounds.minY,
      showProtractorCheckbox.localBounds.minX + maxCheckboxWidth,
      showProtractorCheckbox.localBounds.maxY
    ).dilatedY( SPACING / 2 );

    // pad all the rows so the text nodes are left aligned and the icons is right aligned
    const checkboxes = new VBox( {
      align: 'left',
      spacing: SPACING,
      children: [
        showReflectionsCheckbox,
        showNormalCheckbox,
        showProtractorCheckbox
      ]
    } );
    content.addChild( checkboxes );

    // Add the sensors panel
    const background = new Rectangle( 0, 0, content.width + 25, content.height + 2, 5, 5, {
      stroke: '#696969', lineWidth: 1.5, fill: '#EEEEEE'
    } );
    this.addChild( background );
    this.addChild( content );
    this.addChild( environmentMediumMaterialListParent );
    content.centerX = background.centerX;
    content.centerY = background.centerY;
    this.mutate( providedOptions );
  }
}

bendingLight.register( 'PrismToolboxNode', PrismToolboxNode );

export default PrismToolboxNode;
