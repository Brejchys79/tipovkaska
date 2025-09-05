import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',         // kořen projektu
  publicDir: 'public',
  build: { outDir: 'dist' }
})