import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/auth": { target: "http://backend:3001", changeOrigin: true },
      "/incidents": { target: "http://backend:3001", changeOrigin: true },
      "/share": { target: "http://backend:3001", changeOrigin: true },
      "/health": { target: "http://backend:3001", changeOrigin: true },
      "/stats": { target: "http://backend:3001", changeOrigin: true },
    },
  },
});


