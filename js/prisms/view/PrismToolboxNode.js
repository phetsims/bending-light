// Copyright 2015-2017, University of Colorado Boulder

/**
 * Prism toolbox which contains draggable prisms as well as the control panel for their index of refraction.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var bendingLight = require( 'BENDING_LIGHT/bendingLight' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var CheckBox = require( 'SUN/CheckBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MediumControlPanel = require( 'BENDING_LIGHT/common/view/MediumControlPanel' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PrismNode = require( 'BENDING_LIGHT/prisms/view/PrismNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var normalLineString = require( 'string!BENDING_LIGHT/normalLine' );
  var objectsString = require( 'string!BENDING_LIGHT/objects' );
  var protractorString = require( 'string!BENDING_LIGHT/protractor' );
  var reflectionsString = require( 'string!BENDING_LIGHT/reflections' );

  // images
  var protractorImage = require( 'mipmap!BENDING_LIGHT/protractor.png' );

  // constants
  var MAX_TEXT_WIDTH = 115;
  var MAX_PRISM_COUNT = 6; // for each type

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {PrismsModel} prismsModel - model of the prism screen
   * @param {Node} prismLayer - layer in which prisms are present when in play area
   * @param {Property.<Bounds2>} dragBoundsProperty - Bounds of prisms screen.
   * @param {function} occlusionHandler - function that takes one node as a parameter and updates it if occluded by a
   *                                    - control panel
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function PrismToolboxNode( modelViewTransform, prismsModel, prismLayer, dragBoundsProperty, occlusionHandler,
                             options ) {
    var self = this;

    Node.call( this );
    var content = new HBox( {
      spacing: 8.4
    } );

    // Create prism icon
    var createPrismIcon = function( prism ) {
      var prismShape = prism.copy();
      return new PrismNode( prismsModel, modelViewTransform, prismShape, self, prismLayer,
        dragBoundsProperty, occlusionHandler, true );
    };

    // Iterate over the prism prototypes in the model and create a draggable icon for each one
    var prismNode;
    prismsModel.getPrismPrototypes().forEach( function( prism ) {
      var prismIcon = createPrismIcon( prism );

      var listener = function() {
        var count = _.filter( prismsModel.prisms.getArray(), function( p ) {
          return p.typeName === prism.typeName;
        } ).length;
        prismIcon.visible = count < MAX_PRISM_COUNT;
      };
      prismsModel.prisms.addItemAddedListener( listener );
      prismsModel.prisms.addItemRemovedListener( listener );
      var prismIconBounds = prismIcon.bounds;
      prismIcon.scale( 55 / prismIcon.height );
      var prismToolboxIconNode = new Path( Shape.rectangle(
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
          start: function( event, trail ) {
            var start = self.globalToParentPoint( event.pointer.point );
            var prismShape = prism.copy();

            // add prism model to the prisms model
            prismsModel.addPrism( prismShape );

            // create a prism node and add to the prisms layer
            prismNode = new PrismNode( prismsModel, modelViewTransform, prismShape, self, prismLayer,
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
            var c = event.currentTarget;
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
            var c = event.currentTarget;
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
          var c = event.currentTarget;
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
    var environmentMediumMaterialListParent = new Node();
    var objectMediumControlPanel = new MediumControlPanel( environmentMediumMaterialListParent,
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
    var dividerBetweenPrismsAndPanel = new Rectangle( 0, 0, 0.6, objectMediumControlPanel.height - 10, 10, 10, {
      stroke: 'gray', lineWidth: 0.2, fill: 'gray'
    } );
    content.addChild( dividerBetweenPrismsAndPanel );

    content.addChild( objectMediumControlPanel );
    var dividerBetweenMediumPanelAndControlPanel = new Rectangle( 0, 0, 0.6, objectMediumControlPanel.height - 10, 10,
      10, {
        stroke: 'gray', lineWidth: 0.2, fill: 'gray'
      } );
    content.addChild( dividerBetweenMediumPanelAndControlPanel );

    // Add check boxes
    // Create an icon for the protractor check box
    var createProtractorIcon = function() {
      var protractorImageNode = new Image( protractorImage );
      protractorImageNode.scale( 20 / protractorImage[ 0 ].width );
      return protractorImageNode;
    };

    var textOptions = { font: new PhetFont( 10 ) };

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    var showReflections = { label: new Text( reflectionsString, textOptions ) };
    var showNormal = { label: new Text( normalLineString, textOptions ) };
    var showProtractor = { label: new Text( protractorString, textOptions ), icon: createProtractorIcon() };

    // compute the maximum item width
    var widestItem = _.maxBy( [ showReflections, showNormal, showProtractor ], function( item ) {
      return item.label.width + ( ( item.icon ) ? item.icon.width : 0 );
    } );
    var widestItemWidth = widestItem.label.width + ( ( widestItem.icon ) ? widestItem.icon.width : 0);
    var maxWidth = Math.min( widestItemWidth + 10, MAX_TEXT_WIDTH );

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var textWidth = maxWidth - itemSpec.icon.width - 10;
        if ( itemSpec.label.width > textWidth ) {
          itemSpec.label.scale( textWidth / itemSpec.label.width );
        }
        var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width;
        return new HBox( { children: [ itemSpec.label, new HStrut( strutWidth ), itemSpec.icon ] } );
      }
      else {
        if ( itemSpec.label.width > maxWidth ) {
          itemSpec.label.scale( MAX_TEXT_WIDTH / itemSpec.label.width );
        }
        return new HBox( { children: [ itemSpec.label ] } );
      }
    };

    var checkBoxOptions = {
      boxWidth: 20,
      spacing: 2
    };

    // add check boxes for reflections, normal and protractor
    var showReflectionsCheckBox = new CheckBox(
      createItem( showReflections ),
      prismsModel.showReflectionsProperty,
      checkBoxOptions
    );
    var showNormalCheckBox = new CheckBox(
      createItem( showNormal ),
      prismsModel.showNormalsProperty,
      checkBoxOptions
    );
    var showProtractorCheckBox = new CheckBox(
      createItem( showProtractor ),
      prismsModel.showProtractorProperty,
      checkBoxOptions
    );

    var maxCheckBoxWidth = _.maxBy( [ showReflectionsCheckBox, showNormalCheckBox, showProtractorCheckBox ],
        function( item ) {
          return item.width;
        }
      ).width + 5;

    // touch Areas
    showReflectionsCheckBox.touchArea = new Bounds2(
      showReflectionsCheckBox.localBounds.minX - 5,
      showReflectionsCheckBox.localBounds.minY,
      showReflectionsCheckBox.localBounds.minX + maxCheckBoxWidth,
      showReflectionsCheckBox.localBounds.maxY
    );

    showNormalCheckBox.touchArea = new Bounds2(
      showNormalCheckBox.localBounds.minX - 5,
      showNormalCheckBox.localBounds.minY,
      showNormalCheckBox.localBounds.minX + maxCheckBoxWidth,
      showNormalCheckBox.localBounds.maxY
    );

    showProtractorCheckBox.touchArea = new Bounds2(
      showProtractorCheckBox.localBounds.minX - 5,
      showProtractorCheckBox.localBounds.minY,
      showProtractorCheckBox.localBounds.minX + maxCheckBoxWidth,
      showProtractorCheckBox.localBounds.maxY
    );

    // pad all the rows so the text nodes are left aligned and the icons is right aligned
    var checkBoxes = new VBox( {
      align: 'left', spacing: 4,
      children: [ showReflectionsCheckBox, showNormalCheckBox, showProtractorCheckBox ]
    } );
    content.addChild( checkBoxes );

    // Add the sensors panel
    var background = new Rectangle( 0, 0, content.width + 25, content.height + 2, 5, 5, {
      stroke: '#696969', lineWidth: 1.5, fill: '#EEEEEE'
    } );
    this.addChild( background );
    this.addChild( content );
    this.addChild( environmentMediumMaterialListParent );
    content.centerX = background.centerX;
    content.centerY = background.centerY;
    this.mutate( options );
  }

  bendingLight.register( 'PrismToolboxNode', PrismToolboxNode );

  return inherit( Node, PrismToolboxNode );
} );