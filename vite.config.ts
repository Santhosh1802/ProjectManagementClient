import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
// https://vite.dev/config/
export default defineConfig({
  define: {
    global: "window",
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "logo.png"
      ],
      manifest: {
        name: "DevFlow: Plan the work. Move it forward.",
        short_name: "DevFlow",
        description: "Plan the work. Move it forward.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts"
            if (id.includes("@tanstack") || id.includes("@reduxjs") || id.includes("react-redux") || id.includes("redux-persist")) return "vendor-state"
            if (id.includes("@stomp") || id.includes("sockjs-client")) return "vendor-realtime"
            if (id.includes("lucide-react") || id.includes("@base-ui")) return "vendor-ui"
            if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) return "vendor-react"
          }
        },
      },
    },
  },
  server: {
    port: 4321,
    strictPort: true,
  },
  // @ts-expect-error vitest config option
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    testTimeout: 30000,
    maxWorkers: 4,
  },
})
