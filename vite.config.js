import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        // 1) Si un path trae #000, reemplázalo
        replaceAttrValues: { "#000": "currentColor", "#000000": "currentColor", black: "currentColor" },
        // 2) Además, agrega fill="currentColor" al <svg>
        svgProps: { fill: "currentColor" },
        icon: true,
      },})

  ],
})

