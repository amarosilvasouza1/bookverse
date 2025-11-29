'use client';

import { useEffect, useRef } from 'react';

interface WaterDistortionFrameProps {
  src: string | null;
  size: number;
}

export default function WaterDistortionFrame({ src, size }: WaterDistortionFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return;

    let animationFrameId: number;
    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;

    // Vertex Shader
    const vsSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main() {
          vUv = .5 * (a_position + 1.);
          gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader
    const fsSource = `
      precision mediump float;

      varying vec2 vUv;
      uniform sampler2D u_image_texture;
      uniform float u_time;
      uniform float u_ratio;
      uniform float u_img_ratio;
      uniform float u_blueish;
      uniform float u_scale;
      uniform float u_illumination;
      uniform float u_surface_distortion;
      uniform float u_water_distortion;

      #define TWO_PI 6.28318530718
      #define PI 3.14159265358979323846

      vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
      vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
      vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
      float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
          vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
          m = m*m;
          m = m*m;
          vec3 x = 2. * fract(p * C.www) - 1.;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130. * dot(m, g);
      }

      mat2 rotate2D(float r) {
          return mat2(cos(r), sin(r), -sin(r), cos(r));
      }

      float surface_noise(vec2 uv, float t, float scale) {
          vec2 n = vec2(.1);
          vec2 N = vec2(.1);
          mat2 m = rotate2D(.5);
          for (int j = 0; j < 10; j++) {
              uv *= m;
              n *= m;
              vec2 q = uv * scale + float(j) + n + (.5 + .5 * float(j)) * (mod(float(j), 2.) - 1.) * t;
              n += sin(q);
              N += cos(q) / scale;
              scale *= 1.2;
          }
          return (N.x + N.y + .1);
      }

      void main() {
          vec2 uv = vUv;
          uv.y = 1. - uv.y;
          uv.x *= u_ratio;

          float t = .002 * u_time;
          vec3 color = vec3(0.);
          float opacity = 0.;

          float outer_noise = snoise((.3 + .1 * sin(t)) * uv + vec2(0., .2 * t));
          vec2 surface_noise_uv = 2. * uv + (outer_noise * .2);

          float surface_noise_val = surface_noise(surface_noise_uv, t, u_scale);
          surface_noise_val *= pow(uv.y, .3);
          surface_noise_val = pow(surface_noise_val, 2.);

          vec2 img_uv = vUv;
          img_uv -= .5;
          if (u_ratio > u_img_ratio) {
              img_uv.x = img_uv.x * u_ratio / u_img_ratio;
          } else {
              img_uv.y = img_uv.y * u_img_ratio / u_ratio;
          }
          float scale_factor = 1.0; // Adjusted to fit avatar
          img_uv *= scale_factor;
          img_uv += .5;
          img_uv.y = 1. - img_uv.y;

          img_uv += (u_water_distortion * outer_noise);
          img_uv += (u_surface_distortion * surface_noise_val);

          // Clamp UVs to avoid repeating edge pixels or wrapping
          // if (img_uv.x < 0.0 || img_uv.x > 1.0 || img_uv.y < 0.0 || img_uv.y > 1.0) {
          //    discard; 
          // }

          vec4 img = texture2D(u_image_texture, img_uv);
          img *= (1. + u_illumination * surface_noise_val);

          color += img.rgb;
          color += u_illumination * vec3(1. - u_blueish, 1., 1.) * surface_noise_val;
          opacity += img.a;

          // Soft edges circular mask
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          float alpha = 1.0 - smoothstep(0.48, 0.5, dist);
          
          gl_FragColor = vec4(color, opacity * alpha);
      }
    `;

    function createShader(gl: WebGLRenderingContext, source: string, type: number) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        uniforms[info.name] = gl.getUniformLocation(program, info.name);
      }
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(program);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Load Image
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    
    image.onload = () => {
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      if (uniforms.u_image_texture) gl.uniform1i(uniforms.u_image_texture, 0);
      
      render();
    };

    // Params
    const baseParams = {
      blueish: 0.6,
      scale: 5.0,
      illumination: 0.15,
      surfaceDistortion: 0.0, // Reduced base distortion for calmness
      waterDistortion: 0.01,
    };

    const hoverParams = {
      surfaceDistortion: 0.3, // High distortion on hover
      waterDistortion: 0.15,
    };

    let currentIntensity = 0;
    let targetIntensity = 0;

    function render() {
      if (!gl || !program || !uniforms || !canvas) return;
      
      const width = size * (window.devicePixelRatio || 1);
      const height = size * (window.devicePixelRatio || 1);
      
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);

      const imgRatio = image.naturalWidth / image.naturalHeight;
      
      // Smoothly interpolate intensity
      currentIntensity += (targetIntensity - currentIntensity) * 0.05;

      const currentSurfaceDistortion = baseParams.surfaceDistortion + (hoverParams.surfaceDistortion - baseParams.surfaceDistortion) * currentIntensity;
      const currentWaterDistortion = baseParams.waterDistortion + (hoverParams.waterDistortion - baseParams.waterDistortion) * currentIntensity;

      if (uniforms.u_blueish) gl.uniform1f(uniforms.u_blueish, baseParams.blueish);
      if (uniforms.u_scale) gl.uniform1f(uniforms.u_scale, baseParams.scale);
      if (uniforms.u_illumination) gl.uniform1f(uniforms.u_illumination, baseParams.illumination);
      
      // Use dynamic values
      if (uniforms.u_surface_distortion) gl.uniform1f(uniforms.u_surface_distortion, currentSurfaceDistortion);
      if (uniforms.u_water_distortion) gl.uniform1f(uniforms.u_water_distortion, currentWaterDistortion);
      
      if (uniforms.u_time) gl.uniform1f(uniforms.u_time, performance.now());
      if (uniforms.u_ratio) gl.uniform1f(uniforms.u_ratio, width / height);
      if (uniforms.u_img_ratio) gl.uniform1f(uniforms.u_img_ratio, imgRatio);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    // Event Handlers attached to canvas/container via closure since we are inside useEffect
    const handleMouseEnter = () => { targetIntensity = 1; };
    const handleMouseLeave = () => { targetIntensity = 0; };

    const container = containerRef.current;
    if (container) {
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (program) gl.deleteProgram(program);
      if (texture) gl.deleteTexture(texture);
      if (container) {
          container.removeEventListener('mouseenter', handleMouseEnter);
          container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [src, size]);

  return (
    <div 
      ref={containerRef} 
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
