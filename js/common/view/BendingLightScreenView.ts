// Copyright 2015-2022, University of Colorado Boulder

/**
 * Base class for Bending Light
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Node } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import BendingLightModel from '../model/BendingLightModel.js';
import LaserNode from './LaserNode.js';
import RotationDragHandle from './RotationDragHandle.js';
import SingleColorLightCanvasNode from './SingleColorLightCanvasNode.js';
import ColorModeEnum from '../model/ColorModeEnum.js';
import LaserViewEnum from '../model/LaserViewEnum.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Multilink from '../../../../axon/js/Multilink.js';

type SelfOptions = {
  occlusionHandler?: ( node: Node ) => void;
  horizontalPlayAreaOffset?: number;
  verticalPlayAreaOffset?: number;
  clampDragAngle?: ( angle: number ) => number;
  ccwArrowNotAtMax?: ( angle: number ) => boolean;
  clockwiseArrowNotAtMax?: ( angle: number ) => boolean;
};
type BendingLightScreenViewOptions = SelfOptions & ScreenViewOptions;

abstract class BendingLightScreenView extends ScreenView {
  protected readonly showProtractorProperty: Property<boolean>;
  protected readonly bendingLightModel: BendingLightModel;
  protected readonly beforeLightLayer: Node;
  protected readonly beforeLightLayer2: Node;
  protected readonly afterLightLayer: Node;
  protected readonly afterLightLayer2: Node;
  protected readonly afterLightLayer3: Node;
  protected readonly mediumNode: Node;
  protected readonly incidentWaveLayer: Node;
  private readonly singleColorLightNode: SingleColorLightCanvasNode;
  protected readonly laserViewLayer: Node;
  protected readonly occlusionHandler: ( n: Node ) => void;
  protected readonly modelViewTransform: ModelViewTransform2;

  /**
   * @param bendingLightModel - main model of the simulations
   * @param laserHasKnob - laser image
   * @param [providedOptions]
   */
  public constructor( bendingLightModel: BendingLightModel, laserHasKnob: boolean, providedOptions?: BendingLightScreenViewOptions ) {

    const options = optionize<BendingLightScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      occlusionHandler: _.noop, // {function} moves objects out from behind a control panel if dropped there
      ccwArrowNotAtMax: () => true, // {function} shows whether laser at min angle
      clockwiseArrowNotAtMax: () => true, // {function} shows whether laser at max angle, In prisms tab
      // laser node can rotate 360 degrees.so arrows showing all the times when laser node rotate
      clampDragAngle: ( angle: number ) => angle, // {function} function that limits the angle of laser to its bounds
      horizontalPlayAreaOffset: 0, // {number} in stage coordinates, how far to shift the play area horizontally
      verticalPlayAreaOffset: 0 // {number} in stage coordinates, how far to shift the play area vertically.  In the
                                // prisms screen, it is shifted up a bit to center the play area above the south control panel
    }, providedOptions );

    super( {
      layoutBounds: new Bounds2( 0, 0, 834, 504 ),
      tandem: options.tandem
    } );

    this.occlusionHandler = options.occlusionHandler;
    this.bendingLightModel = bendingLightModel;

    this.showProtractorProperty = new BooleanProperty( false ); // (read-only)

    // In order to make controls (including the laser itself) accessible (not obscured by the large protractor), KP
    // suggested this layering order:
    // laser on top
    // Control boxes next
    // Protractor
    // Laser beam
    // To implement this, we specify 2 before light layers and 2 after light layers
    this.beforeLightLayer = new Node(); // (read-only)
    this.beforeLightLayer2 = new Node(); // (read-only)

    // in back of afterLightLayer2
    this.afterLightLayer = new Node(); // (read-only)
    this.afterLightLayer2 = new Node(); // (read-only)
    this.afterLightLayer3 = new Node(); // (read-only)

    const stageWidth = this.layoutBounds.width;
    const stageHeight = this.layoutBounds.height;

    // center the stage in the canvas, specifies how things scale up and down with window size, maps stage to pixels
    // create the transform from model (SI) to view (stage) coordinates
    const scale = stageHeight / bendingLightModel.modelHeight;

    // (read-only)
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( 0, 0 ),
      new Vector2( 388 - options.horizontalPlayAreaOffset, stageHeight / 2 + options.verticalPlayAreaOffset ),
      scale
    );

    // create and add the graphic for the environment medium
    this.mediumNode = new Node(); // (read-only)
    this.addChild( this.mediumNode );
    this.incidentWaveLayer = new Node(); // (read-only)

    this.singleColorLightNode = new SingleColorLightCanvasNode(
      this.modelViewTransform,
      stageWidth,
      stageHeight,
      bendingLightModel.rays
    );

    // layering
    this.addChild( this.beforeLightLayer );
    this.addChild( this.beforeLightLayer2 );
    this.addLightNodes( bendingLightModel ); // Nodes specific to that view
    this.addChild( this.singleColorLightNode );
    this.addChild( this.afterLightLayer );

    // This layer is to add laser view control panel
    // Note: this layer to make protractor behind laser view panel and laser node on top of laser view panel.
    this.laserViewLayer = new Node(); // (read-only)
    this.addChild( this.laserViewLayer );

    // add rotation for the laser that show if/when the laser can be rotated about its pivot
    const showRotationDragHandlesProperty = new BooleanProperty( false );
    const showTranslationDragHandlesProperty = new BooleanProperty( false );

    const laserNode = new LaserNode(
      this.modelViewTransform,
      bendingLightModel.laser,
      showRotationDragHandlesProperty,
      showTranslationDragHandlesProperty,
      options.clampDragAngle,
      laserHasKnob,
      this.visibleBoundsProperty,
      this.occlusionHandler, {
        tandem: options.tandem.createTandem( 'laserNode' )
      }
    );

    // add laser node rotation and translation arrows in array, to move them to front of all other nodes in prism screen
    this.addLaserHandles(
      showRotationDragHandlesProperty,
      showTranslationDragHandlesProperty,
      options.clockwiseArrowNotAtMax,
      options.ccwArrowNotAtMax,
      laserNode.laserImageWidth
    );

    // add the laser
    this.addChild( laserNode );

    this.addChild( this.afterLightLayer2 );

    // Layer for the rightmost control panels, so that all sensors will go behind them
    this.addChild( this.afterLightLayer3 );

    // switches between ray and wave
    bendingLightModel.laserViewProperty.link( laserView => {
      bendingLightModel.laser.waveProperty.value = ( laserView === LaserViewEnum.WAVE );
    } );

    Multilink.multilink( [ bendingLightModel.laser.colorModeProperty, bendingLightModel.laserViewProperty ],
      ( colorMode, laserView ) => {
        this.singleColorLightNode.visible = laserView === LaserViewEnum.RAY && colorMode !== ColorModeEnum.WHITE;
      }
    );

    this.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => this.singleColorLightNode.setCanvasBounds( visibleBounds ) );
  }

  /**
   */
  public reset(): void {
    this.showProtractorProperty.reset();
  }

  // intended to be overridden by subclasses
  public override step(): void {
    if ( this.singleColorLightNode.visible ) {
      this.singleColorLightNode.step();
    }
  }

  /**
   * overridden for IntroScreenView to add the wave nodes
   */
  protected abstract addLightNodes( bendingLightModel: BendingLightModel ): void;

  protected addLaserHandles( showRotationDragHandlesProperty: Property<boolean>, showTranslationDragHandlesProperty: Property<boolean>,
                             clockwiseArrowNotAtMax: ( n: number ) => boolean, ccwArrowNotAtMax: ( n: number ) => boolean, laserImageWidth: number ): void {
    const bendingLightModel = this.bendingLightModel;

    if ( typeof bendingLightModel.rotationArrowAngleOffset === 'number' ) {
      // Shows the direction in which laser can be rotated
      // for laser left rotation
      const leftRotationDragHandle = new RotationDragHandle( this.modelViewTransform, bendingLightModel.laser,
        Math.PI / 23, showRotationDragHandlesProperty, clockwiseArrowNotAtMax, laserImageWidth * 0.58,
        bendingLightModel.rotationArrowAngleOffset );
      this.addChild( leftRotationDragHandle );

      // for laser right rotation
      const rightRotationDragHandle = new RotationDragHandle( this.modelViewTransform, bendingLightModel.laser,
        -Math.PI / 23,
        showRotationDragHandlesProperty, ccwArrowNotAtMax, laserImageWidth * 0.58,
        bendingLightModel.rotationArrowAngleOffset
      );
      this.addChild( rightRotationDragHandle );
    }
    else {
      assert && assert( false, 'should have been a number' );
    }
  }
}

bendingLight.register( 'BendingLightScreenView', BendingLightScreenView );
export type { BendingLightScreenViewOptions };
export default BendingLightScreenView;