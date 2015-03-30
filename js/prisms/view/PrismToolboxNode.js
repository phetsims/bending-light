// Copyright 2002-2015, University of Colorado

/**
 * Prism toolbox which contains draggable prisms as well as the control panel
 * for their index of refraction.

 * @author Sam Reid
 * @author Chandrashekar Bemagoni {Actual Concepts}
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SUN/HStrut' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var MediumControlPanel = require( 'BENDING_LIGHT/common/view/MediumControlPanel' );
  var ProtractorNode = require( 'BENDING_LIGHT/common/view/ProtractorNode' );
  var ProtractorModel = require( 'BENDING_LIGHT/common/model/ProtractorModel' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Path = require( 'SCENERY/nodes/Path' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Vector2 = require( 'DOT/Vector2' );

  //strings
  var objectsString = require( 'string!BENDING_LIGHT/objects' );
  var showReflectionsString = require( 'string!BENDING_LIGHT/showReflections' );
  var showNormalString = require( 'string!BENDING_LIGHT/showNormal' );
  var showProtractorString = require( 'string!BENDING_LIGHT/showProtractor' );

  // images
  var KnobImage = require( 'image!BENDING_LIGHT/knob.png' );


  /**
   *
   * @param {PrismBreakView} canvas
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {PrismBreakModel} prismBreakModel - model of the prism screen
   * @param {Object} [options ] that can be passed on to the underlying node
   * @constructor
   */
  function PrismToolboxNode( canvas, modelViewTransform, prismBreakModel, options ) {

    options = _.extend( {
      xMargin: 10,
      yMargin: 7,
      fill: '#f2fa6a ',
      stroke: 'gray',
      lineWidth: 1
    }, options );
    var prismsToolBoxNode = this;
    Node.call( this );
    var content = new HBox( {
      spacing: 4
    } );
    //Move it down so it doesn't overlap the title label
    content.setTranslation( 0, 5 );
    var prismPath = [];
    // create prism icon
    var createPrismIcon = function( prism ) {
      var prismIconNode = new Node( { cursor: 'pointer' } );
      var knobHeight = 15;
      prismIconNode.addChild( new Path( modelViewTransform.modelToViewShape( prism.shapeProperty.get().toShape() ), {
        fill: '#ABA8D6',
        stroke: '#ABA8D6'
      } ) );
      var knobNode = new Image( KnobImage );
      if ( prism.shapeProperty.get().getReferencePoint() ) {
        prismIconNode.addChild( knobNode );
      }
      if ( prism.shapeProperty.get().getReferencePoint() ) {

        knobNode.resetTransform();
        knobNode.setScaleMagnitude( knobHeight / knobNode.height );
        var angle = modelViewTransform.modelToViewPosition( prism.shapeProperty.get().getRotationCenter() ).minus(
          modelViewTransform.modelToViewPosition( prism.shapeProperty.get().getReferencePoint() ) ).angle();
        var offsetX = -knobNode.getWidth() - 7;
        var offsetY = -knobNode.getHeight() / 2 - 8;
        knobNode.rotateAround( new Vector2( -offsetX, -offsetY ), angle );
        var knobPosition = modelViewTransform.modelToViewPosition( prism.shapeProperty.get().getReferencePoint() );
        knobNode.setTranslation( knobPosition.x, knobPosition.y );
        knobNode.translate( offsetX, offsetY );
      }
      return prismIconNode;
    };

    //Iterate over the prism prototypes in the model and create a draggable icon for each one
    prismBreakModel.getPrismPrototypes().forEach( function( prism, i ) {
      prismPath[ i ] = createPrismIcon( prism );
      var start;
      var prismShape;
      prismPath[ i ].scale( 70 / prismPath[ i ].height );
      prismPath[ i ].addInputListener( new SimpleDragHandler( {

          start: function( event ) {
            start = prismsToolBoxNode.globalToParentPoint( event.pointer.point );
            prismShape = prism.copy();
            prismBreakModel.addPrism( prismShape );
            prismShape.translate( modelViewTransform.viewToModelPosition( start ) );
          },
          drag: function( event ) {
            var end = prismsToolBoxNode.globalToParentPoint( ( event.pointer.point ) );
            prismShape.translate( modelViewTransform.viewToModelDelta( end.minus( start ) ) );
            start = end;
          },
          end: function( event ) {
          }
        }
      ) );
      content.addChild( prismPath[ i ] );
    } );
    //Allow the user to control the type of material in the prisms
    var environmentMediumMaterialListParent = new Node();
    var objectMediumControlPanel = new MediumControlPanel( environmentMediumMaterialListParent,
      prismBreakModel.prismMediumProperty,
      objectsString,
      false,
      prismBreakModel.wavelengthProperty,
      2, {
        lineWidth: 0
      } );
    var dividerBetweenPrismsAndPanel = new Rectangle( 0, 0, 0.6, objectMediumControlPanel.height, 10, 10, {
      stroke: 'gray', lineWidth: 0.4, fill: 'gray'
    } );
    content.addChild( dividerBetweenPrismsAndPanel );

    content.addChild( objectMediumControlPanel );
    var dividerBetweenMediumPanelAndControlPanel = new Rectangle( 0, 0, 0.6, objectMediumControlPanel.height, 10, 10, {
      stroke: 'gray', lineWidth: 0.4, fill: 'gray'
    } );
    content.addChild( dividerBetweenMediumPanelAndControlPanel );
    // add check boxes
    //Create an icon for the protractor check box
    var createProtractorIcon = function() {
      var protractorModel = new ProtractorModel( 0, 0 );
      var protractorNode = new ProtractorNode( modelViewTransform, canvas.showProtractorProperty, protractorModel,
        canvas.getProtractorDragRegion, canvas.getProtractorRotationRegion, 90, prismsToolBoxNode.getBounds() );
      protractorNode.setScaleMagnitude( 0.05 );
      return protractorNode;
    };

    var textOptions = { font: new PhetFont( 10 ) };

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    var showReflections = { label: new Text( showReflectionsString, textOptions ) };
    var showNormal = { label: new Text( showNormalString, textOptions ) };
    var showProtractor = { label: new Text( showProtractorString, textOptions ), icon: createProtractorIcon() };
    // compute the maximum item width
    var widestItemSpec = _.max( [ showReflections, showNormal, showProtractor ], function( item ) {
      return item.label.width + ((item.icon) ? item.icon.width : 0);
    } );
    var maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 17;
        return new HBox( { children: [ itemSpec.label, new HStrut( strutWidth ), itemSpec.icon ] } );
      }
      else {
        return new HBox( { children: [ itemSpec.label ] } );
      }
    };

    var checkBoxOptions = {
      boxWidth: 15,
      spacing: 2
    };

    var showReflectionsCheckBox = new CheckBox( createItem( showReflections ), prismBreakModel.showReflectionsProperty, checkBoxOptions );
    var showNormalCheckBox = new CheckBox( createItem( showNormal ), prismBreakModel.showNormalsProperty, checkBoxOptions );
    var showProtractorCheckBox = new CheckBox( createItem( showProtractor ), prismBreakModel.showProtractorProperty,
      checkBoxOptions );

    var maxCheckBoxWidth = _.max( [ showReflectionsCheckBox, showNormalCheckBox, showProtractorCheckBox ],
        function( item ) {
          return item.width;
        } ).width + 5;

    //touch Areas
    showReflectionsCheckBox.touchArea = new Bounds2( showReflectionsCheckBox.localBounds.minX - 5, showReflectionsCheckBox.localBounds.minY,
      showReflectionsCheckBox.localBounds.minX + maxCheckBoxWidth, showReflectionsCheckBox.localBounds.maxY );
    showNormalCheckBox.touchArea = new Bounds2( showNormalCheckBox.localBounds.minX - 5, showNormalCheckBox.localBounds.minY,
      showNormalCheckBox.localBounds.minX + maxCheckBoxWidth, showNormalCheckBox.localBounds.maxY );
    showProtractorCheckBox.touchArea = new Bounds2( showProtractorCheckBox.localBounds.minX - 5,
      showProtractorCheckBox.localBounds.minY,
      showProtractorCheckBox.localBounds.minX + maxCheckBoxWidth, showProtractorCheckBox.localBounds.maxY );

    // pad all the rows so the text nodes are left aligned and the icons is right aligned

    var checkBoxes = new VBox( {
      align: 'left', spacing: 10,
      children: [ showReflectionsCheckBox, showNormalCheckBox, showProtractorCheckBox ]
    } );
    content.addChild( checkBoxes );
    // add the sensors panel
    var sensorPanel = new Rectangle( 0, 0, content.width + 5, content.height, 10, 10, {
      stroke: 'gray', lineWidth: 1, fill: '#EEEEEE'
    } );
    this.addChild( sensorPanel );
    this.addChild( content );
    this.addChild( environmentMediumMaterialListParent );
    content.centerX = sensorPanel.centerX;
    content.centerY = sensorPanel.centerY;
    this.mutate( options );


  }

  return inherit( Node, PrismToolboxNode, {} );
} );

