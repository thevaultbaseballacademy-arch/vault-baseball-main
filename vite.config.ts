import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && (() => {
      try {
        const { componentTagger } = require("lovable-tagger");
        return componentTagger();
      } catch { return null; }
    })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: ["es2020", "chrome89", "safari14", "firefox90"],
    chunkSizeWarningLimit: 1500,
    sourcemap: mode === "development",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
            return "vendor-react";
          }
          if (id.includes("@supabase")) {
            return "vendor-supabase";
          }
          if (id.includes("@tanstack")) {
            return "vendor-query";
          }
          if (id.includes("framer-motion") || id.includes("lucide-react") ||
              id.includes("class-variance-authority") || id.includes("clsx") ||
              id.includes("tailwind-merge") || id.includes("radix-ui")) {
            return "vendor-ui";
          }
          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }
          if (id.includes("@capacitor")) {
            return "vendor-capacitor";
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
}));
