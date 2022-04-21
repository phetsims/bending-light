// Copyright 2021-2022, University of Colorado Boulder

/**
 * Wave WebGl Rendering.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import { ShaderProgram, WebGLNode } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import LightRay from '../../common/model/LightRay.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { ObservableArray } from '../../../../axon/js/createObservableArray.js';

const scratchFloatArray1 = new Float32Array( 9 );
const scratchFloatArray2 = new Float32Array( 9 );

class WaveWebGLNode extends WebGLNode {
  readonly modelViewTransform: ModelViewTransform2;
  readonly rays: ObservableArray<LightRay>;

  /**
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {ObservableArrayDef.<LightRay>} rays - light rays
   */
  constructor( modelViewTransform: ModelViewTransform2, rays: ObservableArray<LightRay> ) {
    super( WavePainter );
    this.modelViewTransform = modelViewTransform; // (read-only)
    this.rays = rays; // @private
  }

  /**
   */
  step() {
    this.invalidatePaint();
  }
}

class WavePainter {
  private readonly gl: WebGLRenderingContext;
  private readonly node: WaveWebGLNode;
  shaderProgram: ShaderProgram;
  vertexBuffer: WebGLBuffer | null;

  /**
   * @param {WebGLRenderingContext} gl
   * @param {WaveWebGLNode} node
   */
  constructor( gl: WebGLRenderingContext, node: WaveWebGLNode ) {
    this.gl = gl;
    this.node = node;

    // Simple example for custom shader
    const vertexShaderSource = [

      // Position
      'attribute vec3 aPosition;', // vertex attribute
      'uniform mat3 uModelViewMatrix;',
      'uniform mat3 uProjectionMatrix;',
      'varying vec2 vPosition;',
      'void main( void ) {',
      '  vPosition = aPosition.xy;',

      // homogeneous model-view transformation
      'vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',

      // homogeneous map to normalized device coordinates
      'vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',

      // combine with the z coordinate specified
      'gl_Position = vec4( ndc.xy, aPosition.z, 1.0 );',
      '}'
    ].join( '\n' );

    // custom fragment shader
    const fragmentShaderSource = [
      'precision mediump float;',
      'uniform float uPowerFraction;', // light ray power fraction
      'uniform vec2 uTail;', // Tail point
      'uniform float uAngle;', // Angle of the ColoredRay
      'uniform float uWaveLength;', // Wavelength of the ColoredRay
      'uniform float uPhase;', // phase difference of the ColoredRay
      'uniform vec3 uColor;', // Color of the wave
      'varying vec2 vPosition;',
      'void main( void ) {',

      // Perpendicular distance from tail to rendering coordinate. This is obtained by Coordinate Transformation to
      // tail point and applying dot product to the unit vector in the direction of ray and rendering coordinate
      'float distance = dot(vec2(cos(uAngle),sin(uAngle)), vec2(vPosition.x-uTail.x,uTail.y - vPosition.y));',

      // finding the position of rendering coordinate in each wave particle to determine the color of the pixel
      'float positionDiff = mod( abs( distance - uPhase), uWaveLength);',

      // color is determined by perpendicular distance of coordinate from the start of the particle.
      'float colorFactor = abs( 1.0 - positionDiff / ( uWaveLength * 0.5 ) );',
      'gl_FragColor.rgb = uColor * (colorFactor);',
      'gl_FragColor.a = sqrt(uPowerFraction);',

      // Use premultipled alpha, see https://github.com/phetsims/energy-skate-park/issues/39
      'gl_FragColor.rgb *= gl_FragColor.a;',
      '}'
    ].join( '\n' );

    this.shaderProgram = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource, {
      attributes: [ 'aPosition' ],
      uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix', 'uPowerFraction', 'uTail', 'uAngle', 'uWaveLength',
        'uPhase', 'uColor' ]
    } );
    this.vertexBuffer = gl.createBuffer();
  }

  /**
   */
  paint( modelViewMatrix: Matrix3, projectionMatrix: Matrix3 ): 1 {
    const gl = this.gl;
    const shaderProgram = this.shaderProgram as ShaderProgram;
    const rays = this.node.rays;
    const modelViewTransform = this.node.modelViewTransform;

    shaderProgram.use();

    for ( let i = rays.length - 1; i >= 0; i-- ) {
      const elements = [];
      const lightRay = rays[ i ];
      if ( lightRay.waveShape ) {
        const lightRayWaveSubPath = lightRay.waveShape.subpaths[ 0 ];

        // get the x and y coordinates of wave corner points
        const point1X = modelViewTransform.modelToViewX( lightRayWaveSubPath.points[ 0 ].x );
        const point1Y = modelViewTransform.modelToViewY( lightRayWaveSubPath.points[ 0 ].y );
        const point2X = modelViewTransform.modelToViewX( lightRayWaveSubPath.points[ 1 ].x );
        const point2Y = modelViewTransform.modelToViewY( lightRayWaveSubPath.points[ 1 ].y );
        const point3X = modelViewTransform.modelToViewX( lightRayWaveSubPath.points[ 3 ].x );
        const point3Y = modelViewTransform.modelToViewY( lightRayWaveSubPath.points[ 3 ].y );
        const point4X = modelViewTransform.modelToViewX( lightRayWaveSubPath.points[ 2 ].x );
        const point4Y = modelViewTransform.modelToViewY( lightRayWaveSubPath.points[ 2 ].y );

        // points to draw light ray beam
        elements.push( point1X, point1Y, 1 );
        elements.push( point2X, point2Y, 1 );
        elements.push( point3X, point3Y, 1 );
        elements.push( point4X, point4Y, 1 );

        // light ray power fraction
        const lightRayPowerFraction = lightRay.powerFraction;

        // tail position in view co-ordinates
        const tailViewX = modelViewTransform.modelToViewX( lightRay.tail.x );
        const tailViewY = modelViewTransform.modelToViewY( lightRay.tail.y );

        // light ray angle
        const lightRayAngle = lightRay.getAngle();

        // light ray wavelength
        const wavelength = modelViewTransform.modelToViewDeltaX( lightRay.wavelength );

        // phase
        const totalPhaseOffsetInNumberOfWavelengths = lightRay.getPhaseOffset() / 2 / Math.PI;
        const phaseDiff = modelViewTransform.modelToViewDeltaX(
          // Just keep the fractional part
          ( totalPhaseOffsetInNumberOfWavelengths % 1 ) * lightRay.wavelength
        );

        // light ray color
        // @ts-ignore
        const red = lightRay.color.r / 255;
        // @ts-ignore
        const green = lightRay.color.g / 255;
        // @ts-ignore
        const blue = lightRay.color.b / 255;

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( elements ), gl.STATIC_DRAW );

        if ( shaderProgram ) {
          // @ts-ignore
          gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, modelViewMatrix.copyToArray( scratchFloatArray1 ) );
          // @ts-ignore
          gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, projectionMatrix.copyToArray( scratchFloatArray2 ) );
          // @ts-ignore
          gl.uniform1f( shaderProgram.uniformLocations.uPowerFraction, lightRayPowerFraction );
          // @ts-ignore
          gl.uniform2f( shaderProgram.uniformLocations.uTail, tailViewX, tailViewY );
          // @ts-ignore
          gl.uniform1f( shaderProgram.uniformLocations.uAngle, lightRayAngle );
          // @ts-ignore
          gl.uniform1f( shaderProgram.uniformLocations.uWaveLength, wavelength );
          // @ts-ignore
          gl.uniform1f( shaderProgram.uniformLocations.uPhase, phaseDiff );
          // @ts-ignore
          gl.uniform3f( shaderProgram.uniformLocations.uColor, red, green, blue );

          gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
          // @ts-ignore
          gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 3, gl.FLOAT, false, 0, 0 );

          gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
        }
      }
    }
    shaderProgram.unuse();

    return WebGLNode.PAINTED_SOMETHING;
  }

  /**
   */
  dispose() {
    this.shaderProgram.dispose();
    this.gl.deleteBuffer( this.vertexBuffer );
  }
}

bendingLight.register( 'WaveWebGLNode', WaveWebGLNode );

export default WaveWebGLNode;