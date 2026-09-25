/**
 * The film's optical refraction (brief v16, section 2): the background film
 * is drawn into a WebGL canvas, and a soft region around a trailing pointer
 * bends it slightly, like light through moving glass or water. No rings, no
 * lens edge, no glow: a Gaussian falloff (about 160px) carries a gentle
 * magnification plus a slow flow, at most about 12px of displacement,
 * and it settles smoothly when the pointer rests or leaves.
 * The same pass applies the pointer parallax (about 10px of shift and a 1%
 * change of scale), so the film never shows an edge.
 *
 * Only the film is drawn here; the title, navigation and every piece of
 * text sit above the canvas in the DOM and are never distorted.
 *
 * WebGL 1 (Safari included). Everything per frame lives in plain variables;
 * nothing touches React state. Returns null where WebGL is unavailable (the
 * caller keeps the plain <video>).
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform vec2 u_texScale;
uniform vec2 u_texOffset;
uniform vec2 u_ptr;
uniform float u_strength;
uniform float u_time;
uniform float u_radius;
uniform float u_disp;
uniform vec2 u_shift;
uniform float u_zoom;
varying vec2 v_uv;

void main() {
  vec2 px = v_uv * u_res;
  vec2 d = px - u_ptr;
  float r = length(d);
  // Gaussian falloff: invisible at the edge, so no ring or lens outline.
  float f = exp(-(r * r) / (u_radius * u_radius * 0.5));
  vec2 dir = d / max(r, 1.0);
  // A soft magnification toward the pointer (peaks halfway out, zero at the centre and edge).
  float lens = f * (r / u_radius);
  // A slow flow inside the region (a wavelength of about 150px): moving water, not ripples.
  vec2 flow = vec2(
    sin(px.y * 0.042 + u_time * 0.9) + sin((px.x + px.y) * 0.029 - u_time * 0.7),
    cos(px.x * 0.038 - u_time * 0.8) + cos((px.x - px.y) * 0.026 + u_time * 0.6)
  ) * 0.3;
  vec2 offset = (-dir * lens * 2.2 + flow * f) * u_disp * u_strength;
  vec2 p = (px + offset - u_res * 0.5 - u_shift) / u_zoom + u_res * 0.5;
  vec2 uv = (p / u_res) * u_texScale + u_texOffset;
  gl_FragColor = texture2D(u_tex, clamp(uv, vec2(0.0), vec2(1.0)));
}
`

export interface LiquidFilmOptions {
  /** Radius of the affected region (CSS px). */
  radius: number
  /** Largest displacement at full strength (CSS px, before the falloff's own peak of about 0.77). */
  displacement: number
  /** Largest parallax shift (CSS px) at the window's edges. */
  parallax: number
  /** Extra scale while the pointer is in the window (0.01 = 1%). */
  zoom: number
  /** Horizontal and vertical focus of the cover fit (0 to 1), like object-position. */
  position: [number, number]
}

export interface LiquidFilm {
  /** Pointer position in CSS px relative to the canvas; null when the pointer left. */
  pointer(x: number | null, y?: number): void
  /** Whether the refraction responds to the pointer (false while the hero is scrolled away). */
  active(on: boolean): void
  setPosition(position: [number, number]): void
  destroy(): void
}

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

/** Frame-rate independent approach of `current` to `target` with time constant `tau` (s). */
const approach = (current: number, target: number, dt: number, tau: number) => current + (target - current) * (1 - Math.exp(-dt / tau))

export function createLiquidFilm(canvas: HTMLCanvasElement, video: HTMLVideoElement, options: LiquidFilmOptions): LiquidFilm | null {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'low-power' })
  if (!gl) return null
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

  const u = (name: string) => gl.getUniformLocation(program, name)
  const uRes = u('u_res')
  const uTexScale = u('u_texScale')
  const uTexOffset = u('u_texOffset')
  const uPtr = u('u_ptr')
  const uStrength = u('u_strength')
  const uTime = u('u_time')
  const uRadius = u('u_radius')
  const uDisp = u('u_disp')
  const uShift = u('u_shift')
  const uZoom = u('u_zoom')
  gl.uniform1i(u('u_tex'), 0)
  gl.uniform1f(uRadius, options.radius)
  gl.uniform1f(uDisp, options.displacement)

  let position = options.position
  let width = 0
  let height = 0
  let hasFrame = false
  let newFrame = false
  let lastTime = performance.now()
  let clock = 0
  // The pointer as given, the trailing pointer the shader uses, and the smoothed parallax.
  let target: { x: number; y: number } | null = null
  let lastTarget: { x: number; y: number } | null = null
  const trail = { x: 0, y: 0 }
  let strength = 0
  let speed = 0
  let enabled = true
  const shift = { x: 0, y: 0 }
  let zoom = 1
  let frame = 0
  let videoFrameHandle = 0

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    // Film footage is soft: 1.25 device pixels per CSS pixel is indistinguishable and far cheaper.
    const ratio = Math.min(window.devicePixelRatio || 1, 1.25)
    width = rect.width
    height = rect.height
    const w = Math.max(1, Math.round(rect.width * ratio))
    const h = Math.max(1, Math.round(rect.height * ratio))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, w, h)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  const coverFit = () => {
    const vw = video.videoWidth
    const vh = video.videoHeight
    if (!vw || !vh || !width || !height) return
    const canvasAspect = width / height
    const videoAspect = vw / vh
    if (canvasAspect > videoAspect) {
      const s = videoAspect / canvasAspect
      gl.uniform2f(uTexScale, 1, s)
      gl.uniform2f(uTexOffset, 0, (1 - s) * position[1])
    } else {
      const s = canvasAspect / videoAspect
      gl.uniform2f(uTexScale, s, 1)
      gl.uniform2f(uTexOffset, (1 - s) * position[0], 0)
    }
  }

  // Upload only real new frames where the browser can say so (Chrome, Safari 15.4+).
  const onVideoFrame = () => {
    newFrame = true
    videoFrameHandle = video.requestVideoFrameCallback(onVideoFrame)
  }
  const hasVideoFrameCallback = 'requestVideoFrameCallback' in HTMLVideoElement.prototype
  if (hasVideoFrameCallback) videoFrameHandle = video.requestVideoFrameCallback(onVideoFrame)

  const render = (now: number) => {
    frame = requestAnimationFrame(render)
    const dt = Math.min(0.05, (now - lastTime) / 1000)
    lastTime = now
    clock += dt

    // Pointer: the region trails the pointer slightly; its strength follows the pointer's speed and settles.
    if (target && enabled) {
      if (lastTarget && dt > 0) {
        const moved = Math.hypot(target.x - lastTarget.x, target.y - lastTarget.y) / dt
        speed = approach(speed, moved, dt, 0.12)
      }
      lastTarget = { ...target }
      trail.x = approach(trail.x, target.x, dt, 0.16)
      trail.y = approach(trail.y, target.y, dt, 0.16)
      const wanted = 0.32 + 0.68 * Math.min(1, speed / 900)
      strength = approach(strength, wanted, dt, wanted > strength ? 0.18 : 0.9)
    } else {
      lastTarget = null
      speed = approach(speed, 0, dt, 0.2)
      strength = approach(strength, 0, dt, 0.7)
    }
    // Parallax: about 10px toward the pointer's opposite side, and 1% of scale while it is in the window.
    const px = target && width ? (target.x / width - 0.5) * 2 : 0
    const py = target && height ? (target.y / height - 0.5) * 2 : 0
    shift.x = approach(shift.x, -px * options.parallax, dt, 0.9)
    shift.y = approach(shift.y, -py * options.parallax * 0.7, dt, 0.9)
    // Base scale covers the largest shift so no edge ever shows.
    const base = 1 + (2 * options.parallax) / Math.max(1, Math.min(width, height)) + 0.004
    zoom = approach(zoom, base + (target ? options.zoom : 0), dt, 1.1)

    if (video.readyState >= 2 && (newFrame || !hasVideoFrameCallback || !hasFrame)) {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video)
      if (!hasFrame) canvas.dataset.ready = ''
      hasFrame = true
      newFrame = false
    }
    if (!hasFrame) return
    coverFit()
    gl.uniform2f(uRes, width, height)
    gl.uniform2f(uPtr, trail.x, trail.y)
    gl.uniform1f(uStrength, strength)
    gl.uniform1f(uTime, clock)
    gl.uniform2f(uShift, shift.x, shift.y)
    gl.uniform1f(uZoom, zoom)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
  frame = requestAnimationFrame(render)

  return {
    pointer(x, y) {
      if (x === null || y === undefined) {
        target = null
        return
      }
      if (!target) {
        // Arriving: the region starts at the pointer (no sweep across the film).
        trail.x = x
        trail.y = y
      }
      target = { x, y }
    },
    active(on) {
      enabled = on
    },
    setPosition(next) {
      position = next
    },
    destroy() {
      cancelAnimationFrame(frame)
      if (hasVideoFrameCallback && videoFrameHandle) video.cancelVideoFrameCallback(videoFrameHandle)
      observer.disconnect()
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      // The context is not lost on purpose: a remount reuses this canvas's context (React StrictMode mounts twice).
    },
  }
}
