declare module 'threejs-components/build/backgrounds/liquid1.min.js' {
  interface Disposable { dispose(): void }
  interface LiquidApp {
    loadImage(url: string): Promise<void>
    setRain(enabled: boolean): void
    dispose(): void
    liquidPlane: {
      geometry: Disposable
      material: Disposable & { metalness: number; roughness: number; map?: Disposable; envMap?: Disposable }
      uniforms: { displacementScale: { value: number } }
    }
  }
  export default function LiquidBackground(canvas: HTMLCanvasElement): LiquidApp
}
