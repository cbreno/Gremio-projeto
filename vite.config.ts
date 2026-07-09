import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// PWA "Grêmio Tenente Breno" — instalável (Adicionar à Tela de Início) no iOS/Android.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["helicoptero.jpg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Grêmio Tenente Breno",
        short_name: "Grêmio TB",
        description: "Vendas do grêmio do quartel — compre pelo celular.",
        lang: "pt-BR",
        theme_color: "#353B25",
        background_color: "#E4DECF",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,woff2}"],
        navigateFallbackDenylist: [/^\/auth/],
      },
    }),
  ],
});
