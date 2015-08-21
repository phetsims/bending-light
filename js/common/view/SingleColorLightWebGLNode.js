// Copyright 2002-2015, University of Colorado Boulder

/**
 * This WebGLNode renders the light rays for the non-white rays.  It is used only when WebGL is not available.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var LightRay = require( 'BENDING_LIGHT/common/model/LightRay' );
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {ModelViewTransform2} modelViewTransform - converts between model and view co-ordinates
   * @param {number} stageWidth - width of the dev area
   * @param {number} stageHeight - height of the dev area
   * @param {ObservableArray.<LightRay>} rays -
   * @constructor
   */
  function SingleColorLightWebGLNode( modelViewTransform, stageWidth, stageHeight, rays ) {

    WebGLNode.call( this, {
      canvasBounds: new Bounds2( 0, 0, stageWidth, stageHeight )
    } );
    this.modelViewTransform = modelViewTransform; // @private
    this.stageHeight = stageHeight; // @private
    this.stageWidth = stageWidth; // @private

    this.rays = rays;
    this.invalidatePaint();

    this.strokeWidth = this.modelViewTransform.modelToViewDeltaX( LightRay.RAY_WIDTH );
  }

  return inherit( WebGLNode, SingleColorLightWebGLNode, {

    initializeWebGLDrawable: function( drawable ) {
      var gl = drawable.gl;

      // Simple example for custom shader
      var vertexShaderSource = [
        // Position
        'attribute vec3 aPosition;',
        'attribute vec3 aColor;',
        'varying vec3 vColor;',
        'uniform mat3 uModelViewMatrix;',
        'uniform mat3 uProjectionMatrix;',

        'void main( void ) {',
        '  vColor = aColor;',

        // homogeneous model-view transformation
        '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',

        // homogeneous map to to normalized device coordinates
        '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',

        // combine with the z coordinate specified
        '  gl_Position = vec4( ndc.xy, aPosition.z, 1.0 );',
        '}'
      ].join( '\n' );

      // Simple demo for custom shader
      var fragmentShaderSource = [
        'precision mediump float;',
        'varying vec3 vColor;',

        // Returns the color from the vertex shader
        'void main( void ) {',
        '  gl_FragColor = vec4( vColor, 1.0 );',
        '}'
      ].join( '\n' );

      drawable.shaderProgram = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource, {
        attributes: [ 'aPosition', 'aColor' ],
        uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix' ]
      } );

      drawable.vertexBuffer = gl.createBuffer();
      drawable.colorBuffer = gl.createBuffer();

      this.updateGeometry( drawable );
    },
    updateGeometry: function( drawable ) {
      var gl = drawable.gl;

      //context.lineWidth = this.strokeWidth;

      var points = [];
      var colors = [];
      for ( var i = 0; i < this.rays.length; i++ ) {
        var ray = this.rays.get( i );

        // iPad3 shows a opacity=0 ray as opacity=1 for unknown reasons, so we simply omit those rays
        if ( ray.powerFraction > 1E-6 ) {

          //context.strokeStyle = 'rgba(' +
          //                      ray.color.getRed() + ',' +
          //                      ray.color.getGreen() + ',' +
          //                      ray.color.getBlue() + ',' +
          //                      Math.sqrt( ray.powerFraction ) +
          //                      ')';

          points.push(
            this.modelViewTransform.modelToViewX( ray.tail.x ), this.modelViewTransform.modelToViewY( ray.tail.y ), 0.2,
            this.modelViewTransform.modelToViewX( ray.tail.x ) + 10, this.modelViewTransform.modelToViewY( ray.tail.y ), 0.2,
            this.modelViewTransform.modelToViewX( ray.tip.x ), this.modelViewTransform.modelToViewY( ray.tip.y ), 0.2

            // TODO: we need another triangle
            //this.modelViewTransform.modelToViewX( ray.tail.x ), this.modelViewTransform.modelToViewY( ray.tail.y ), 0.2,
            //this.modelViewTransform.modelToViewX( ray.tail.x ), this.modelViewTransform.modelToViewY( ray.tail.y ), 0.2,
            //this.modelViewTransform.modelToViewX( ray.tail.x ), this.modelViewTransform.modelToViewY( ray.tail.y ), 0.2,
          );

          colors.push(
            ray.color.getRed(), ray.color.getGreen(), ray.color.getBlue(),
            ray.color.getRed(), ray.color.getGreen(), ray.color.getBlue(),
            ray.color.getRed(), ray.color.getGreen(), ray.color.getBlue()
          );
        }
      }

      // This debug code shows the bounds
      // context.lineWidth = 10;
      // context.strokeStyle = 'blue';
      // context.strokeRect(
      //  this.canvasBounds.minX, this.canvasBounds.minY,
      //  this.canvasBounds.width, this.canvasBounds.height
      // );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.colorBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );
    },

    paintWebGLDrawable: function( drawable, matrix ) {
      this.updateGeometry( drawable );

      var gl = drawable.gl;
      var shaderProgram = drawable.shaderProgram;

      shaderProgram.use();

      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, matrix.entries );
      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, drawable.webGLBlock.projectionMatrixArray );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 3, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.colorBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aColor, 3, gl.FLOAT, false, 0, 0 );

      gl.drawArrays( gl.TRIANGLES, 0, this.rays.length * 3 );

      shaderProgram.unuse();
    },

    disposeWebGLDrawable: function( drawable ) {
      drawable.shaderProgram.dispose();
      drawable.gl.deleteBuffer( drawable.vertexBuffer );

      drawable.shaderProgram = null;
    },
    /**
     * Paints the particles on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;

      context.lineWidth = this.strokeWidth;
      for ( var i = 0; i < this.rays.length; i++ ) {
        var ray = this.rays.get( i );

        // iPad3 shows a opacity=0 ray as opacity=1 for unknown reasons, so we simply omit those rays
        if ( ray.powerFraction > 1E-6 ) {
          context.beginPath();

          context.strokeStyle = 'rgba(' +
                                ray.color.getRed() + ',' +
                                ray.color.getGreen() + ',' +
                                ray.color.getBlue() + ',' +
                                Math.sqrt( ray.powerFraction ) +
                                ')';

          context.moveTo(
            this.modelViewTransform.modelToViewX( ray.tail.x ),
            this.modelViewTransform.modelToViewY( ray.tail.y )
          );

          context.lineTo(
            this.modelViewTransform.modelToViewX( ray.tip.x ),
            this.modelViewTransform.modelToViewY( ray.tip.y )
          );
          context.stroke();
        }
      }

      // This debug code shows the bounds
      // context.lineWidth = 10;
      // context.strokeStyle = 'blue';
      // context.strokeRect(
      //  this.canvasBounds.minX, this.canvasBounds.minY,
      //  this.canvasBounds.width, this.canvasBounds.height
      // );
    },

    step: function() {
      this.invalidatePaint();
    }
  } );
} );