// Copyright 2015-2020, University of Colorado Boulder

/**
 * Prism toolbox which contains draggable prisms as well as the control panel for their index of refraction.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import protractorImage from '../../../mipmaps/protractor_png.js';
import bendingLightStrings from '../../bending-light-strings.js';
import bendingLight from '../../bendingLight.js';
import MediumControlPanel from '../../common/view/MediumControlPanel.js';
import PrismNode from './PrismNode.js';

const normalLineString = bendingLightStrings.normalLine;
const objectsString = bendingLightStrings.objects;
const protractorString = bendingLightStrings.protractor;
const reflectionsString = bendingLightStrings.reflections;


// constants
const MAX_TEXT_WIDTH = 115;
const MAX_PRISM_COUNT = 6; // for each type

class PrismToolboxNode extends Node {

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {PrismsModel} prismsModel - model of the prism screen
   * @param {Node} prismLayer - layer in which prisms are present when in play area
   * @param {Property.<Bounds2>} dragBoundsProperty - Bounds of prisms screen.
   * @param {function} occlusionHandler - function that takes one node as a parameter and updates it if occluded by a
   *                                    - control panel
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor( modelViewTransform, prismsModel, prismLayer, dragBoundsProperty, occlusionHandler,
               options ) {

    super();
    const content = new HBox( {
      spacing: 8.4
    } );

    // Create prism icon
    const createPrismIcon = ( prism ) => {
      const prismShape = prism.copy();
      return new PrismNode( prismsModel, modelViewTransform, prismShape, this, prismLayer,
        dragBoundsProperty, occlusionHandler, true );
    };

    // Iterate over the prism prototypes in the model and create a draggable icon for each one
    let prismNode;
    prismsModel.getPrismPrototypes().forEach( prism => {
      const prismIcon = createPrismIcon( prism );

      const listener = function() {
        const count = _.filter( prismsModel.prisms.getArray(), function( p ) {
          return p.typeName === prism.typeName;
        } ).length;
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
      prismToolboxIconNode.addInputListener( new SimpleDragHandler( {
        start: ( event, trail ) => {
          const start = this.globalToParentPoint( event.pointer.point );
          const prismShape = prism.copy();

          // add prism model to the prisms model
          prismsModel.addPrism( prismShape );

          // create a prism node and add to the prisms layer
          prismNode = new PrismNode( prismsModel, modelViewTransform, prismShape, this, prismLayer,
            dragBoundsProperty, occlusionHandler, false );
          prismLayer.addChild( prismNode );
          prismShape.translate(
              modelViewTransform.viewToModelX( start.x ),
              modelViewTransform.viewToModelY( start.y )
            );

            // HACK ALERT.  Changes the event's currentTarget.  Why didn't we need to do this with the other nodes?
            // Presumably because they were in similar coordinate frames?
            // See Scenery #131 create drag listener
            // See Scenery #218 multitouch
            // There is a precedent for this hack in SimpleDragHandler.js
            const c = event.currentTarget;
            event.currentTarget = prismNode;
            prismNode.movableDragHandler.handleForwardedStartEvent( event, trail );
            event.currentTarget = c;
          },
          drag: function( event, trail ) {

            // HACK ALERT.  Changes the event's currentTarget.  Why didn't we need to do this with the other nodes?
            // Presumably because they were in similar coordinate frames?
            // See Scenery #131 create drag listener
            // See Scenery #218 multitouch
            // There is a precedent for this hack in SimpleDragHandler.js
            const c = event.currentTarget;
            event.currentTarget = prismNode;
            prismNode.movableDragHandler.handleForwardedDragEvent( event, trail );
            event.currentTarget = c; // oh noes
          },
          end: function( event, trail ) {

            // HACK ALERT.  Changes the event's currentTarget.  Why didn't we need to do this with the other nodes?
            // Presumably because they were in similar coordinate frames?
            // See Scenery #131 create drag listener
            // See Scenery #218 multitouch
            // There is a precedent for this hack in SimpleDragHandler.js
            const c = event.currentTarget;
            event.currentTarget = prismNode;
            prismNode.movableDragHandler.handleForwardedEndEvent( event, trail );
            event.currentTarget = c;
          }
        }
      ) );

      // touch area
      prismIcon.touchArea = prismIcon.localBounds;
      content.addChild( prismIcon );
      prismIcon.addChild( prismToolboxIconNode );
    } );

    // Allow the user to control the type of material in the prisms
    const environmentMediumMaterialListParent = new Node();
    const objectMediumControlPanel = new MediumControlPanel( environmentMediumMaterialListParent,
      prismsModel.mediumColorFactory,
      prismsModel.prismMediumProperty,
      objectsString,
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
    // Create an icon for the protractor checkbox
    const createProtractorIcon = function() {
      const protractorImageNode = new Image( protractorImage );
      protractorImageNode.scale( 20 / protractorImage[ 0 ].width );
      return protractorImageNode;
    };

    const textOptions = { font: new PhetFont( 10 ) };

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    const showReflections = { label: new Text( reflectionsString, textOptions ) };
    const showNormal = { label: new Text( normalLineString, textOptions ) };
    const showProtractor = { label: new Text( protractorString, textOptions ), icon: createProtractorIcon() };

    // compute the maximum item width
    const widestItem = _.maxBy( [ showReflections, showNormal, showProtractor ], function( item ) {
      return item.label.width + ( ( item.icon ) ? item.icon.width : 0 );
    } );
    const widestItemWidth = widestItem.label.width + ( ( widestItem.icon ) ? widestItem.icon.width : 0 );
    const maxWidth = Math.min( widestItemWidth + 10, MAX_TEXT_WIDTH );

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    const createItem = function( itemSpec ) {
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
      boxWidth: 20,
      spacing: 2
    };

    // add checkboxes for reflections, normal and protractor
    const showReflectionsCheckbox = new Checkbox(
      createItem( showReflections ),
      prismsModel.showReflectionsProperty,
      checkboxOptions
    );
    const showNormalCheckbox = new Checkbox(
      createItem( showNormal ),
      prismsModel.showNormalsProperty,
      checkboxOptions
    );
    const showProtractorCheckbox = new Checkbox(
      createItem( showProtractor ),
      prismsModel.showProtractorProperty,
      checkboxOptions
    );

    const maxCheckboxWidth = _.maxBy( [ showReflectionsCheckbox, showNormalCheckbox, showProtractorCheckbox ],
      function( item ) {
        return item.width;
      }
    ).width + 5;

    // touch Areas
    showReflectionsCheckbox.touchArea = new Bounds2(
      showReflectionsCheckbox.localBounds.minX - 5,
      showReflectionsCheckbox.localBounds.minY,
      showReflectionsCheckbox.localBounds.minX + maxCheckboxWidth,
      showReflectionsCheckbox.localBounds.maxY
    );

    showNormalCheckbox.touchArea = new Bounds2(
      showNormalCheckbox.localBounds.minX - 5,
      showNormalCheckbox.localBounds.minY,
      showNormalCheckbox.localBounds.minX + maxCheckboxWidth,
      showNormalCheckbox.localBounds.maxY
    );

    showProtractorCheckbox.touchArea = new Bounds2(
      showProtractorCheckbox.localBounds.minX - 5,
      showProtractorCheckbox.localBounds.minY,
      showProtractorCheckbox.localBounds.minX + maxCheckboxWidth,
      showProtractorCheckbox.localBounds.maxY
    );

    // pad all the rows so the text nodes are left aligned and the icons is right aligned
    const checkboxes = new VBox( {
      align: 'left', spacing: 4,
      children: [ showReflectionsCheckbox, showNormalCheckbox, showProtractorCheckbox ]
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
    this.mutate( options );
  }
}

bendingLight.register( 'PrismToolboxNode', PrismToolboxNode );

export default PrismToolboxNode;