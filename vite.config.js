import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site lives at https://42130834-lgtm.github.io/customer-support-system/
// so every file is served from /customer-support-system/
export default defineConfig({
  plugins: [react()],
  base: '/customer-support-system/',
})
