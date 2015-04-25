// Copyright 2002-2015, University of Colorado Boulder
/**
 * Wave WebGl Rendering.
 * @author Chandrashekar Bemagoni  (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform , Transform between model and view coordinate frames
   * @param {ObservableArray<LightRay>} rays
   * @constructor
   */
  function WaveWebGLNode( modelViewTransform, rays ) {
    this.modelViewTransform = modelViewTransform;
    this.rays = rays;
    WebGLNode.call( this );
  }

  return inherit( WebGLNode, WaveWebGLNode, {

    initializeWebGLDrawable: function( drawable ) {
      var gl = drawable.gl;

      // Simple example for custom shader
      var vertexShaderSource = [
        // Position
        'attribute vec3 aPosition;',
        'attribute float aPowerFraction;',
        'attribute vec3 aColor;',
        'attribute vec2 aTail;',
        'attribute float aAngle;',
        'attribute float aWaveLength;',
        'attribute float aPhase;',
        'varying vec3 vPosition;',
        'varying float vPowerFraction;',
        'varying vec3 vColor;',
        'varying vec2 vTail;',
        'varying float vAngle;',
        'varying float vWaveLength;',
        'varying float vPhase;',
        'uniform mat3 uModelViewMatrix;',
        'uniform mat3 uProjectionMatrix;',
        'void main( void ) {',
        'vPosition = aPosition;',
        '  vPowerFraction = aPowerFraction;',
        '  vColor = aColor;',
        '  vTail = aTail;',
        '  vAngle = aAngle;',
        '  vWaveLength = aWaveLength;',
        '  vPhase = aPhase;',
        // homogeneous model-view transformation
        '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',
        // homogeneous map to to normalized device coordinates
        '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',
        // combine with the z coordinate specified
        '  gl_Position = vec4( ndc.xy, aPosition.z, 1.0 );',
        '}'
      ].join( '\n' );

      //   custom  fragment shader
      var fragmentShaderSource = [
        'precision highp float;',
        'varying vec3 vPosition;',
        'varying float vPowerFraction;',
        'varying vec3 vColor;',
        'varying vec2 vTail;',
        'varying float vAngle;',
        'varying float vWaveLength;',
        'varying float vPhase;',
        'void main( void ) {',
        'float waveLength = float(vWaveLength);',
        'float distance = (tan(vAngle-1.57)*gl_FragCoord.x - gl_FragCoord.y + vTail.y -tan(vAngle-1.57)*vTail.x ) * pow(cos(vAngle-1.57),2.0);',
        'float positionDiff = distance>vPhase?distance - vPhase:distance;',
        'for(int i=0;i<100;i++){',
        'if(positionDiff>waveLength){',
        'positionDiff = positionDiff-waveLength;',
        '}',
        'else{',
        'break;',
        '}',
        '}',
        'if(positionDiff<waveLength/2.0){',
        'gl_FragColor = vec4( vColor*(positionDiff/(waveLength/2.0)) + vec3(0,0,0)*(((waveLength/2.0)-positionDiff)/(waveLength/2.0)),vPowerFraction ) ;',
        '}',
        'else{',
        'positionDiff = positionDiff -waveLength/2.0;',
        'gl_FragColor = vec4( vec3(0,0,0)*(positionDiff/(waveLength/2.0)) + vColor*(((waveLength/2.0)-positionDiff)/(waveLength/2.0)),vPowerFraction ) ;',
        '}',
        '}'
      ].join( '\n' );

      drawable.shaderProgram = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource, {
        attributes: [ 'aPosition', 'aPowerFraction', 'aColor', 'aTail', 'aAngle', 'aWaveLength', 'aPhase' ],
        uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix' ]
      } );
    },
    paintWebGLDrawable: function( drawable, matrix ) {
      var gl = drawable.gl;
      var shaderProgram = drawable.shaderProgram;

      var elements = [];
      var powerFractionArray = [];
      var colorArray = [];
      var tailPointArray = [];
      var anglesArray = [];
      var waveLengthArray = [];
      var phaseArray = [];

      for ( var i = this.rays.length - 1; i >= 0; i-- ) {
        var lightRay = this.rays.get( i );

        var point1 = this.modelViewTransform.modelToViewPosition( lightRay.getWaveShape().subpaths[ 0 ].points[ 0 ] );
        var point2 = this.modelViewTransform.modelToViewPosition( lightRay.getWaveShape().subpaths[ 0 ].points[ 1 ] );
        var point3 = this.modelViewTransform.modelToViewPosition( lightRay.getWaveShape().subpaths[ 0 ].points[ 3 ] );
        var point4 = this.modelViewTransform.modelToViewPosition( lightRay.getWaveShape().subpaths[ 0 ].points[ 2 ] );

        // elements
        elements.push( point1.x, point1.y, 1 );
        elements.push( point2.x, point2.y, 1 );
        elements.push( point3.x, point3.y, 1 );
        elements.push( point3.x, point3.y, 1 );
        elements.push( point2.x, point2.y, 1 );
        elements.push( point4.x, point4.y, 1 );
        var numberOfVertexPoints = 6;

        // light ray power fraction
        var lightRayPowerFraction = lightRay.getPowerFraction();

        // light ray color
        var red = lightRay.getColor().r / 255;
        var green = lightRay.getColor().g / 255;
        var blue = lightRay.getColor().b / 255;

        // tail position in view co-ordinates
        var tailView = this.modelViewTransform.modelToViewPosition( lightRay.tail );

        // light ray  angle
        var lightRayAngle = lightRay.getAngle();

        //  phase
        var totalPhaseOffsetInNumberOfWavelengths = lightRay.getPhaseOffset() / 2 / Math.PI;
        var phaseOffset = lightRay.getUnitVector().times( this.modelViewTransform.modelToViewDeltaX( totalPhaseOffsetInNumberOfWavelengths * lightRay.getWavelength() ) );
        var phaseDiff = phaseOffset.magnitude() % this.modelViewTransform.modelToViewDeltaX( lightRay.wavelength );

        for ( var k = 0; k < numberOfVertexPoints; k++ ) {
          powerFractionArray.push( lightRayPowerFraction );
          colorArray.push( red, green, blue );
          tailPointArray.push( tailView.x, tailView.y );
          anglesArray.push( lightRayAngle );
          waveLengthArray.push( this.modelViewTransform.modelToViewDeltaX( lightRay.wavelength ) );
          phaseArray.push( phaseDiff );
        }
      }

      drawable.vertexBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( elements ), gl.STATIC_DRAW );

      drawable.powerFractionBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.powerFractionBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( powerFractionArray ), gl.STATIC_DRAW );

      drawable.colorBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.colorBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colorArray ), gl.STATIC_DRAW );

      drawable.tailBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.tailBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( tailPointArray ), gl.STATIC_DRAW );

      drawable.angleBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.angleBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( anglesArray ), gl.STATIC_DRAW );

      drawable.waveLengthBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.waveLengthBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( waveLengthArray ), gl.STATIC_DRAW );

      drawable.phaseBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.phaseBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( phaseArray ), gl.STATIC_DRAW );

      shaderProgram.use();
      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, new Float32Array( matrix.entries ) );
      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, new Float32Array( drawable.webGLBlock.projectionMatrixArray ) );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 3, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.powerFractionBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPowerFraction, 1, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.colorBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aColor, 3, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.tailBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aTail, 2, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.angleBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aAngle, 1, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.waveLengthBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aWaveLength, 1, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.phaseBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPhase, 1, gl.FLOAT, false, 0, 0 );

      gl.drawArrays( gl.TRIANGLES, 0, this.rays.length * 6 );
      shaderProgram.unuse();
    },

    disposeWebGLDrawable: function( drawable ) {
      drawable.shaderProgram.dispose();
      drawable.gl.deleteBuffer( drawable.vertexBuffer );
      drawable.shaderProgram = null;
    },

    step: function() {
      this.invalidatePaint();
    }

  } );
} );
