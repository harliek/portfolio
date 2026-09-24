import { createReadStream, existsSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'

/**
 * Earlier creative-portfolio URLs and where they live now. The same rules are
 * in netlify.toml and public/_redirects for production.
 */
const CREATIVE_REDIRECTS: Record<string, string> = {
  '/art': '/creative/art',
  '/film': '/creative/films',
  '/films': '/creative/films',
  '/creative/film': '/creative/films',
}

/**
 * The restored creative portfolio is the original static build, relocated to
 * /creative/ (public/creative: its own index.html, assets and media). It uses
 * client-side routes (/creative/films, /creative/art, /creative/about), so its
 * page paths must return its own index.html rather than this app's. Files
 * under /creative/ are served as usual. Mirrors the production rules.
 */
function creativeSite(): Plugin {
  let publicDir = ''
  let outDir = ''

  const middleware =
    (siteRoot: () => string): Connect.NextHandleFunction =>
    (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next()
      const url = new URL(req.url ?? '/', 'http://localhost')
      let pathname: string
      try {
        pathname = decodeURIComponent(url.pathname)
      } catch {
        return next()
      }
      const bare = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

      const redirect = CREATIVE_REDIRECTS[bare]
      if (redirect) {
        // Temporary in development so browsers do not cache it.
        res.statusCode = 302
        res.setHeader('Location', redirect + url.search)
        res.end()
        return
      }

      // The original creative page declares no icon, so browsers ask for
      // /favicon.ico. Production answers with the SPA fallback (no error);
      // answer with no content here instead of a 404 console error.
      if (bare === '/favicon.ico' && !existsSync(join(siteRoot(), 'favicon.ico'))) {
        res.statusCode = 204
        res.end()
        return
      }

      const isPage =
        bare === '/creative' || bare === '/creative/index.html' || (bare.startsWith('/creative/') && !extname(bare))
      if (!isPage) return next()
      const file = join(siteRoot(), 'creative', 'index.html')
      if (!existsSync(file)) return next()
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache')
      if (req.method === 'HEAD') {
        res.end()
        return
      }
      createReadStream(file).pipe(res)
    }

  return {
    name: 'creative-site',
    configResolved(config) {
      publicDir = config.publicDir
      outDir = resolve(config.root, config.build.outDir)
    },
    // Registered before Vite's own middleware (SPA fallback, HTML transform).
    configureServer(server) {
      server.middlewares.use(middleware(() => publicDir))
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware(() => outDir))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), creativeSite()],
  server: {
    // Media working files (frames, renders, transcript work) are large and
    // irrelevant to the app; keep the dev watcher away from them.
    watch: { ignored: ['**/.media-cache/**', '**/tests/screenshots/**'] },
  },
  optimizeDeps: { entries: ['index.html'] },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 400,
    rolldownOptions: {
      output: {
        // The framework (React, React DOM, React Router: about 70% of the
        // entry) in its own chunk. Every route needs it, so nothing extra is
        // downloaded, it is requested in parallel with the app entry, and it
        // stays cached across content deploys. The homepage gallery is only
        // about 5% of the entry and stays eager so the homepage has no extra
        // round trip.
        codeSplitting: {
          groups: [{ name: 'framework', test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ }],
        },
      },
    },
  },
  preview: {
    port: 4173,
  },
})
