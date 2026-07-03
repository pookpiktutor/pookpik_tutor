import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pookpik_tutor/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
