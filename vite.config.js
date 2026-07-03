import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pookpik_tutor/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      // JavaScript.js is loaded dynamically at runtime, not bundled
      external: []
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // Treat JavaScript.js and Styles.css as static assets (not processed by Vite)
  assetsInclude: ['**/*.css']
})
