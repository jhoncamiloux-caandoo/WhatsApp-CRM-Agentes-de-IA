import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// O build vai direto para a LP: dist/demo/demo.js + demo.css, carregados sob demanda pelo index.html.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: '../dist/demo',
    emptyOutDir: true,
    assetsDir: '.',
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        entryFileNames: 'demo.js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: (info) => (info.names?.[0]?.endsWith('.css') ? 'demo.css' : '[name]-[hash][extname]'),
      },
    },
  },
})
