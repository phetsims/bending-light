// Copyright 2002-2011, University of Colorado

/**
 * Prism toolbox which contains draggable prisms as well as the control panel
 * for their index of refraction.

 * @author Sam Reid
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
  // var PrismNode = require( 'BENDING_LIGHT/prisms/view/PrismNode' );

  //strings
  var prismsString = require( 'string!BENDING_LIGHT/prisms' );
  var objectsString = require( 'string!BENDING_LIGHT/objects' );
  var showReflectionsString = require( 'string!BENDING_LIGHT/showReflections' );
  var showNormalString = require( 'string!BENDING_LIGHT/showNormal' );
  var showProtractorString = require( 'string!BENDING_LIGHT/showProtractor' );

  /**
   *
   * @param canvas
   * @param modelViewTransform
   * @param model
   * @param options
   * @constructor
   */
  function PrismToolboxNode( canvas, modelViewTransform, model, options ) {

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
      spacing: 10
    } );
    //Create and add Title label for the prism toolbox
    var titleLabel = new Text( prismsString, { stroke: 'black', font: new PhetFont( 12 ) } );
    content.addChild( titleLabel );

    //Move it down so it doesn't overlap the title label
    content.setTranslation( 0, 5 );

    //Iterate over the prism prototypes in the model and create a draggable icon for each one

    //Allow the user to control the type of material in the prisms
    var environmentMediumMaterialListParent = new Node();
    content.addChild( new MediumControlPanel( model, canvas, model.prismMedium, objectsString, false, model.wavelengthProperty, 2, environmentMediumMaterialListParent, { lineWidth: 0 } ) );

    //Iterate over the prism prototypes in the model and create a draggable icon for each one
    //for ( var i = 0; model.getPrismPrototypes().length<=1; i++ ) {
    //content.addChild( new PrismNode( modelViewTransform, model.getPrismPrototypes()[ 0 ], model.prismMedium ) );

    //}
    // content.addChild( new PrismNode( modelViewTransform, '', model.prismMedium ) );


    // add check boxes

    //Create an icon for the protractor check box
    var createProtractorIcon = function() {
      var protractorModel = new ProtractorModel( 0, 0 );
      var protractorNode = new ProtractorNode( modelViewTransform, canvas.showProtractor, protractorModel,
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

    var showReflectionsCheckBox = new CheckBox( createItem( showReflections ), model.showReflections, checkBoxOptions );
    var showNormalCheckBox = new CheckBox( createItem( showNormal ), model.showNormals, checkBoxOptions );
    var showProtractorCheckBox = new CheckBox( createItem( showProtractor ), model.showProtractor,
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

