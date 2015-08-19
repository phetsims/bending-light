// Copyright 2002-2015, University of Colorado Boulder

/**
 * Prism toolbox which contains draggable prisms as well as the control panel
 * for their index of refraction.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var MediumControlPanel = require( 'BENDING_LIGHT/common/view/MediumControlPanel' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Path = require( 'SCENERY/nodes/Path' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Vector2 = require( 'DOT/Vector2' );
  var PrismNode = require( 'BENDING_LIGHT/prisms/view/PrismNode' );
  var Shape = require( 'KITE/Shape' );

  // strings
  var objectsString = require( 'string!BENDING_LIGHT/objects' );
  var reflectionsString = require( 'string!BENDING_LIGHT/reflections' );
  var normalString = require( 'string!BENDING_LIGHT/normal' );
  var protractorString = require( 'string!BENDING_LIGHT/protractor' );

  // images
  var KnobImage = require( 'image!BENDING_LIGHT/knob.png' );
  var protractorImage = require( 'image!BENDING_LIGHT/protractor.png' );

  // constants
  var MAX_TEXT_WIDTH = 115;

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {PrismsModel} prismsModel - model of the prism screen
   * @param {Node} prismLayer - layer in which prisms are present when in play area
   * @param {Bounds2} layoutBounds - Bounds of prisms screen.
   * @param {function} occlusionHandler - function that takes one node as a parameter and updates it if occluded by a
   *                                    - control panel
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function PrismToolboxNode( modelViewTransform, prismsModel, prismLayer, layoutBounds, occlusionHandler, options ) {
    var prismToolBoxNode = this;

    Node.call( this );
    var content = new HBox( {
      spacing: 8.4
    } );

    // Create prism icon
    var createPrismIcon = function( prism ) {
      var prismIconNode = new Node( { cursor: 'pointer' } );
      var knobHeight = 15;
      prismIconNode.addChild( new Path( modelViewTransform.modelToViewShape( prism.shape.shape ), {
        fill: '#ABA8D6',
        stroke: '#ABA8D6'
      } ) );

      // Knob image
      var knobNode = new Image( KnobImage );
      if ( prism.shape.getReferencePoint() ) {
        prismIconNode.addChild( knobNode );
      }

      if ( prism.shape.getReferencePoint() ) {
        knobNode.resetTransform();
        knobNode.setScaleMagnitude( knobHeight / knobNode.height );
        var angle = modelViewTransform.modelToViewPosition( prism.shape.getRotationCenter() ).subtract(
          modelViewTransform.modelToViewPosition( prism.shape.getReferencePoint() ) ).angle();
        var offsetX = -knobNode.getWidth() - 7;
        var offsetY = -knobNode.getHeight() / 2 - 8;
        knobNode.rotateAround( new Vector2( -offsetX, -offsetY ), angle );
        var knobPosition = modelViewTransform.modelToViewPosition( prism.shape.getReferencePoint() );
        knobNode.setTranslation( knobPosition.x, knobPosition.y );
        knobNode.translate( offsetX, offsetY );
      }
      return prismIconNode;
    };

    // Iterate over the prism prototypes in the model and create a draggable icon for each one
    var prismNode;
    prismsModel.getPrismPrototypes().forEach( function( prism, i ) {
      var prismIcon = createPrismIcon( prism );
      var start;
      var prismShape;
      var prismIconBounds = prismIcon.bounds;
      prismIcon.scale( 55 / prismIcon.height );
      var shape = new Path( Shape.rectangle( prismIconBounds.minX, prismIconBounds.minY, prismIconBounds.getWidth(), prismIconBounds.getHeight() ), {
        pickable: true,
        cursor: 'pointer'
      } );
      shape.addInputListener( new SimpleDragHandler( {

          start: function( event ) {
            start = prismToolBoxNode.globalToParentPoint( event.pointer.point );
            prismShape = prism.copy();
            prismsModel.addPrism( prismShape );
            prismNode = new PrismNode( prismsModel, modelViewTransform, prismShape, prismToolBoxNode, prismLayer,
              layoutBounds, occlusionHandler );
            prismLayer.addChild( prismNode );
            prismShape.translate( modelViewTransform.viewToModelX( start.x ), modelViewTransform.viewToModelY( start.y ) );

            // If there were already MAX-1 of them in the play area, hide the icon
            //prismIcon.visible = false;
          },
          drag: function( event ) {
            var end = prismToolBoxNode.globalToParentPoint( ( event.pointer.point ) );
            end = layoutBounds.closestPointTo( end );
            var dx = modelViewTransform.viewToModelDeltaX( end.x - start.x );
            var dy = modelViewTransform.viewToModelDeltaY( end.y - start.y );
            prismShape.translate( dx, dy );
            start = end;
          },
          end: function() {
            if ( prismToolBoxNode.visibleBounds.containsCoordinates( prismNode.getCenterX(), prismNode.getCenterY() ) ) {
              prismsModel.removePrism( prismShape );
              prismShape.shapeProperty.unlink( prismNode.updatePrismShape );
              prismsModel.prismMediumProperty.unlink( prismNode.updatePrismColor );
              prismLayer.removeChild( prismNode );
              prismsModel.dirty = true;
            }
            else {
              occlusionHandler( prismNode );
            }
          }
        }
      ) );

      prismIcon.touchArea = prismIcon.localBounds;
      content.addChild( prismIcon );
      prismIcon.addChild( shape );
    } );

    // Allow the user to control the type of material in the prisms
    var environmentMediumMaterialListParent = new Node();
    var objectMediumControlPanel = new MediumControlPanel( environmentMediumMaterialListParent,
      prismsModel.prismMediumProperty,
      objectsString,
      false,
      prismsModel.wavelengthProperty,
      2, {
        lineWidth: 0,
        xMargin: 0,
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
      protractorImageNode.scale( 20 / protractorImage.width );
      return protractorImageNode;
    };

    var textOptions = { font: new PhetFont( 10 ) };

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    var showReflections = { label: new Text( reflectionsString, textOptions ) };
    var showNormal = { label: new Text( normalString, textOptions ) };
    var showProtractor = { label: new Text( protractorString, textOptions ), icon: createProtractorIcon() };

    // compute the maximum item width
    var widestItem = _.max( [ showReflections, showNormal, showProtractor ], function( item ) {
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

    var maxCheckBoxWidth = _.max( [ showReflectionsCheckBox, showNormalCheckBox, showProtractorCheckBox ],
        function( item ) {
          return item.width;
        }
      ).width + 5;

    // touch Areas
    showReflectionsCheckBox.touchArea = new Bounds2(
      showReflectionsCheckBox.localBounds.minX - 5, showReflectionsCheckBox.localBounds.minY,
      showReflectionsCheckBox.localBounds.minX + maxCheckBoxWidth, showReflectionsCheckBox.localBounds.maxY
    );

    showNormalCheckBox.touchArea = new Bounds2(
      showNormalCheckBox.localBounds.minX - 5, showNormalCheckBox.localBounds.minY,
      showNormalCheckBox.localBounds.minX + maxCheckBoxWidth, showNormalCheckBox.localBounds.maxY
    );

    showProtractorCheckBox.touchArea = new Bounds2(
      showProtractorCheckBox.localBounds.minX - 5, showProtractorCheckBox.localBounds.minY,
      showProtractorCheckBox.localBounds.minX + maxCheckBoxWidth, showProtractorCheckBox.localBounds.maxY
    );

    // pad all the rows so the text nodes are left aligned and the icons is right aligned
    var checkBoxes = new VBox( {
      align: 'left', spacing: 4,
      children: [ showReflectionsCheckBox, showNormalCheckBox, showProtractorCheckBox ]
    } );
    content.addChild( checkBoxes );

    // Add the sensors panel
    var sensorPanel = new Rectangle( 0, 0, content.width + 25, content.height + 2, 5, 5, {
      stroke: '#696969', lineWidth: 1.5, fill: '#EEEEEE'
    } );
    this.addChild( sensorPanel );
    this.addChild( content );
    this.addChild( environmentMediumMaterialListParent );
    content.centerX = sensorPanel.centerX;
    content.centerY = sensorPanel.centerY;
    this.mutate( options );
  }

  return inherit( Node, PrismToolboxNode );
} );