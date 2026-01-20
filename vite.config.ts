import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // For Vercel deployment, use root base path '/'
  // For GitHub Pages, change base to '/shopos/' in production
  const isProd = mode === 'production'
  
  return {
    plugins: [react()],
    // Vercel: use '/' (root path)
    base: '/',
    build: { outDir: 'dist', assetsDir: 'assets' },
    assetsInclude: ['**/*.svg', '**/*.woff2', '**/*.woff', '**/*.ttf'],
    server: {
      host: true
    }
  }
})
