import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { pointerOver, type PointerOver } from './pointerContext'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/**
 * What the outline wraps, and nothing else (Harlie's requests, 2026-09-27): the header's navigation items (Back, Home,
 * the links and the Menu button), Creative Production's "Watch the film" buttons and the case studies' Next and
 * Previous project buttons. Everywhere else the light stays a ball. Every outline is a pill.
 *
 * About's Send Message is the same stateful pill as "Watch the film" and has no hover of its own (components.css: the
 * outline marks it), so it takes the outline too; without it the button showed no change under the pointer (Harlie's
 * brief, 2026-09-28, item 6: button states clear).
 */
const TARGETS = '.site-header .site-nav__item, .site-header .menu-button, .cw-watch, .site-end__pager, .about-contact__send'
/**
 * The navigation's items: their outline hugs them in the shape of the Next project button (Harlie's request), a pill
 * 40px tall with 16px either side of the words (the items are 44px tall with 12px either side).
 */
const NAV = '.site-header .site-nav__item, .site-header .menu-button'
const NAV_PAD_X = 4
const NAV_PAD_Y = -2
/**
 * Over the rest of what can be clicked the ball only brightens a touch, as a hint; it draws no outline there. Creative
 * Production's film frames open their film on a click, so they brighten it too (Harlie's brief, 2026-09-28: consistent
 * feedback on everything clickable).
 */
const HINTS = 'a[href], button, [role="button"], summary, select, label[for], .plane, .cw-frame'

/** Space between a target's edge and its outline (px). */
const PAD = 7
/** The ring's size when it rests inside the ball (px): it grows out of this and shrinks back into it. */
const SEED = 8
/**
 * Leaving a navigation item for nothing waits this long (ms), so crossing the gap between neighbours slides the outline
 * across. The other targets stand alone and let go at once.
 */
const RELEASE_MS = 80
/** Only a target this close (px) takes the outline over by sliding; one further away grows its own from the ball. */
const NEIGHBOUR_GAP = 48
/**
 * How quickly an outline that was let go fades where it is (per second; Harlie's brief, 2026-09-28: no empty pill
 * trailing the ball). With FADE_END it is gone in about 130ms.
 */
const FADE_RATE = 24
const FADE_END = 0.04

/**
 * Springs (stiffness, damping ratio), as in React Bits' Custom Cursor (outer circle 150 / 20): the outline's
 * edges. An edge moving outwards is a little stiffer than one drawing in, so the outline stretches in the
 * direction it travels and settles back, and it shrinks into the ball a touch more slowly than it grows.
 */
const EDGE = { stiffness: 180, ratio: 0.78, outward: 1.2, inward: 0.85 }
const PRESS = { stiffness: 620, ratio: 0.9 }

interface Spring {
  x: number
  v: number
}

interface Box {
  left: number
  top: number
  right: number
  bottom: number
  radius: number
}

/** One semi-implicit Euler step of a damped spring towards `goal`. */
function stepSpring(s: Spring, goal: number, stiffness: number, ratio: number, dt: number) {
  const damping = 2 * ratio * Math.sqrt(stiffness)
  s.v += (stiffness * (goal - s.x) - damping * s.v) * dt
  s.x += s.v * dt
}

const settled = (s: Spring, goal: number) => Math.abs(goal - s.x) < 0.05 && Math.abs(s.v) < 0.05

/**
 * The pointer (Harlie's requests, 2026-09-27: "change the mouse to a small glowing ball of light", "i dont want the
 * mouse to show i want a glowing light to replace it", "more like a ball of light not a perfectly round circle", and
 * "make the mouse ball of light red", then "that bright blue, purple color again"). A crisp near-white core fading through violet-white into a soft blue violet halo, with
 * no hard edge, sits exactly on the pointer; its halo breathes gently (cursor.css) and it squashes and stretches a
 * little along a quick movement. Over a link or button it brightens very slightly, and nothing more.
 *
 * Over the header's navigation items and "Watch the film" only (Harlie's request, after React Bits Pro's Custom
 * Cursor: "when i hover over something it would grow to outline it") a dim glowing outline grows out of the ball
 * into a round pill around the target, on a spring with a hint of elastic life, and keeps hold of it if it moves.
 * On leaving, it fades where it is, around what it outlined, in about 130ms (Harlie's brief, 2026-09-28: it used to
 * shrink after the ball as an empty pill below "Watch the film" for about 300ms); between two navigation items side by
 * side it still slides across. A press tightens both a little.
 *
 * The system cursor never shows for a mouse or trackpad ((hover: hover) and (pointer: fine); cursor.css), text
 * fields and the dragged strip included, once the pointer has moved. The exceptions are full screen (the film
 * viewer's video), where the player's own cursor returns, and embedded players (an iframe draws its own cursor).
 * Everything here ignores pointer events, so clicks, text selection and dragging the strip are untouched. The
 * layer is a manual popover, so it sits in the top layer above the image and film viewers' modal dialogs; it is
 * raised again whenever one opens (without popover support the system cursor returns while a modal is open). It
 * hides when the pointer leaves the window or the window loses focus. Touch: nothing is drawn.
 *
 * It also says what it is over (Harlie's brief, 2026-09-28: decoration beneath functional UI; pointerContext.ts):
 * html[data-pointer-over] is `field`, `control`, `form` or `text`. Over copy and fields the ball draws in, smaller and
 * softer, so its brightest part never hides the letters under it; over a link or button its glow still brightens
 * but its core draws in to a point, so the label and the control's own hover state read (cursor.css). The soft
 * light and the case studies' ground step back by the same attribute (stage.css), and the trail dims by it.
 *
 * One animation-frame loop runs only while something is moving (the pointer, a spring, a target that is itself
 * moving); nothing runs when all is still (the breathing is a CSS animation), and nothing in React re-renders.
 * Reduced motion: the ball still follows, without breathing or stretch, and the outline simply fades in and out
 * around its target without spring motion.
 */
export function CustomCursor() {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = useReducedMotion()
  const { pathname } = useLocation()
  const layerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const ballRef = useRef<HTMLDivElement>(null)
  /** Looks again at what is under the (still) pointer: a new page can arrive under it without a move. */
  const rehitRef = useRef<() => void>(() => {})

  useEffect(() => {
    const layer = layerRef.current
    const ring = ringRef.current
    const ball = ballRef.current
    if (!fine || !layer || !ring || !ball) return
    const root = document.documentElement
    const canRaise = typeof layer.showPopover === 'function'

    // The pointer, and whether the ball is showing.
    let px = -100
    let py = -100
    let seen = false
    let visible = false
    // The ball's stretch along its travel (smoothed speed in px/s and heading).
    let lastX = 0
    let lastY = 0
    let lastT = 0
    let speed = 0
    let heading = 0
    // The target and a pending release.
    let target: Element | null = null
    /** The outline's current target is a navigation item: drawn as a button-shaped pill around it. */
    let navItem = false
    let releaseAt = 0
    /**
     * The outline was let go (the pointer left its target, or a scroll carried the target away): it fades where it
     * is, around the target and carried with it, instead of travelling to the ball (Harlie's brief, 2026-09-28).
     */
    let fading = false
    /** The last box of a target that went away (a new page) while its outline fades there. */
    let frozen: Box | null = null
    /** The next look at what is under the pointer comes from a scroll: it never grows a new outline (below). */
    let scrollHit = false
    let lastEventTarget: EventTarget | null = null
    let hint = false
    let over: PointerOver | null = null
    let needsHit = false
    // The outline: four edges and a corner radius, each on its own spring, and its presence (0 to 1).
    const edges = { left: { x: 0, v: 0 }, top: { x: 0, v: 0 }, right: { x: 0, v: 0 }, bottom: { x: 0, v: 0 }, radius: { x: 0, v: 0 } }
    let presence = 0
    const press: Spring = { x: 0, v: 0 }
    let pressGoal = 0
    let lastRect = ''
    // The goal last frame, to carry the outline along with a target that moves (no spring lag behind it).
    let lastGoal: Box | null = null
    let lastTarget: Element | null = null
    let stillFrames = 0
    let ringShown = true
    let frame = 0
    let then = 0
    let fullscreen = false
    let modalFallback = false

    const setNative = () => {
      // The system cursor is hidden only while the ball can stand in for it.
      if (seen && !fullscreen && !modalFallback) root.dataset.cursor = 'custom'
      else delete root.dataset.cursor
      if (fullscreen || modalFallback) layer.dataset.off = ''
      else delete layer.dataset.off
    }

    const show = (on: boolean) => {
      if (visible === on) return
      visible = on
      if (on) layer.dataset.visible = ''
      else delete layer.dataset.visible
    }

    const setHint = (on: boolean) => {
      if (hint === on) return
      hint = on
      if (on) layer.dataset.hint = ''
      else delete layer.dataset.hint
    }

    /** What the pointer is over, on the root, for every layer of its light (pointerContext.ts). */
    const setOver = (next: PointerOver | null) => {
      if (over === next) return
      over = next
      if (next) root.dataset.pointerOver = next
      else delete root.dataset.pointerOver
    }

    /** Puts the layer on top of the top layer again (after a modal dialog or another popover opens). */
    const raise = () => {
      if (!canRaise || !layer.isConnected) return
      try {
        if (layer.matches(':popover-open')) layer.hidePopover()
        layer.showPopover()
      } catch {
        /* Not in a state to show (e.g. being removed): the next raise will. */
      }
    }

    const snapRingToPointer = () => {
      edges.left.x = px - SEED / 2
      edges.right.x = px + SEED / 2
      edges.top.x = py - SEED / 2
      edges.bottom.x = py + SEED / 2
      edges.radius.x = SEED / 2
      for (const s of Object.values(edges)) s.v = 0
    }

    /** The outline ends at once, with no exit: its target is covered or gone, so there is nothing left to outline. */
    const drop = () => {
      target = null
      fading = false
      frozen = null
      releaseAt = 0
      presence = 0
      lastGoal = null
      lastTarget = null
      snapRingToPointer()
      delete root.dataset.cursorOutline
    }

    /** The outline's current box is more than a neighbour's gap away from `el`. */
    const farFrom = (el: Element) => {
      const r = el.getBoundingClientRect()
      const gapX = Math.max(0, r.left - edges.right.x, edges.left.x - r.right)
      const gapY = Math.max(0, r.top - edges.bottom.x, edges.top.x - r.bottom)
      return Math.hypot(gapX, gapY) > NEIGHBOUR_GAP
    }

    /** The pointer is further than a neighbour's gap from `el`: it has left, and no neighbour will take the outline. */
    const pointerFar = (el: Element) => {
      const r = el.getBoundingClientRect()
      const gapX = Math.max(0, r.left - px, px - r.right)
      const gapY = Math.max(0, r.top - py, py - r.bottom)
      return Math.hypot(gapX, gapY) > NEIGHBOUR_GAP
    }

    /** The target is drawn where it stands (not covered by a modal dialog, not off screen). */
    const covered = (el: Element) => {
      const rect = el.getBoundingClientRect()
      const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
      return !top || !el.contains(top)
    }

    /**
     * The outline is let go: it fades where it is, around the target it outlined (carried with it if the page moves),
     * and the target is released once it has faded (tick). One that is covered or gone ends at once (Harlie's brief,
     * 2026-09-28: the outline never detaches from what it outlines; before, it shrank after the ball as an empty pill
     * below "Watch the film", the Next project button and Send Message for about 300ms).
     */
    const letGo = () => {
      releaseAt = 0
      if (target && target.isConnected && !covered(target)) {
        fading = true
        delete root.dataset.cursorOutline
      } else drop()
    }

    const setTarget = (next: Element | null) => {
      if (fading) {
        // Fading around its target: over nothing it finishes; the same target takes it back; a different one grows
        // its own outline from the ball (never one sliding over from the faded target).
        if (!next) return
        if (next === target) {
          fading = false
          root.dataset.cursorOutline = ''
          return
        }
        drop()
      }
      if (next === target) {
        releaseAt = 0
        return
      }
      if (!next) {
        // Crossing the gap between two navigation items: hold on briefly, and a neighbour entered in time takes the
        // outline over directly. Anything else, or a pointer already well away, lets go at once.
        const hold = !reduced && navItem && target !== null && !pointerFar(target)
        if (hold && !releaseAt) {
          releaseAt = performance.now() + RELEASE_MS
          return
        }
        if (hold && performance.now() < releaseAt) return
        letGo()
        return
      }
      // Growing from nothing, or from an outline further away than a neighbour (a quick move from the header's Menu
      // down to "Watch the film"): start from the ball, wherever the pointer is now, so no empty outline slides across
      // the page (Harlie's brief, 2026-09-28, item 1). The navigation's items, side by side, still hand it over.
      if ((!target && presence < 0.02) || farFrom(next)) snapRingToPointer()
      target = next
      navItem = next.matches(NAV)
      releaseAt = 0
      lastRect = ''
      stillFrames = 0
      root.dataset.cursorOutline = ''
    }

    /**
     * What is under a still pointer changed without the pointer moving (a scroll, a modal dialog opening, the target
     * moving, a new page). The target was taken from the pointer, not left by it (Harlie's brief, 2026-09-28, item 1:
     * the empty rounded rectangle under the Night Club Global Tour text, where the page's end stops "Watch the film"
     * just above a resting pointer, and over the film viewer as it opened). A target still in view is let go where it
     * is, with no pause (its outline fades around it, carried with it), as when the pointer leaves it (setTarget); one
     * that is covered or gone ends at once; a new target under the pointer grows from the ball.
     */
    const retarget = (next: Element | null) => {
      if (!target || fading || releaseAt || next === target) {
        setTarget(next)
        return
      }
      if (!next) {
        letGo()
        return
      }
      drop()
      setTarget(next)
    }

    /** The outline target (if any) for an element under the pointer; also sets the brightening hint and the context. */
    const resolve = (el: Element | null) => {
      setOver(pointerOver(el))
      const hit = el?.closest(TARGETS) ?? null
      // A target with keyboard focus already shows the focus ring: the outline would cross it (Harlie's brief,
      // 2026-09-28, item 6: focus distinguishable from the decorative light), so the ring is its only edge.
      const usable = hit && !hit.matches(':disabled, [aria-disabled="true"], :focus-visible') ? hit : null
      setHint(!usable && Boolean(el?.closest(HINTS)))
      return usable
    }

    /** The outline's goal around the current target: always a round pill (Harlie's request), or null if it is gone. */
    const goalBox = (): Box | null => {
      if (!target) return frozen
      if (!target.isConnected) return null
      const rect = target.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return null
      const padX = navItem ? NAV_PAD_X : PAD
      const padY = navItem ? NAV_PAD_Y : PAD
      const width = rect.width + padX * 2
      const height = rect.height + padY * 2
      return {
        left: rect.left - padX,
        right: rect.right + padX,
        top: rect.top - padY,
        bottom: rect.bottom + padY,
        radius: Math.min(width, height) / 2,
      }
    }

    const kick = () => {
      if (!frame) {
        then = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    const tick = (now: number) => {
      frame = 0
      const dt = Math.min(1 / 30, Math.max(0, (now - then) / 1000))
      then = now
      let moving = false

      if (needsHit) {
        needsHit = false
        const next = resolve(document.elementFromPoint(px, py))
        if (scrollHit && next && next !== target) {
          // A scroll that brings a target under a resting pointer only brightens the ball; the outline grows once the
          // pointer moves onto it (Harlie's brief, 2026-09-28: the page's end carried "Watch the film" under a resting
          // pointer and away again, and its outline blinked on for 400ms).
          setHint(true)
          retarget(null)
        } else retarget(next)
        scrollHit = false
      }
      if (releaseAt) {
        if (now >= releaseAt) setTarget(null)
        else moving = true
      }

      // The ball: exactly on the pointer, stretched a little along a quick movement, smaller while outlining.
      const idle = now - lastT
      if (idle > 40) speed *= Math.exp(-dt * 18)
      if (speed > 1) moving = true
      else speed = 0
      const stretch = reduced ? 0 : Math.min(0.3, speed / 5000)

      let goal = goalBox()
      if (!goal && target) {
        // The target went away (a new page, the header's items changing at the breakpoint): a showing outline fades
        // where it last was, never travelling to the ball.
        const last = lastTarget === target ? lastGoal : null
        target = null
        releaseAt = 0
        delete root.dataset.cursorOutline
        fading = Boolean(last) && presence > 0
        if (fading) {
          frozen = last
          goal = last
        }
      }
      const outlining = Boolean(goal) && !fading
      if (goal && lastGoal && lastTarget === target) {
        // The target itself moved (a scroll, the header gathering into its pill or unfolding into the bar): the
        // outline moves with it rigidly, however far, and only its changes of shape and size go through the springs.
        // It used to be carried only for moves under 60px a frame, so HOME, clicked in the pill, ran ahead of its
        // outline by 50px as the pill unfolded (Harlie's brief, 2026-09-28: the outline never detaches from its target).
        const dx = (goal.left + goal.right - lastGoal.left - lastGoal.right) / 2
        const dy = (goal.top + goal.bottom - lastGoal.top - lastGoal.bottom) / 2
        edges.left.x += dx
        edges.right.x += dx
        edges.top.x += dy
        edges.bottom.x += dy
      }
      lastGoal = goal
      lastTarget = goal ? target : null
      if (!goal) {
        goal = reduced
          ? { left: edges.left.x, top: edges.top.x, right: edges.right.x, bottom: edges.bottom.x, radius: edges.radius.x }
          : { left: px - SEED / 2, right: px + SEED / 2, top: py - SEED / 2, bottom: py + SEED / 2, radius: SEED / 2 }
      }

      // Presence: in quickly; an outline that was let go fades where it is and ends once it is all but gone.
      const presenceGoal = outlining ? 1 : 0
      const rate = reduced ? 16 : fading ? FADE_RATE : outlining ? 14 : 9
      presence += (presenceGoal - presence) * (1 - Math.exp(-dt * rate))
      if (Math.abs(presenceGoal - presence) < (fading && !reduced ? FADE_END : 0.004)) presence = presenceGoal
      else moving = true
      if (fading && presence === 0) {
        // Faded out around its target: the target is let go, and the unseen ring waits in the ball.
        drop()
        goal = { left: edges.left.x, top: edges.top.x, right: edges.right.x, bottom: edges.bottom.x, radius: SEED / 2 }
      }

      if (reduced || (!outlining && presence === 0)) {
        // Reduced motion snaps to the goal (only the fade moves); an unseen ring just waits inside the ball.
        edges.left.x = goal.left
        edges.right.x = goal.right
        edges.top.x = goal.top
        edges.bottom.x = goal.bottom
        edges.radius.x = goal.radius
        for (const s of Object.values(edges)) s.v = 0
      } else {
        // Small substeps keep the springs exact at any frame rate.
        const steps = Math.ceil(dt / (1 / 240))
        const h = dt / Math.max(1, steps)
        const k = (outward: boolean) => EDGE.stiffness * (outward ? EDGE.outward : EDGE.inward)
        for (let i = 0; i < steps; i++) {
          stepSpring(edges.left, goal.left, k(goal.left < edges.left.x), EDGE.ratio, h)
          stepSpring(edges.right, goal.right, k(goal.right > edges.right.x), EDGE.ratio, h)
          stepSpring(edges.top, goal.top, k(goal.top < edges.top.x), EDGE.ratio, h)
          stepSpring(edges.bottom, goal.bottom, k(goal.bottom > edges.bottom.x), EDGE.ratio, h)
          stepSpring(edges.radius, goal.radius, EDGE.stiffness, 1, h)
        }
        if (
          !settled(edges.left, goal.left) ||
          !settled(edges.right, goal.right) ||
          !settled(edges.top, goal.top) ||
          !settled(edges.bottom, goal.bottom) ||
          !settled(edges.radius, goal.radius)
        )
          moving = true
      }

      // A target that is itself moving keeps the loop going.
      if (outlining) {
        const key = `${goal.left.toFixed(1)},${goal.top.toFixed(1)},${goal.right.toFixed(1)},${goal.bottom.toFixed(1)}`
        stillFrames = key === lastRect ? stillFrames + 1 : 0
        lastRect = key
        if (stillFrames < 3) moving = true
        // It may move out from under a still pointer: look again next frame.
        if (stillFrames === 0 && visible) needsHit = true
      }

      if (reduced) press.x = pressGoal
      else {
        stepSpring(press, pressGoal, PRESS.stiffness, PRESS.ratio, dt)
        if (!settled(press, pressGoal)) moving = true
      }

      // Draw. The ball: translate to the pointer, turn to the heading, stretch; press and outline shrink it.
      const size = (1 - 0.3 * press.x) * (1 - 0.22 * presence)
      ball.style.transform =
        `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) rotate(${heading.toFixed(3)}rad) ` +
        `scale(${(size * (1 + stretch)).toFixed(3)}, ${(size * (1 - stretch * 0.45)).toFixed(3)})`
      // The ring: its box, pulled in a little by a press. Fades as it nears the ball's size, so it is born from the
      // ball and disappears into it. Nothing is written while it is unseen.
      const inset = 3 * press.x * presence
      const width = Math.max(0, edges.right.x - edges.left.x - inset * 2)
      const height = Math.max(0, edges.bottom.x - edges.top.x - inset * 2)
      const grown = Math.min(1, Math.max(0, (Math.min(width, height) - SEED) / 18))
      const alpha = presence * (reduced ? 1 : grown)
      if (alpha > 0 || ringShown) {
        ringShown = alpha > 0
        ring.style.transform = `translate3d(${(edges.left.x + inset).toFixed(2)}px, ${(edges.top.x + inset).toFixed(2)}px, 0)`
        ring.style.width = `${width.toFixed(2)}px`
        ring.style.height = `${height.toFixed(2)}px`
        ring.style.borderRadius = `${Math.max(0, edges.radius.x - inset).toFixed(2)}px`
        ring.style.opacity = alpha.toFixed(3)
      }

      if (moving) frame = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        show(false)
        return
      }
      if (!seen) {
        seen = true
        setNative()
      }
      const now = performance.now()
      const x = e.clientX
      const y = e.clientY
      if (visible && lastT) {
        const elapsed = Math.max(1, now - lastT)
        const distance = Math.hypot(x - lastX, y - lastY)
        const instant = (distance / elapsed) * 1000
        speed += (instant - speed) * 0.35
        if (distance > 0.5) heading = Math.atan2(y - lastY, x - lastX)
      } else {
        // Appearing (first move, back from outside the window): the outline starts from here.
        if (!target) snapRingToPointer()
        speed = 0
      }
      lastX = x
      lastY = y
      lastT = now
      px = x
      py = y
      show(!fullscreen && !modalFallback)
      if (e.target !== lastEventTarget) {
        lastEventTarget = e.target
        setTarget(resolve(e.target instanceof Element ? e.target : null))
      }
      kick()
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        show(false)
        return
      }
      if (e.button === 0) {
        pressGoal = 1
        kick()
      }
    }
    const onUp = () => {
      pressGoal = 0
      kick()
    }
    const hide = () => {
      show(false)
      setHint(false)
      setOver(null)
      pressGoal = 0
      lastT = 0
      lastEventTarget = null
      releaseAt = 0
      target = null
      fading = false
      frozen = null
      presence = 0
      delete root.dataset.cursorOutline
      kick()
    }
    const onOut = (e: MouseEvent) => {
      // Leaving the window (or into an embedded player, which draws its own cursor).
      if (!e.relatedTarget) hide()
    }
    const onVisibility = () => {
      if (document.hidden) hide()
    }
    const onScroll = () => {
      // The page moved under a still pointer: look again at what is beneath it (a scroll lets an outline go but never
      // grows one; tick).
      if (!visible) return
      needsHit = true
      scrollHit = true
      lastEventTarget = null
      kick()
    }
    const onTransition = () => {
      if (target) kick()
    }
    // Keyboard focus moved (to or from the target under a still pointer): look again, so the focus ring and the
    // outline are never drawn together.
    const onFocusMove = () => {
      if (!visible) return
      needsHit = true
      lastEventTarget = null
      kick()
    }

    const fullscreenElement = () =>
      document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement || null
    const onFullscreen = () => {
      fullscreen = Boolean(fullscreenElement())
      if (fullscreen) show(false)
      setNative()
      if (!fullscreen) raise()
    }

    const modalOpen = () => {
      try {
        return Boolean(document.querySelector('dialog:modal'))
      } catch {
        return Boolean(document.querySelector('dialog[open]'))
      }
    }
    // A modal dialog (the image and film viewers) enters the top layer above this one: raise the layer over it.
    const dialogs = new MutationObserver((records) => {
      if (!records.some((r) => r.target instanceof HTMLDialogElement)) return
      if (canRaise) raise()
      else {
        modalFallback = modalOpen()
        if (modalFallback) show(false)
        setNative()
      }
      needsHit = true
      lastEventTarget = null
      kick()
    })
    dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
    const onToggle = (e: Event) => {
      // Another popover opening goes above this one too.
      if (e.target !== layer && e.target instanceof HTMLElement && e.target.hasAttribute('popover') && (e as ToggleEvent).newState === 'open') raise()
    }

    rehitRef.current = () => {
      if (!visible) return
      needsHit = true
      lastEventTarget = null
      kick()
    }

    raise()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('blur', hide)
    window.addEventListener('dragstart', hide)
    document.addEventListener('mouseout', onOut)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    document.addEventListener('transitionrun', onTransition, true)
    document.addEventListener('focusin', onFocusMove)
    document.addEventListener('focusout', onFocusMove)
    document.addEventListener('toggle', onToggle, true)
    document.addEventListener('fullscreenchange', onFullscreen)
    document.addEventListener('webkitfullscreenchange', onFullscreen)
    window.addEventListener('resize', kick)
    return () => {
      cancelAnimationFrame(frame)
      dialogs.disconnect()
      rehitRef.current = () => {}
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('blur', hide)
      window.removeEventListener('dragstart', hide)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('scroll', onScroll, true)
      document.removeEventListener('transitionrun', onTransition, true)
      document.removeEventListener('focusin', onFocusMove)
      document.removeEventListener('focusout', onFocusMove)
      document.removeEventListener('toggle', onToggle, true)
      document.removeEventListener('fullscreenchange', onFullscreen)
      document.removeEventListener('webkitfullscreenchange', onFullscreen)
      window.removeEventListener('resize', kick)
      delete root.dataset.cursor
      delete root.dataset.cursorOutline
      delete root.dataset.pointerOver
      try {
        if (layer.matches(':popover-open')) layer.hidePopover()
      } catch {
        /* Already hidden. */
      }
    }
  }, [fine, reduced])

  // A new page can arrive under a pointer that has not moved.
  useEffect(() => {
    rehitRef.current()
  }, [pathname])

  if (!fine) return null
  return (
    <div ref={layerRef} className="custom-cursor" popover="manual" aria-hidden="true" data-reduced={reduced ? '' : undefined}>
      <div ref={ringRef} className="custom-cursor__ring" />
      <div ref={ballRef} className="custom-cursor__ball">
        <span className="custom-cursor__light" />
        <span className="custom-cursor__core" />
      </div>
    </div>
  )
}
