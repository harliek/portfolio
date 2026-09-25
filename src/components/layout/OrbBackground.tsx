import { useEffect, useRef } from 'react'

/** A fullscreen triangle: one draw covers the canvas. */
const VERTEX = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

// The exact fragment shader supplied by Harlie ("Orb", made with the 21st.dev Shader Builder).
const FRAGMENT = `// "Orb" — made with the 21st.dev Shader Builder
// Packed WebGL1 uniforms (the shader exposes readable u_* aliases as macros):
//   u_colors[8] (first 2 used)
//   vec3(0.408, 0.314, 0.071)
//   vec3(0.282, 0.090, 0.090)
//   u_scene = vec4(canvas width, canvas height, seconds * 0.00, 2.0)
//   u_shape = vec4(0.50, 0.73, 0.39, 0.25)
//   u_surface = vec4(3.55, 1.38, -0.07, 0.84)
//   u_finish = vec4(4.17, 1.00, 0.022, 0.00)
//   u_transform = vec4(3505.0, 2.60, 0.10, 1.0)
//   u_space = vec4(-0.01, -0.02, pointer x, pointer y)
//   u_cursor = vec4(presence, 4.0, 0.86, 0.57)

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
// Seven packed vectors + eight colour vectors = 15 fragment uniform vectors,
// one below WebGL1's guaranteed minimum. Macros preserve the public u_* API.
uniform vec4 u_scene;      // resolution.xy, time, colour count
uniform vec4 u_shape;      // scale, intensity, paramA, warp
uniform vec4 u_surface;    // detail, contrast, brightness, saturation
uniform vec4 u_finish;     // hue, vignette, blur, grain
uniform vec4 u_transform;  // seed, rotation, drift, OKLab toggle
uniform vec4 u_space;      // offset.xy, pointer.xy
uniform vec4 u_cursor;

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_paramA u_shape.z
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_blur u_finish.z
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
// Keep hash inputs inside mediump's guaranteed ±2^14 range.
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy
#define u_mouse u_space.zw
#define u_cursorPresence u_cursor.x
#define u_cursorEffect u_cursor.y
#define u_cursorStrength u_cursor.z
#define u_cursorRadius u_cursor.w

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Even, un-structured white noise for film grain (Dave Hoskins hash12). The
// multiply hash above is fine for value noise but shows a faint axis-aligned
// mesh at integer fragment coords, which reads as a net over flat areas.
float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(15731.743, 7892.321) * n);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

// --- OKLab colour mixing (perceptual), gated by u_oklab -----------------------
vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)),
    step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
  // max() guards the sRGB branch: out-of-gamut OKLab interpolations can send a
  // channel negative, and pow(negative, …) is NaN which mix()/step() would
  // then propagate. The linear branch clips such channels to 0 downstream.
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, c));
}
vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 mixColour(vec3 a, vec3 b, float t) {
  if (u_oklab > 0.5) {
    vec3 la = linToOklab(srgbToLinear(a));
    vec3 lb = linToOklab(srgbToLinear(b));
    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
  }
  return mix(a, b, t);
}

// Mix through the recipe colours; x is clamped to 0..1. WebGL1 forbids
// dynamic uniform indexing in fragment shaders, hence the constant loop.
vec3 palette(float x) {
  float n = max(u_colorCount - 1.0, 1.0);
  float f = clamp(x, 0.0, 1.0) * n;
  vec3 col = u_colors[0];
  for (int i = 0; i < 7; i++) {
    if (float(i) < n)
      col = mixColour(col, u_colors[i + 1],
        smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
  }
  return col;
}

vec3 hueRotate(vec3 col, float a) {
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211,
                          0.587, -0.274, -0.523,
                          0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0,
                          0.956, -0.272, -1.106,
                          0.621, -0.647, 1.703);
  vec3 yiq = toYIQ * col;
  float ca = cos(a), sa = sin(a);
  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);
  return toRGB * yiq;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  float wob = fbm(p * 2.0 + t * 0.25 + u_seed) - 0.5;
  float d = length(p) + wob * u_intensity * 0.5;
  float core = 1.0 - smoothstep(0.0, 0.75, d);
  float halo = exp(-d * 2.5) * 0.5;
  return palette(clamp(core + halo, 0.0, 1.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);
  float cursorMask = 0.0;

  // Cursor modes 1–3 are local distortions. Push shifts the same screen-space
  // coordinates before field transforms, so Zoom/Rotate don't change its feel.
  if (u_cursorPresence > 0.001) {
    // u_mouse is normalized to -1..1 in canvas space. Convert it to the same
    // aspect-corrected screen space as p so effects stay under the cursor.
    vec2 cursor = (0.5 * u_mouse * u_resolution.xy)
      / min(u_resolution.x, u_resolution.y);
    vec2 cursorDelta = p - cursor;
    if (u_cursorEffect < 0.5) {
      p += cursor * u_cursorPresence * u_cursorStrength * 0.55;
    } else {
      float cursorDistance = length(cursorDelta);
      vec2 cursorDirection = cursorDelta / max(cursorDistance, 0.0001);
      cursorMask = u_cursorPresence
        * (1.0 - smoothstep(0.0, u_cursorRadius, cursorDistance));
      if (u_cursorEffect < 1.5) {
        p -= cursorDirection * cursorMask * u_cursorStrength * 0.24;
      } else if (u_cursorEffect < 2.5) {
        float cursorAngle = cursorMask * u_cursorStrength * 2.2;
        float cc = cos(cursorAngle), cs = sin(cursorAngle);
        p = cursor + mat2(cc, -cs, cs, cc) * cursorDelta;
      } else if (u_cursorEffect < 3.5) {
        float ripple = sin(
          cursorDistance / max(u_cursorRadius, 0.001) * 18.0 - u_time * 5.0);
        p -= cursorDirection * ripple * cursorMask * u_cursorStrength * 0.07;
      }
    }
  }

  // Keep presets that read uv (rather than p) in the same warped space.
  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= u_scale;
  // Field transform: rotate, pan, pointer push, slow drift.
  if (abs(u_rotate) > 0.0001) {
    float cr = cos(u_rotate), sr = sin(u_rotate);
    p = mat2(cr, -sr, sr, cr) * p;
  }
  p += u_offset;
  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));
  // Organic domain warp.
  if (u_warp > 0.0) {
    p += u_warp * (vec2(
      fbm(p * u_detail + u_seed),
      fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }
  // Shade, with an optional soft 5-tap blur.
  vec3 col;
  if (u_blur > 0.0) {
    float e = u_blur;
    float pe = e * u_scale;
    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;
    col  = shade(uv, p, u_time) * 0.36;
    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv + vec2(0.0, uvE.y), p + vec2(0.0, pe), u_time) * 0.16;
    col += shade(uv - vec2(0.0, uvE.y), p - vec2(0.0, pe), u_time) * 0.16;
  } else {
    col = shade(uv, p, u_time);
  }
  // Post: contrast, saturation, hue, brightness, vignette, grain.
  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;
  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }
  if (abs(u_hue) > 0.0001)
    col = hueRotate(col, u_hue);
  if (abs(u_brightness) > 0.0001)
    col += u_brightness;
  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }
  if (u_cursorPresence > 0.001 && u_cursorEffect > 3.5)
    col += (vec3(0.18) + col * 0.12) * cursorMask * u_cursorStrength;
  if (u_grain > 0.0001)
    col += (grainHash(
      gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

/**
 * The colours, low to high, blended in OKLab by the shader; the other six
 * slots unused. Harlie's recipe (#685012, #481717 turned 4.17 radians of hue)
 * read as green, so the hue turn is off and these two are chosen so that,
 * after the recipe's contrast, saturation and brightness, the orb reads a
 * slight blue violet: about #4a3f8f at its lightest and #130f2e at its darkest.
 */
const COLOURS = new Float32Array([0.398, 0.361, 0.631, 0.242, 0.228, 0.333, ...new Array(18).fill(0)])
const SHAPE = [0.5, 0.73, 0.39, 0.25] as const
const SURFACE = [3.55, 1.38, -0.07, 0.84] as const
/** Hue turn 0 (the recipe's 4.17 made the orb green), vignette 1.0, blur 0.022, no grain. */
const FINISH = [0, 1.0, 0.022, 0.0] as const
const TRANSFORM = [3505.0, 2.6, 0.1, 1.0] as const
const OFFSET = [-0.01, -0.02] as const
/** Cursor: spotlight (4.0), strength 0.86, radius 0.57. */
const CURSOR = { effect: 4.0, strength: 0.86, radius: 0.57 }

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * The site's background (Harlie's "Orb" shader): a static WebGL1 picture
 * (its time is fixed at zero) drawn with one fullscreen triangle, no
 * libraries, behind every page's content. The only movement is the cursor's
 * spotlight, which follows a mouse or trackpad and fades in and out; the
 * frame loop redraws only while that changes, stops when the tab is hidden,
 * and does not run where a page covers the background (`active` false, the
 * homepage and its film). The canvas is at most 2x the CSS size. Without
 * WebGL the quiet ground below it shows instead. Decorative: aria-hidden.
 */
export function OrbBackground({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'low-power' })
    if (!gl) return
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    if (!vs || !fs) return
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const at = (name: string) => gl.getUniformLocation(program, name)
    const u = {
      colors: at('u_colors'),
      scene: at('u_scene'),
      shape: at('u_shape'),
      surface: at('u_surface'),
      finish: at('u_finish'),
      transform: at('u_transform'),
      space: at('u_space'),
      cursor: at('u_cursor'),
    }
    gl.uniform3fv(u.colors, COLOURS)
    gl.uniform4f(u.shape, ...SHAPE)
    gl.uniform4f(u.surface, ...SURFACE)
    gl.uniform4f(u.finish, ...FINISH)
    gl.uniform4f(u.transform, ...TRANSFORM)

    const state = { x: 0, y: 0, presence: 0, target: 0, dirty: true }
    let frame = 0
    let last = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
      state.dirty = true
      wake()
    }

    const draw = () => {
      // u_scene: canvas width and height, seconds * 0.00 (a still picture), two colours.
      gl.uniform4f(u.scene, canvas.width, canvas.height, 0, 2)
      gl.uniform4f(u.space, OFFSET[0], OFFSET[1], state.x, state.y)
      gl.uniform4f(u.cursor, state.presence, CURSOR.effect, CURSOR.strength, CURSOR.radius)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const tick = (now: number) => {
      frame = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const gap = state.target - state.presence
      if (Math.abs(gap) > 0.001) {
        state.presence += gap * (1 - Math.exp(-dt / 0.12))
        state.dirty = true
      } else if (state.presence !== state.target) {
        state.presence = state.target
        state.dirty = true
      }
      if (state.dirty) {
        state.dirty = false
        draw()
      }
      if (Math.abs(state.target - state.presence) > 0.001) wake()
    }

    function wake() {
      if (!frame && !document.hidden) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    // The pointer in canvas space, -1 to 1, y up (as gl_FragCoord runs).
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const box = canvas.getBoundingClientRect()
      state.x = ((e.clientX - box.left) / box.width) * 2 - 1
      state.y = 1 - ((e.clientY - box.top) / box.height) * 2
      state.target = 1
      state.dirty = true
      wake()
    }
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget) return
      state.target = 0
      wake()
    }
    const onBlur = () => {
      state.target = 0
      wake()
    }
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
      } else {
        state.dirty = true
        wake()
      }
    }
    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(frame)
      frame = 0
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseout', onLeave)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.dataset.ready = ''

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseout', onLeave)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onLost)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      delete canvas.dataset.ready
    }
  }, [active])

  return (
    <div className="orb-bg" aria-hidden="true" data-active={active || undefined}>
      <canvas ref={canvasRef} className="orb-bg__canvas" />
    </div>
  )
}
