'use client';

import { useEffect, useRef } from 'react';

interface GrokBlackHoleFrameProps {
  size: number;
}

export default function GrokBlackHoleFrame({ size }: GrokBlackHoleFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    let animationFrameId: number;
    let program: WebGLProgram | null = null;
    let startTime = performance.now();

    // Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader (Adapted from user provided code)
    const fsSource = `
      precision mediump float;
      uniform float t;
      uniform vec2 r;  // resolution
      uniform float u_hover; // 0.0 to 1.0

      // Custom tanh function
      vec2 myTanh(vec2 x) {
        vec2 ex = exp(x);
        vec2 emx = exp(-x);
        return (ex - emx) / (ex + emx);
      }
      
      void main() {
        vec4 o_bg = vec4(0.0);
        vec4 o_anim = vec4(0.0);

        // ---------------------------
        // Background (Image) Layer
        // ---------------------------
        {
          vec2 p_img = (gl_FragCoord.xy * 2.0 - r) / r.y * mat2(1.0, -1.0, 1.0, 1.0);
          vec2 l_val = myTanh(p_img * 5.0 + 2.0);
          l_val = min(l_val, l_val * 3.0);
          vec2 clamped = clamp(l_val, -2.0, 0.0);
          float diff_y = clamped.y - l_val.y;
          float safe_px = abs(p_img.x) < 0.001 ? 0.001 : p_img.x;
          float term = (0.1 - max(0.01 - dot(p_img, p_img) / 200.0, 0.0) * (diff_y / safe_px))
                       / abs(length(p_img) - 0.7);
          o_bg += vec4(term);
          o_bg *= max(o_bg, vec4(0.0));
        }

        // ---------------------------
        // Foreground (Animation) Layer
        // ---------------------------
        {
          vec2 p_anim = (gl_FragCoord.xy * 2.0 - r) / r.y / 0.7;
          vec2 d = vec2(-1.0, 1.0);
          float denom = 0.1 + 5.0 / dot(5.0 * p_anim - d, 5.0 * p_anim - d);
          vec2 c = p_anim * mat2(1.0, 1.0, d.x / denom, d.y / denom);
          vec2 v = c;
          // Apply a time-varying transformation:
          v *= mat2(cos(log(length(v)) + t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0))) * 5.0;
          vec4 animAccum = vec4(0.0);
          for (int i = 1; i <= 9; i++) {
            float fi = float(i);
            animAccum += sin(vec4(v.x, v.y, v.y, v.x)) + vec4(1.0);
            v += 0.7 * sin(vec2(v.y, v.x) * fi + t) / fi + 0.5;
          }
          vec4 animTerm = 1.0 - exp(-exp(c.x * vec4(0.6, -0.4, -1.0, 0.0))
                            / animAccum
                            / (0.1 + 0.1 * pow(length(sin(v / 0.3) * 0.2 + c * vec2(1.0, 2.0)) - 1.0, 2.0))
                            / (1.0 + 7.0 * exp(0.3 * c.y - dot(c, c)))
                            / (0.03 + abs(length(p_anim) - 0.7)) * 0.2);
          o_anim += animTerm;
        }

        // Blend Layers
        vec4 finalColor = mix(o_bg, o_anim, 0.5) * 1.5;
        finalColor = clamp(finalColor, 0.0, 1.0);
        
        // Apply hover effect:
        // If u_hover is 0, we might want it invisible or very subtle.
        // The user said "appears on hover".
        // Let's fade alpha based on u_hover, but keep a faint ghost if desired?
        // Or strictly appear on hover.
        // Let's make it fully transparent when not hovered, and fade in.
        
        gl_FragColor = finalColor * u_hover; 
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile failed: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vertexShader || !fragmentShader) return null;
      
      const program = gl.createProgram();
      if (!program) return null;
      
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link failed: ' + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    }

    program = createProgram(gl, vsSource, fsSource);
    if (!program) return;
    
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const timeLocation = gl.getUniformLocation(program, 't');
    const resolutionLocation = gl.getUniformLocation(program, 'r');
    const hoverLocation = gl.getUniformLocation(program, 'u_hover');

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let currentHover = 0;
    let targetHover = 0;

    function render() {
      if (!gl || !program) return;
      
      const width = size * (window.devicePixelRatio || 1);
      const height = size * (window.devicePixelRatio || 1);
      
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);

      let currentTime = performance.now();
      let delta = (currentTime - startTime) / 1000;

      // Smooth hover transition
      currentHover += (targetHover - currentHover) * 0.1;

      if (timeLocation) gl.uniform1f(timeLocation, delta);
      if (resolutionLocation) gl.uniform2f(resolutionLocation, width, height);
      if (hoverLocation) gl.uniform1f(hoverLocation, currentHover);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Hover handlers
    const handleMouseEnter = () => { targetHover = 1; };
    const handleMouseLeave = () => { targetHover = 0; };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (program) gl.deleteProgram(program);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [size]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
