// Glow Border — Originkit

"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"

type Props = {
    mode: "standard" | "multi"
    direction: "clockwise" | "anti-clockwise"
    speed: number
    hoverMultiplier: number
    rainbowColors: string[]
    glowColor: string
    tailColor: string
    baseColor: string
    tailLength: number
    dualTails: boolean
    borderWidth: number
    rounded: number
    style?: React.CSSProperties
}

const DEFAULT_RAINBOW = [
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#3B82F6",
    "#6366F1",
    "#A855F7",
]

const DEFAULTS = {
    mode: "standard",
    direction: "clockwise",
    speed: 10,
    hoverMultiplier: 5,
    glowColor: "rgba(255, 255, 255, 1)",
    tailColor: "rgba(255, 255, 255, 0.4)",
    baseColor: "rgba(255, 255, 255, 0.04)",
    tailLength: 60,
    dualTails: true,
    borderWidth: 5,
    rounded: 0,
}

export default function GlowBorder(props: Partial<Props>) {
    const {
        mode = DEFAULTS.mode,
        direction = DEFAULTS.direction,
        speed = DEFAULTS.speed,
        hoverMultiplier = DEFAULTS.hoverMultiplier,
        glowColor = "#00FFE8",
        tailColor = "#00EDFF66",
        baseColor = "rgba(255, 255, 255, 0.04)",
        tailLength = DEFAULTS.tailLength,
        dualTails = DEFAULTS.dualTails,
        borderWidth = DEFAULTS.borderWidth,
        rounded = DEFAULTS.rounded,
        style,
    } = props

    const hostRef = useRef<HTMLDivElement>(null)
    const layerRef = useRef<HTMLDivElement>(null)

    const [box, setBox] = useState({ w: 0, h: 0 })

    const rainbowColors =
        Array.isArray(props.rainbowColors) && props.rainbowColors.length
            ? props.rainbowColors
            : DEFAULT_RAINBOW

    const isRainbow = mode === "multi"

    const live = useRef({ speed, hoverMultiplier, direction })
    useEffect(() => {
        live.current = { speed, hoverMultiplier, direction }
    })

    useEffect(() => {
        const host = hostRef.current
        const layer = layerRef.current
        if (!host || !layer) return

        const sizeLayer = (w: number, h: number) => {
            setBox({ w, h })
            const size = Math.ceil(Math.hypot(w, h)) + 24
            layer.style.width = `${size}px`
            layer.style.height = `${size}px`
            layer.style.top = `calc(50% - ${size / 2}px)`
            layer.style.left = `calc(50% - ${size / 2}px)`
        }
        sizeLayer(host.clientWidth, host.clientHeight)

        let rect = host.getBoundingClientRect()
        const refreshRect = () => {
            rect = host.getBoundingClientRect()
        }
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect
            sizeLayer(cr?.width ?? host.clientWidth, cr?.height ?? host.clientHeight)
            refreshRect()
        })
        ro.observe(host)
        window.addEventListener("scroll", refreshRect, { passive: true })
        window.addEventListener("resize", refreshRect)

        let boost = 1
        let boostTarget = 1
        let rotation = 0

        const onMove = (e: PointerEvent) => {
            const p = live.current
            const inside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom

            boostTarget = inside ? p.hoverMultiplier : 1
        }
        window.addEventListener("pointermove", onMove, { passive: true })

        let raf = 0
        let last = performance.now()

        const frame = (now: number) => {
            const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
            last = now
            const p = live.current

            boost += (boostTarget - boost) * (1 - Math.exp(-dt / 0.12))

            rotation = (rotation + p.speed * 3.6 * boost * dt) % 360
            const flip = p.direction === "clockwise" ? 1 : -1
            layer.style.transform = `scaleX(${flip}) rotate(${rotation}deg)`

            raf = requestAnimationFrame(frame)
        }
        raf = requestAnimationFrame(frame)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            window.removeEventListener("scroll", refreshRect)
            window.removeEventListener("resize", refreshRect)
            window.removeEventListener("pointermove", onMove)
        }
    }, [])

    const radiusPx =
        (Math.max(0, Math.min(100, rounded)) / 100) *
        (Math.min(box.w, box.h) / 2)

    const buildGradient = () => {
        if (isRainbow) {
            return `conic-gradient(from 0deg at 50% 50%, ${rainbowColors.join(", ")}, ${rainbowColors[0]})`
        }

        const span = dualTails ? 180 : 360
        const l = Math.max(
            1,
            (Math.max(0, Math.min(100, tailLength)) / 100) * span * 0.94
        )

        const tip = Math.max(6, l * 0.35)
        const decay = Math.max(8, l * 0.3)

        const comet = (end: number) =>
            [
                `${glowColor} ${end}deg`,
                `${tailColor} ${end + decay}deg`,
                `${baseColor} ${end + decay * 2}deg`,
                `${baseColor} ${end + span - l}deg`,
                `${tailColor} ${end + span - tip}deg`,
            ].join(", ")

        const stops = dualTails
            ? `${comet(0)}, ${comet(180)}, ${glowColor} 360deg`
            : `${comet(0)}, ${glowColor} 360deg`

        return `conic-gradient(from 0deg at 50% 50%, ${stops})`
    }

    return (
        <div
            ref={hostRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 8,
                minHeight: 8,
                boxSizing: "border-box",
                borderRadius: radiusPx,
                padding: Math.max(0, borderWidth),
                overflow: "hidden",

                pointerEvents: "none",

                WebkitMaskImage:
                    "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
                WebkitMaskClip: "content-box, border-box",
                WebkitMaskComposite: "xor",
                maskImage:
                    "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
                maskClip: "content-box, border-box",
                maskComposite: "exclude",
                ...style,
            }}
        >
            <div
                ref={layerRef}
                style={{
                    position: "absolute",

                    top: 0,
                    left: 0,
                    width: "200%",
                    height: "200%",
                    background: buildGradient(),
                    transformOrigin: "center center",
                    willChange: "transform",
                }}
            />
        </div>
    )
}

GlowBorder.displayName = "Glow Border"

GlowBorder.defaultProps = {
    ...DEFAULTS,
    rainbowColors: DEFAULT_RAINBOW,
}
