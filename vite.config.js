import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site lives at https://42130834-lgtm.github.io/customer-support-system/
// so every file is served from /customer-support-system/
export default defineConfig({
  plugins: [react()],
  base: '/customer-support-system/',
  server: {
    // npm run dev: kel request la /api byerja3 3al backend (uvicorn 3a port 8000)
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
