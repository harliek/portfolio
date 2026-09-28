// Nebula Drift — Originkit (npx originkit@latest add nebula-drift --custom-style), with Harlie's preset.
//
// Changes from the supplied code, all for the site (the ground of the case studies and About, PageShell):
// - it follows the pointer over the whole window (the page's content lies over it, so it never receives pointer
//   events itself);
// - its first stir is spread over a few frames instead of one long one, so a page arriving is never held up;
// - it reads its latest settings after each render rather than during it;
// - it keeps its WebGL context when its effect is torn down (see the cleanup), so setting it up again works;
// - it can rest dark (`dark`): still particles are not drawn and the flow settles within about a second, so with
//   `stir` off it shows only where and while the pointer moves, and sleeps once it is black again;
// - asleep (black and left alone), off screen or in a hidden tab, it requests no frames at all, and the pointer, the
//   window or the tab wakes it (Harlie's QA pass, 2026-09-28: it ran an empty frame loop 60 times a second, on the
//   homepage too, where it is hidden); it no longer resizes itself every frame (the ResizeObserver does);
// - its shaders compile without holding up a frame: every program is compiled and linked first and read back only
//   once the driver has finished (KHR_parallel_shader_compile, polled a frame at a time where the browser has it),
//   then the field is built in the next frame (Harlie's QA pass, 2026-09-28: its setup was a 70 to 260ms pause
//   about a second after a case study opened);
// - no "use client" (a Vite app).

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

const DEFAULT_COLORS = {
  slow: '#22001D',
  fast: '#017AFF',
  glint: '#A1ECFF',
}

const DEFAULT_PARTICLES = {
  count: 7,
  size: 1,
  inertia: 0,
}

const DEFAULT_DYE = {
  show: true,
  fade: 5,
}

const DEFAULTS = {
  colors: { fast: '#001022', slow: '#0C0018', glint: '#3DBEDE' },
  background: '#000000',
  particles: { size: 1, count: 5.9, inertia: 2 },
  dye: { show: true, fade: 1.6 },
  strength: 5.6,
  stir: true,
  dark: false,
  iterations: 6,
  detail: 5,
}

const CELL_SIZE = 32

const DYE_DECAY: [number, number, number] = [0.9797, 0.9494, 0.9696]

const VELOCITY_DECAY = 0.999
/** The flow's decay a frame when it rests dark: it settles within about a second of the pointer stopping. */
const SETTLE_DECAY = 0.96

/** Resting dark, a particle shows from this share of full speed and at full strength from the second. */
const REST_FROM = 0.06
const REST_TO = 0.4

const GLINT_SCALE = 0.1

const DYE_HIGH_SCALE = 3.34
const DYE_LOW_SCALE = 0.6

const PARTICLE_EXP_MIN = 7
const PARTICLE_EXP_MAX = 10

const FLUID_DIVISOR_MAX = 6
const FLUID_DIVISOR_MIN = 2
const GRID_MAX = 1024
const DPR_CAP = 2

const STIR_STROKE = 0.55
const STIR_PAUSE_MIN = 0.9
const STIR_PAUSE_MAX = 2.2

const HOVER_HOLD = 400

/** Resting dark with no stir of its own, it sleeps this long after the pointer's last move (ms): black by then. */
const SLEEP_AFTER = 8000

const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

const STEP = 1 / 60
const WARMUP = 240
const STILL_WARMUP = 260
/** The first stir's steps per frame (it was all of them in the first frame, a long pause as the page arrives). */
const WARMUP_PER_FRAME = 10

export interface NebulaDriftColors {
  slow?: string

  fast?: string

  glint?: string
}

export interface NebulaDriftParticles {
  count?: number

  size?: number

  inertia?: number
}

export interface NebulaDriftDye {
  show?: boolean

  fade?: number
}

export interface NebulaDriftProps {
  colors?: NebulaDriftColors
  background?: string
  particles?: NebulaDriftParticles
  dye?: NebulaDriftDye

  strength?: number

  stir?: boolean

  /** Rests dark: still particles are not drawn and the flow settles within about a second (no fallback glow). */
  dark?: boolean

  iterations?: number

  detail?: number
  style?: CSSProperties
}

const FLUID_VERT = `
attribute vec2 vertexPosition;

uniform float aspectRatio;

varying vec2 texelCoord;

varying vec2 p;

void main() {
    texelCoord = vertexPosition;
    vec2 clipSpace = 2.0 * texelCoord - 1.0;
    p = vec2(clipSpace.x * aspectRatio, clipSpace.y);
    gl_Position = vec4(clipSpace, 0.0, 1.0);
}
`

const PLANE_VERT = `
attribute vec2 vertexPosition;
varying vec2 texelCoord;

void main() {
    texelCoord = vertexPosition;
    gl_Position = vec4(vertexPosition * 2.0 - vec2(1.0, 1.0), 0.0, 1.0);
}
`

const FLUID_BASE = `
#define PRESSURE_BOUNDARY
#define VELOCITY_BOUNDARY

uniform vec2 invresolution;
uniform float aspectRatio;

varying vec2 texelCoord;
varying vec2 p;

vec2 clipToSimSpace(vec2 clipSpace){
    return vec2(clipSpace.x * aspectRatio, clipSpace.y);
}

vec2 simToTexelSpace(vec2 simSpace){
    return vec2(simSpace.x / aspectRatio + 1.0, simSpace.y + 1.0) * .5;
}

// sampling pressure texture factoring in boundary conditions
float samplePressue(sampler2D pressure, vec2 coord){
    vec2 cellOffset = vec2(0.0, 0.0);

    // pure Neumann boundary conditions: 0 pressure gradient across the
    // boundary, dP/dx = 0
    #ifdef PRESSURE_BOUNDARY
    if(coord.x < 0.0)      cellOffset.x = 1.0;
    else if(coord.x > 1.0) cellOffset.x = -1.0;
    if(coord.y < 0.0)      cellOffset.y = 1.0;
    else if(coord.y > 1.0) cellOffset.y = -1.0;
    #endif

    return texture2D(pressure, coord + cellOffset * invresolution).x;
}

// sampling velocity texture factoring in boundary conditions
vec2 sampleVelocity(sampler2D velocity, vec2 coord){
    vec2 cellOffset = vec2(0.0, 0.0);
    vec2 multiplier = vec2(1.0, 1.0);

    // free-slip boundary: the average flow across the boundary is
    // restricted to 0
    #ifdef VELOCITY_BOUNDARY
    if(coord.x < 0.0){
        cellOffset.x = 1.0;
        multiplier.x = -1.0;
    }else if(coord.x > 1.0){
        cellOffset.x = -1.0;
        multiplier.x = -1.0;
    }
    if(coord.y < 0.0){
        cellOffset.y = 1.0;
        multiplier.y = -1.0;
    }else if(coord.y > 1.0){
        cellOffset.y = -1.0;
        multiplier.y = -1.0;
    }
    #endif

    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;
}
`

const GEOM = `
float distanceToSegment(vec2 a, vec2 b, vec2 p, out float fp){
    vec2 d = p - a;
    vec2 x = b - a;

    fp = 0.0; // fractional projection, 0 - 1 in the length of vec2(b - a)
    float lx = length(x);

    if(lx <= 0.0001) return length(d);

    float projection = dot(d, x / lx);

    fp = projection / lx;

    if(projection < 0.0)            return length(d);
    else if(projection > length(x)) return length(p - b);
    return sqrt(abs(dot(d, d) - projection * projection));
}
`

const ADVECT =
  FLUID_BASE +
  `
uniform sampler2D velocity;
uniform sampler2D target;
uniform float dt;
uniform float rdx;

void main(void){
    vec2 tracedPos = p - dt * rdx * texture2D(velocity, texelCoord).xy;

    tracedPos = simToTexelSpace(tracedPos) / invresolution;

    vec4 st;
    st.xy = floor(tracedPos - .5) + .5;
    st.zw = st.xy + 1.;

    vec2 t = tracedPos - st.xy;

    st *= invresolution.xyxy;

    vec4 tex11 = texture2D(target, st.xy);
    vec4 tex21 = texture2D(target, st.zy);
    vec4 tex12 = texture2D(target, st.xw);
    vec4 tex22 = texture2D(target, st.zw);

    gl_FragColor = mix(mix(tex11, tex21, t.x), mix(tex12, tex22, t.x), t.y);
}
`

const DIVERGENCE =
  FLUID_BASE +
  `
uniform sampler2D velocity;
uniform float halfrdx;

void main(void){
    vec2 L = sampleVelocity(velocity, texelCoord - vec2(invresolution.x, 0));
    vec2 R = sampleVelocity(velocity, texelCoord + vec2(invresolution.x, 0));
    vec2 B = sampleVelocity(velocity, texelCoord - vec2(0, invresolution.y));
    vec2 T = sampleVelocity(velocity, texelCoord + vec2(0, invresolution.y));

    gl_FragColor = vec4(halfrdx * ((R.x - L.x) + (T.y - B.y)), 0, 0, 1);
}
`

const PRESSURE_SOLVE =
  FLUID_BASE +
  `
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform float alpha;

void main(void){
    float L = samplePressue(pressure, texelCoord - vec2(invresolution.x, 0));
    float R = samplePressue(pressure, texelCoord + vec2(invresolution.x, 0));
    float B = samplePressue(pressure, texelCoord - vec2(0, invresolution.y));
    float T = samplePressue(pressure, texelCoord + vec2(0, invresolution.y));

    float bC = texture2D(divergence, texelCoord).x;

    gl_FragColor = vec4((L + R + B + T + alpha * bC) * .25, 0, 0, 1);
}
`

const PRESSURE_GRADIENT =
  FLUID_BASE +
  `
uniform sampler2D pressure;
uniform sampler2D velocity;
uniform float halfrdx;

void main(void){
    float L = samplePressue(pressure, texelCoord - vec2(invresolution.x, 0));
    float R = samplePressue(pressure, texelCoord + vec2(invresolution.x, 0));
    float B = samplePressue(pressure, texelCoord - vec2(0, invresolution.y));
    float T = samplePressue(pressure, texelCoord + vec2(0, invresolution.y));

    vec2 v = texture2D(velocity, texelCoord).xy;

    gl_FragColor = vec4(v - halfrdx * vec2(R - L, T - B), 0, 1);
}
`

const MOUSE_FORCE =
  FLUID_BASE +
  GEOM +
  `
uniform sampler2D velocity;
uniform float dt;
uniform float dx;
uniform float uDecay;
uniform float uStrength;

uniform float isMouseDown;
uniform vec2 mouseClipSpace;
uniform vec2 lastMouseClipSpace;

void main(){
    vec2 v = texture2D(velocity, texelCoord).xy;

    v.xy *= uDecay;

    if(isMouseDown > 0.5){
        vec2 mouse = clipToSimSpace(mouseClipSpace);
        vec2 lastMouse = clipToSimSpace(lastMouseClipSpace);
        vec2 mouseVelocity = -(lastMouse - mouse) / dt;

        float fp;
        float l = distanceToSegment(mouse, lastMouse, p, fp);
        float taperFactor = 0.6;
        float projectedFraction = 1.0 - clamp(fp, 0.0, 1.0) * taperFactor;

        float R = 0.015;
        float m = exp(-l / R);
        m *= projectedFraction * projectedFraction;

        vec2 targetVelocity = mouseVelocity * dx * uStrength;
        v += (targetVelocity - v) * m;
    }

    gl_FragColor = vec4(v, 0, 1.);
}
`

const MOUSE_DYE =
  FLUID_BASE +
  GEOM +
  `
uniform sampler2D dye;
uniform float dt;
uniform float dx;
uniform vec3 uDecay;
uniform vec3 uLow;
uniform vec3 uHigh;
uniform vec3 uGlint;

uniform float isMouseDown;
uniform vec2 mouseClipSpace;
uniform vec2 lastMouseClipSpace;

void main(){
    vec4 color = texture2D(dye, texelCoord);

    color.rgb *= uDecay;

    if(isMouseDown > 0.5){
        vec2 mouse = clipToSimSpace(mouseClipSpace);
        vec2 lastMouse = clipToSimSpace(lastMouseClipSpace);
        vec2 mouseVelocity = -(lastMouse - mouse) / dt;

        float fp;
        float l = distanceToSegment(mouse, lastMouse, p, fp);
        float taperFactor = 0.6;
        float projectedFraction = 1.0 - clamp(fp, 0.0, 1.0) * taperFactor;

        float R = 0.025;
        float m = exp(-l / R);

        float speed = length(mouseVelocity);
        float x = clamp((speed * speed * 0.02 - l * 5.0) * projectedFraction, 0., 1.);
        color.rgb += m * (mix(uLow, uHigh, x) + uGlint * pow(x, 9.));
    }

    gl_FragColor = vec4(color.rgb, 1.0);
}
`

const PARTICLE_INIT = `
varying vec2 texelCoord;

uniform float cellSize;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main(){
    vec2 jitter = vec2(hash21(texelCoord), hash21(texelCoord + 7.31)) * cellSize;
    vec2 ip = vec2((texelCoord.x), (texelCoord.y)) * 2.0 - 1.0 + jitter * 2.0;
    vec2 iv = vec2(0, 0);
    gl_FragColor = vec4(ip, iv);
}
`

const PARTICLE_STEP = `
varying vec2 texelCoord;

uniform float dt;
uniform sampler2D particleData;
uniform float dragCoefficient;
uniform vec2 flowScale;
uniform sampler2D flowVelocityField;

void main(){
    vec2 p = texture2D(particleData, texelCoord).xy;
    vec2 v = texture2D(particleData, texelCoord).zw;

    vec2 vf = texture2D(flowVelocityField, (p + 1.) * .5).xy * flowScale;
    v += (vf - v) * dragCoefficient;

    p += dt * v;
    gl_FragColor = vec4(p, v);
}
`

const PARTICLE_VERT = `
precision highp float;
precision highp sampler2D;

uniform sampler2D particleData;
uniform float uPointSize;
uniform vec3 uSlow;
uniform vec3 uFast;
uniform vec3 uGlint;
uniform float uRest;

attribute vec2 particleUV;
varying vec4 color;

void main(){
    vec2 p = texture2D(particleData, particleUV).xy;
    vec2 v = texture2D(particleData, particleUV).zw;
    gl_PointSize = uPointSize;
    gl_Position = vec4(p, 0.0, 1.0);
    float speed = length(v);
    float x = clamp(speed * 4.0, 0., 1.);
    color.rgb = (mix(uSlow, uFast, x) + uGlint * x * x * x * ${GLINT_SCALE.toFixed(2)});
    color.rgb *= mix(1.0, smoothstep(${REST_FROM.toFixed(2)}, ${REST_TO.toFixed(2)}, x), uRest);
    color.a = 1.0;
}
`

const PARTICLE_FRAG = `
varying vec4 color;

void main(){
    gl_FragColor = vec4(color);
}
`

const QUAD_TEXTURE = `
uniform sampler2D texture;
varying vec2 texelCoord;

void main(void){
    gl_FragColor = abs(texture2D(texture, texelCoord));
}
`

let parseCtx: CanvasRenderingContext2D | null | undefined

function toRGB(css: string): [number, number, number] {
  if (!css) return [0, 0, 0]
  const s = css.trim()

  const hex = /^#([0-9a-f]{3,8})$/i.exec(s)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('')
    }
    const n = parseInt(h.slice(0, 6), 16)
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
  }

  const fn = /^rgba?\(([^)]+)\)$/i.exec(s)
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3)
    const v = parts.map((x) => (x.indexOf('%') >= 0 ? parseFloat(x) * 2.55 : parseFloat(x)))
    return [(v[0] || 0) / 255, (v[1] || 0) / 255, (v[2] || 0) / 255]
  }

  if (typeof document !== 'undefined') {
    if (parseCtx === undefined) {
      parseCtx = document.createElement('canvas').getContext('2d')
    }
    if (parseCtx) {
      parseCtx.fillStyle = '#000000'
      parseCtx.fillStyle = s
      const out = parseCtx.fillStyle
      if (typeof out === 'string' && out.charAt(0) === '#' && out !== s) {
        return toRGB(out)
      }
    }
  }
  return [0, 0, 0]
}

function particleSide(count: number): number {
  const t = Math.min(10, Math.max(0, count)) / 10
  const exp = PARTICLE_EXP_MIN + t * (PARTICLE_EXP_MAX - PARTICLE_EXP_MIN)
  return Math.max(16, Math.round(Math.pow(2, exp) / 16) * 16)
}

function fluidScale(detail: number): number {
  const t = Math.min(10, Math.max(0, detail)) / 10
  return 1 / (FLUID_DIVISOR_MAX - t * (FLUID_DIVISOR_MAX - FLUID_DIVISOR_MIN))
}

function decayFor(perFrame: number, dt: number, scale: number): number {
  return Math.pow(perFrame, scale * dt * 60)
}

type GLProgram = {
  prog: WebGLProgram
  uni: Record<string, WebGLUniformLocation | null>
}

type FBO = {
  tex: WebGLTexture
  fbo: WebGLFramebuffer
  w: number
  h: number
}

type Pair = { read: FBO; write: FBO }

type Fmt = { internal: number; type: number; linear: boolean }

const RGBA16F = 0x881a
const RGBA32F = 0x8814
const HALF_FLOAT = 0x140b

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return sh
}

/** A program asked for (compiled and linked), not yet read back: reading its status waits for the driver. */
type PendingProgram = { prog: WebGLProgram; vs: WebGLShader; fs: WebGLShader }

/** The extension's query for whether a program has finished compiling and linking. */
const COMPLETION_STATUS_KHR = 0x91b1

function startProgram(gl: WebGLRenderingContext, vert: string, frag: string, prelude: string, attrib: string): PendingProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, vert)
  const fs = compile(gl, gl.FRAGMENT_SHADER, prelude + frag)
  const prog = gl.createProgram()
  if (!vs || !fs || !prog) return null
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.bindAttribLocation(prog, 0, attrib)
  gl.linkProgram(prog)
  return { prog, vs, fs }
}

/** A program's result, once asked for (a failed compile fails its link). */
function finishProgram(gl: WebGLRenderingContext, { prog, vs, fs }: PendingProgram): GLProgram | null {
  const linked = gl.getProgramParameter(prog, gl.LINK_STATUS)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!linked) {
    gl.deleteProgram(prog)
    return null
  }

  const uni: Record<string, WebGLUniformLocation | null> = {}
  const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(prog, i)
    if (!info) continue
    const loc = gl.getUniformLocation(prog, info.name)
    uni[info.name] = loc
    uni[info.name.replace(/\[0\]$/, '')] = loc
  }
  return { prog, uni }
}

function makeFBO(gl: WebGLRenderingContext, w: number, h: number, fmt: Fmt, linear?: boolean): FBO | null {
  const tex = gl.createTexture()
  const fbo = gl.createFramebuffer()
  if (!tex || !fbo) return null

  const filter = linear && fmt.linear ? gl.LINEAR : gl.NEAREST
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, w, h, 0, gl.RGBA, fmt.type, null)

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    gl.deleteTexture(tex)
    gl.deleteFramebuffer(fbo)
    return null
  }

  gl.viewport(0, 0, w, h)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  return { tex, fbo, w, h }
}

function pickFormat(gl: WebGLRenderingContext, gl2: boolean): Fmt | null {
  const tries: Fmt[] = []
  if (gl2) {
    const cbf = gl.getExtension('EXT_color_buffer_float')
    const cbh = gl.getExtension('EXT_color_buffer_half_float')
    const fl = gl.getExtension('OES_texture_float_linear')
    if (cbf && fl) tries.push({ internal: RGBA32F, type: gl.FLOAT, linear: true })
    if (cbf) tries.push({ internal: RGBA32F, type: gl.FLOAT, linear: false })
    if (cbf || cbh) tries.push({ internal: RGBA16F, type: HALF_FLOAT, linear: true })
  } else {
    const f = gl.getExtension('OES_texture_float')
    const fl = gl.getExtension('OES_texture_float_linear')
    const hf = gl.getExtension('OES_texture_half_float') as {
      HALF_FLOAT_OES: number
    } | null
    const hfl = gl.getExtension('OES_texture_half_float_linear')
    if (f && fl) tries.push({ internal: gl.RGBA, type: gl.FLOAT, linear: true })
    if (f) tries.push({ internal: gl.RGBA, type: gl.FLOAT, linear: false })
    if (hf && hfl)
      tries.push({
        internal: gl.RGBA,
        type: hf.HALF_FLOAT_OES,
        linear: true,
      })
    if (hf)
      tries.push({
        internal: gl.RGBA,
        type: hf.HALF_FLOAT_OES,
        linear: false,
      })
  }

  for (const fmt of tries) {
    const probe = makeFBO(gl, 4, 4, fmt)
    if (probe) {
      gl.deleteTexture(probe.tex)
      gl.deleteFramebuffer(probe.fbo)
      return fmt
    }
  }
  return null
}

function OriginkitBaseNebulaDrift({
  colors,
  background = DEFAULTS.background,
  particles,
  dye,
  strength = DEFAULTS.strength,
  stir = DEFAULTS.stir,
  dark = DEFAULTS.dark,
  iterations = DEFAULTS.iterations,
  detail = DEFAULTS.detail,
  style,
}: NebulaDriftProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  const cfg = {
    colors: { ...DEFAULT_COLORS, ...colors },
    background,
    particles: { ...DEFAULT_PARTICLES, ...particles },
    dye: { ...DEFAULT_DYE, ...dye },
    strength,
    stir,
    dark,
    iterations,
    detail,
  }

  const propsRef = useRef(cfg)
  // The frame loop reads the latest settings from here (set after each render).
  useEffect(() => {
    propsRef.current = cfg
  })

  const pointerRef = useRef({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,

    over: false,

    moveAt: 0,
    known: false,
  })

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    let disposed = false
    let raf = 0
    let gl: WebGLRenderingContext | null = null
    let fmt: Fmt | null = null

    let progs: Record<string, GLProgram> = {}
    /** Programs asked for and not yet read back (init, settle), and whether the driver says when they are done. */
    let pending: Record<string, PendingProgram> = {}
    let parallel = false
    /** The programs are built: the field may be resized and drawn. */
    let built = false
    let quad: WebGLBuffer | null = null
    let particleUVs: WebGLBuffer | null = null

    let velocity: Pair | null = null
    let pressure: Pair | null = null
    let dyeRT: Pair | null = null
    let particleData: Pair | null = null
    let divergence: FBO | null = null

    let gridW = 0
    let gridH = 0
    let aspect = 1
    let partSide = 0
    let partCount = 0
    let maxPoint = 1
    let dpr = 1

    let onScreen = true
    let pageVisible = true
    let reduceMotion = false
    let warmed = false
    /** Steps of the first stir done so far (it is spread over a few frames). */
    let warmSteps = 0

    let ptrDrove = false

    let elapsed = 0
    let lastNow = 0

    const stroke = {
      fromX: 0,
      fromY: 0,
      toX: 0,
      toY: 0,
      start: 0,
      end: 0,
      next: 0,
      live: false,
    }

    /** Makes a program current (named so it is not taken for a React hook). */
    function activate(p: GLProgram) {
      gl!.useProgram(p.prog)
    }
    function u1f(p: GLProgram, n: string, v: number) {
      const l = p.uni[n]
      if (l) gl!.uniform1f(l, v)
    }
    function u2f(p: GLProgram, n: string, a: number, b: number) {
      const l = p.uni[n]
      if (l) gl!.uniform2f(l, a, b)
    }
    function u3f(p: GLProgram, n: string, v: [number, number, number]) {
      const l = p.uni[n]
      if (l) gl!.uniform3f(l, v[0], v[1], v[2])
    }
    function bindTex(p: GLProgram, n: string, t: WebGLTexture, unit: number) {
      const l = p.uni[n]
      if (!l) return
      gl!.activeTexture(gl!.TEXTURE0 + unit)
      gl!.bindTexture(gl!.TEXTURE_2D, t)
      gl!.uniform1i(l, unit)
    }

    function fluidUniforms(p: GLProgram) {
      u2f(p, 'invresolution', 1 / gridW, 1 / gridH)
      u1f(p, 'aspectRatio', aspect)
    }

    function mouseUniforms(p: GLProgram, down: boolean) {
      const ptr = pointerRef.current
      u1f(p, 'isMouseDown', down ? 1 : 0)
      u2f(p, 'mouseClipSpace', ptr.x, ptr.y)
      u2f(p, 'lastMouseClipSpace', ptr.lastX, ptr.lastY)
    }

    function bindQuad() {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad)
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0)
    }

    function bindParticleUVs() {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, particleUVs)
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0)
    }

    function target(t: FBO | null) {
      if (t) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, t.fbo)
        gl!.viewport(0, 0, t.w, t.h)
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
        gl!.viewport(0, 0, canvas!.width, canvas!.height)
      }
    }

    function blit(t: FBO | null) {
      target(t)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
    }

    function swap(p: Pair) {
      const t = p.read
      p.read = p.write
      p.write = t
    }

    function dropFBO(f: FBO | null) {
      if (!f || !gl) return
      gl.deleteTexture(f.tex)
      gl.deleteFramebuffer(f.fbo)
    }

    function dropPair(p: Pair | null) {
      if (!p) return
      dropFBO(p.read)
      dropFBO(p.write)
    }

    function dropFluid() {
      dropPair(velocity)
      dropPair(pressure)
      dropPair(dyeRT)
      dropFBO(divergence)
      velocity = pressure = dyeRT = null
      divergence = null
      gridW = gridH = 0
    }

    function dropParticles() {
      dropPair(particleData)
      particleData = null
      if (gl && particleUVs) gl.deleteBuffer(particleUVs)
      particleUVs = null
      partSide = partCount = 0
    }

    function init(): boolean {
      const opts = {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance' as const,
      }

      let gl2 = true
      let ctx = canvas!.getContext('webgl2', opts) as unknown as WebGLRenderingContext | null
      if (!ctx) {
        gl2 = false
        ctx =
          (canvas!.getContext('webgl', opts) as WebGLRenderingContext | null) ||
          (canvas!.getContext('experimental-webgl') as WebGLRenderingContext | null)
      }
      if (!ctx) return false
      gl = ctx

      const vtf = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) as number
      if (!vtf || vtf < 1) return false

      fmt = pickFormat(gl, gl2)
      if (!fmt) return false

      const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array | null
      maxPoint = range && range.length > 1 ? range[1] : 1

      const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)

      const prelude = 'precision ' + (hp && hp.precision > 0 ? 'highp' : 'mediump') + ' float;\n'

      // Every program is asked for here; settle() reads them back once the driver has finished.
      const passes: [string, string, string, string][] = [
        ['advect', FLUID_VERT, ADVECT, 'vertexPosition'],
        ['divergence', FLUID_VERT, DIVERGENCE, 'vertexPosition'],
        ['pressureSolve', FLUID_VERT, PRESSURE_SOLVE, 'vertexPosition'],
        ['pressureGradient', FLUID_VERT, PRESSURE_GRADIENT, 'vertexPosition'],
        ['mouseForce', FLUID_VERT, MOUSE_FORCE, 'vertexPosition'],
        ['mouseDye', FLUID_VERT, MOUSE_DYE, 'vertexPosition'],
        ['particleInit', PLANE_VERT, PARTICLE_INIT, 'vertexPosition'],
        ['particleStep', PLANE_VERT, PARTICLE_STEP, 'vertexPosition'],
        ['screenTexture', PLANE_VERT, QUAD_TEXTURE, 'vertexPosition'],
        ['particleRender', PARTICLE_VERT, PARTICLE_FRAG, 'particleUV'],
      ]
      parallel = Boolean(gl.getExtension('KHR_parallel_shader_compile'))
      progs = {}
      pending = {}
      for (const [key, vert, frag, attrib] of passes) {
        const p = startProgram(gl, vert, frag, prelude, attrib)
        if (!p) return false
        pending[key] = p
      }
      return true
    }

    /**
     * The programs asked for in init(), read back: null while the driver is still compiling them (where it can say
     * so), then whether they all built; the quad and the drawing state are set up with them.
     */
    function settle(): boolean | null {
      if (!gl) return false
      const all = Object.values(pending)
      if (parallel && all.some((p) => !gl!.getProgramParameter(p.prog, COMPLETION_STATUS_KHR))) return null
      let ok = true
      for (const key in pending) {
        const p = finishProgram(gl, pending[key])
        if (p) progs[key] = p
        else ok = false
      }
      pending = {}
      if (!ok) return false

      quad = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(0)
      gl.disable(gl.DEPTH_TEST)
      gl.disable(gl.BLEND)
      gl.disable(gl.DITHER)
      return true
    }

    function buildFluid(w: number, h: number) {
      if (!gl || !fmt) return
      dropFluid()
      gridW = w
      gridH = h
      aspect = w / h

      const mk = () => makeFBO(gl!, w, h, fmt!)
      const va = mk()
      const vb = mk()
      const pa = mk()
      const pb = mk()

      const da = makeFBO(gl, w, h, fmt, true)
      const db = makeFBO(gl, w, h, fmt, true)
      divergence = mk()
      if (!va || !vb || !pa || !pb || !da || !db || !divergence) {
        setFailed(true)
        return
      }
      velocity = { read: va, write: vb }
      pressure = { read: pa, write: pb }
      dyeRT = { read: da, write: db }
      warmed = false
      warmSteps = 0
    }

    function buildParticles(side: number) {
      if (!gl || !fmt) return
      dropParticles()
      partSide = side
      partCount = side * side

      const pa = makeFBO(gl, side, side, fmt)
      const pb = makeFBO(gl, side, side, fmt)
      if (!pa || !pb) {
        setFailed(true)
        return
      }
      particleData = { read: pa, write: pb }

      const uvs = new Float32Array(partCount * 2)
      for (let i = 0; i < side; i++) {
        for (let j = 0; j < side; j++) {
          const k = (i * side + j) * 2
          uvs[k] = i / side
          uvs[k + 1] = j / side
        }
      }
      particleUVs = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, particleUVs)
      gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)

      bindQuad()
      activate(progs.particleInit)
      u1f(progs.particleInit, 'cellSize', 1 / side)
      blit(particleData.write)
      swap(particleData)
      warmed = false
      warmSteps = 0
    }

    function stirPointer(): boolean {
      const ptr = pointerRef.current
      if (!stroke.live && elapsed >= stroke.next) {
        const r = () => Math.random() * 1.2 - 0.6
        stroke.fromX = r()
        stroke.fromY = r()
        stroke.toX = r()
        stroke.toY = r()
        stroke.start = elapsed
        stroke.end = elapsed + STIR_STROKE
        stroke.live = true

        ptr.x = stroke.fromX
        ptr.y = stroke.fromY
        ptr.lastX = ptr.x
        ptr.lastY = ptr.y
        return false
      }
      if (!stroke.live) return false

      const t = (elapsed - stroke.start) / (stroke.end - stroke.start)
      if (t >= 1) {
        stroke.live = false
        stroke.next = elapsed + STIR_PAUSE_MIN + Math.random() * (STIR_PAUSE_MAX - STIR_PAUSE_MIN)
        return false
      }

      const e = t * t * (3 - 2 * t)
      ptr.x = stroke.fromX + (stroke.toX - stroke.fromX) * e
      ptr.y = stroke.fromY + (stroke.toY - stroke.fromY) * e
      return true
    }

    function stepFluid(dt: number, down: boolean) {
      if (!gl || !velocity || !pressure || !dyeRT || !divergence) return
      const p = propsRef.current
      bindQuad()

      const rdx = 1 / CELL_SIZE
      const halfrdx = 0.5 * rdx

      const ad = progs.advect
      activate(ad)
      fluidUniforms(ad)
      u1f(ad, 'dt', dt)
      u1f(ad, 'rdx', rdx)
      bindTex(ad, 'target', velocity.read.tex, 0)
      bindTex(ad, 'velocity', velocity.read.tex, 1)
      blit(velocity.write)
      swap(velocity)

      const mf = progs.mouseForce
      activate(mf)
      fluidUniforms(mf)
      u1f(mf, 'dt', dt)
      u1f(mf, 'dx', CELL_SIZE)
      u1f(mf, 'uDecay', decayFor(p.dark ? SETTLE_DECAY : VELOCITY_DECAY, dt, 1))

      u1f(mf, 'uStrength', p.strength / 5)
      mouseUniforms(mf, down)
      bindTex(mf, 'velocity', velocity.read.tex, 0)
      blit(velocity.write)
      swap(velocity)

      const dv = progs.divergence
      activate(dv)
      fluidUniforms(dv)
      u1f(dv, 'halfrdx', halfrdx)
      bindTex(dv, 'velocity', velocity.read.tex, 0)
      blit(divergence)

      const ps = progs.pressureSolve
      activate(ps)
      fluidUniforms(ps)
      u1f(ps, 'alpha', -CELL_SIZE * CELL_SIZE)
      bindTex(ps, 'divergence', divergence.tex, 1)
      const iters = Math.max(1, Math.round(p.iterations))
      for (let i = 0; i < iters; i++) {
        bindTex(ps, 'pressure', pressure.read.tex, 0)
        blit(pressure.write)
        swap(pressure)
      }

      const pg = progs.pressureGradient
      activate(pg)
      fluidUniforms(pg)
      u1f(pg, 'halfrdx', halfrdx)
      bindTex(pg, 'pressure', pressure.read.tex, 0)
      bindTex(pg, 'velocity', velocity.read.tex, 1)
      blit(velocity.write)
      swap(velocity)

      const low = toRGB(p.colors.slow)
      const high = toRGB(p.colors.fast)
      const glint = toRGB(p.colors.glint)
      const k = p.dye.fade / 5
      const md = progs.mouseDye
      activate(md)
      fluidUniforms(md)
      u1f(md, 'dt', dt)
      u1f(md, 'dx', CELL_SIZE)
      u3f(md, 'uDecay', [decayFor(DYE_DECAY[0], dt, k), decayFor(DYE_DECAY[1], dt, k), decayFor(DYE_DECAY[2], dt, k)])
      u3f(md, 'uLow', [low[0] * DYE_LOW_SCALE, low[1] * DYE_LOW_SCALE, low[2] * DYE_LOW_SCALE])
      u3f(md, 'uHigh', [high[0] * DYE_HIGH_SCALE, high[1] * DYE_HIGH_SCALE, high[2] * DYE_HIGH_SCALE])
      u3f(md, 'uGlint', glint)
      mouseUniforms(md, down)
      bindTex(md, 'dye', dyeRT.read.tex, 0)
      blit(dyeRT.write)
      swap(dyeRT)

      activate(ad)
      fluidUniforms(ad)
      u1f(ad, 'dt', dt)
      u1f(ad, 'rdx', rdx)
      bindTex(ad, 'target', dyeRT.read.tex, 0)
      bindTex(ad, 'velocity', velocity.read.tex, 1)
      blit(dyeRT.write)
      swap(dyeRT)
    }

    function stepParticles(dt: number) {
      if (!gl || !particleData || !velocity) return
      const p = propsRef.current
      bindQuad()

      const sp = progs.particleStep
      activate(sp)
      u1f(sp, 'dt', dt)

      const inertia = p.particles.inertia
      u1f(sp, 'dragCoefficient', inertia <= 0 ? 1 : 1 - Math.exp(-dt / (inertia * 0.05)))

      u2f(sp, 'flowScale', 1 / (CELL_SIZE * aspect), 1 / CELL_SIZE)
      bindTex(sp, 'particleData', particleData.read.tex, 0)
      bindTex(sp, 'flowVelocityField', velocity.read.tex, 1)
      blit(particleData.write)
      swap(particleData)
    }

    function render() {
      if (!gl || !particleData || !dyeRT) return
      const p = propsRef.current

      const bg = toRGB(p.background)
      target(null)
      gl.clearColor(bg[0], bg[1], bg[2], 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.SRC_ALPHA)
      gl.blendEquation(gl.FUNC_ADD)

      const pr = progs.particleRender
      activate(pr)
      u1f(pr, 'uPointSize', Math.min(maxPoint, Math.max(1, p.particles.size * dpr)))
      u3f(pr, 'uSlow', toRGB(p.colors.slow))
      u3f(pr, 'uFast', toRGB(p.colors.fast))
      u3f(pr, 'uGlint', toRGB(p.colors.glint))
      u1f(pr, 'uRest', p.dark ? 1 : 0)
      bindTex(pr, 'particleData', particleData.read.tex, 0)
      bindParticleUVs()
      target(null)
      gl.drawArrays(gl.POINTS, 0, partCount)

      if (p.dye.show) {
        const st = progs.screenTexture
        activate(st)
        bindTex(st, 'texture', dyeRT.read.tex, 0)
        bindQuad()
        target(null)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }

      gl.disable(gl.BLEND)
    }

    function resize() {
      if (!gl || !built) return
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
      const cw = Math.max(1, Math.round(host!.clientWidth * dpr))
      const ch = Math.max(1, Math.round(host!.clientHeight * dpr))
      if (canvas!.width !== cw || canvas!.height !== ch) {
        canvas!.width = cw
        canvas!.height = ch
      }

      const p = propsRef.current

      const s = fluidScale(p.detail)
      const w = Math.max(8, Math.min(GRID_MAX, Math.round(host!.clientWidth * s)))
      const h = Math.max(8, Math.min(GRID_MAX, Math.round(host!.clientHeight * s)))

      if (Math.abs(w - gridW) / Math.max(1, gridW) > 0.04 || Math.abs(h - gridH) / Math.max(1, gridH) > 0.04) {
        buildFluid(w, h)
      }

      const side = particleSide(p.particles.count)
      if (side !== partSide) buildParticles(side)
    }

    function loop(now: number) {
      raf = 0
      if (disposed) return
      // Off screen or in a hidden tab it asks for no frames: wake() starts it again.
      if (!onScreen || !pageVisible) {
        lastNow = 0
        return
      }

      const ptr = pointerRef.current
      const p = propsRef.current

      // Resting dark and left alone, it is black again: nothing to step or draw, and no frames asked for, until the
      // pointer moves (wake).
      if (warmed && p.dark && !p.stir && now - ptr.moveAt > SLEEP_AFTER) {
        lastNow = 0
        return
      }
      raf = requestAnimationFrame(loop)

      const dt = lastNow ? Math.min((now - lastNow) / 1000, 0.05) : 0
      lastNow = now

      // The first stir (so the field is already alive when the page appears), a few steps a frame.
      if (!warmed && velocity && particleData) {
        const n = reduceMotion ? STILL_WARMUP : WARMUP
        if (p.stir) {
          const until = Math.min(n, warmSteps + WARMUP_PER_FRAME)
          for (; warmSteps < until; warmSteps++) {
            elapsed += STEP
            const down = stirPointer()
            stepFluid(STEP, down)
            stepParticles(STEP)
            ptr.lastX = ptr.x
            ptr.lastY = ptr.y
          }
          warmed = warmSteps >= n
        } else {
          warmed = true
        }
        render()
        return
      }

      if (!reduceMotion && dt > 0) {
        elapsed += dt

        const hovering = ptr.over && ptr.known && now - ptr.moveAt < HOVER_HOLD
        if (hovering) {
          if (!ptrDrove) {
            ptr.lastX = ptr.x
            ptr.lastY = ptr.y
          }

          if (stroke.live) {
            stroke.live = false
            stroke.next = elapsed + STIR_PAUSE_MIN
          }
        }
        ptrDrove = hovering
        const down = hovering || (p.stir ? stirPointer() : false)
        stepFluid(dt, down)
        stepParticles(dt)

        ptr.lastX = ptr.x
        ptr.lastY = ptr.y
      }
      render()
    }

    /** Starts the frame loop again when it has stopped (asleep, off screen, in a hidden tab), once it is built. */
    function wake() {
      if (!raf && built && !disposed) raf = requestAnimationFrame(loop)
    }

    /**
     * Waits a frame at a time for the programs asked for in init() (settle), then, in the frame after, builds the
     * field (resize) and starts the loop: no single frame holds both the shaders' compiling and the field's setup.
     */
    function start() {
      built = false
      const wait = () => {
        raf = 0
        if (disposed) return
        const ok = settle()
        if (ok === null) {
          raf = requestAnimationFrame(wait)
          return
        }
        if (!ok) {
          setFailed(true)
          return
        }
        built = true
        raf = requestAnimationFrame(() => {
          raf = 0
          if (disposed) return
          resize()
          wake()
        })
      }
      raf = requestAnimationFrame(wait)
    }

    if (!init()) {
      setFailed(true)
      return
    }

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            resize()
            wake()
          })
        : null
    if (ro) ro.observe(host)

    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              onScreen = entries.some((e) => e.isIntersecting)
              if (onScreen) wake()
            },
            { rootMargin: '128px' },
          )
        : null
    if (io) io.observe(host)

    const onVisibility = () => {
      pageVisible = document.visibilityState !== 'hidden'
      if (pageVisible) wake()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduceMotion = mq.matches
    const onMQ = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches

      gridW = gridH = 0
      resize()
      wake()
    }
    if (mq.addEventListener) mq.addEventListener('change', onMQ)
    else mq.addListener(onMQ)

    // The pointer anywhere over the window (the page's content lies over the field, so it gets no events of its own).
    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const p = pointerRef.current
      p.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      p.y = ((rect.height - (e.clientY - rect.top)) / rect.height) * 2 - 1
      if (!p.known) {
        p.lastX = p.x
        p.lastY = p.y
      }
      p.known = true
      p.over = true
      p.moveAt = nowMs()
      wake()
    }
    const onPointerOut = (e: MouseEvent) => {
      if (e.relatedTarget) return
      const p = pointerRef.current
      p.over = false
      p.known = false
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('mouseout', onPointerOut)

    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      raf = 0
      built = false
    }
    const onRestored = () => {
      if (disposed) return
      lastNow = 0
      gridW = gridH = 0
      partSide = 0
      if (init()) start()
      else setFailed(true)
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    start()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      if (ro) ro.disconnect()
      if (io) io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      if (mq.removeEventListener) mq.removeEventListener('change', onMQ)
      else mq.removeListener(onMQ)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseout', onPointerOut)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      if (gl) {
        dropFluid()
        dropParticles()
        if (quad) gl.deleteBuffer(quad)
        for (const k in progs) gl.deleteProgram(progs[k].prog)
        for (const k in pending) {
          gl.deleteShader(pending[k].vs)
          gl.deleteShader(pending[k].fs)
          gl.deleteProgram(pending[k].prog)
        }
        // The context itself is left alone (the supplied code lost it here): React can set the effect up again on the
        // same canvas (development runs every effect twice), and a canvas never gets a second context, so a lost one
        // left the field blank white. Everything it held is freed above; the context goes with its canvas.
      }
    }
  }, [])

  const fallback: CSSProperties =
    failed && !dark
      ? {
          background:
            'radial-gradient(120% 100% at 50% 50%, ' + cfg.colors.glint + ', ' + cfg.colors.fast + ', ' + cfg.colors.slow + ', ' + cfg.background + ')',
        }
      : {}

  return (
    <div
      ref={hostRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: cfg.background,

        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          ...fallback,
        }}
      />
    </div>
  )
}

/**
 * Harlie's preset (--custom-style, 2026-09-28): a deep navy flow over violet black, with a cyan glint where it runs
 * fastest. It rests dark and shows only where and while the pointer moves (Harlie, 2026-09-28): no stirring of its own.
 */
const PRESET: NebulaDriftProps = {
  colors: {
    fast: '#001022',
    slow: '#0C0018',
    glint: '#3DBEDE',
  },
  particles: {
    size: 1,
    count: 5.9,
    inertia: 2,
  },
  dye: {
    fade: 1.6,
    show: true,
  },
  strength: 5.6,
  stir: false,
  dark: true,
  iterations: 6,
}

export default function NebulaDrift(props: NebulaDriftProps) {
  return <OriginkitBaseNebulaDrift {...PRESET} {...props} />
}
