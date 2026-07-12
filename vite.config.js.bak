import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// Plugin to copy JavaScript.js into dist/src/ after build
function copyJavaScriptPlugin() {
  return {
    name: 'copy-javascript-js',
    closeBundle() {
      try {
        mkdirSync(resolve(__dirname, 'dist/src'), { recursive: true });
        copyFileSync(
          resolve(__dirname, 'src/JavaScript.js'),
          resolve(__dirname, 'dist/src/JavaScript.js')
        );
        console.log('✓ Copied src/JavaScript.js → dist/src/JavaScript.js');
        copyFileSync(
          resolve(__dirname, 'src/Styles.css'),
          resolve(__dirname, 'dist/src/Styles.css')
        );
        console.log('✓ Copied src/Styles.css → dist/src/Styles.css');
      } catch(e) {
        console.warn('Could not copy static files:', e.message);
      }
    }
  };
}

export default defineConfig({
  base: '/pookpik_tutor/',
  plugins: [copyJavaScriptPlugin()],
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
  },
  // Treat Styles.css as static asset (not processed by Vite)
  assetsInclude: ['**/*.css']
})
