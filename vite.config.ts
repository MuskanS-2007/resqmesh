import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Ensures relative asset paths for seamless deployment on Vercel, Netlify, or GitHub Pages
  plugins: [
    tailwindcss(),
    react()
  ],
})
