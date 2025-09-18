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
        // 1) If a path uses #000, replace it
        replaceAttrValues: { "#000": "currentColor", "#000000": "currentColor", black: "currentColor" },
        // 2) Also add fill="currentColor" to the <svg>
        svgProps: { fill: "currentColor" },
        icon: true,
      },})

  ],
})
