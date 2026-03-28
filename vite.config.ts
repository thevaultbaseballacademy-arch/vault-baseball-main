import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Production build config — optimized for Capacitor native app
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only use lovable-tagger in development
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
    // Target browsers supported by Capacitor v6+
    target: ["es2020", "chrome89", "safari14", "firefox90"],
    // Suppress chunk warnings — Capacitor bundles are inherently larger
    chunkSizeWarningLimit: 1500,
    // Source maps for production debugging (remove for release builds)
    sourcemap: mode === "development",
    // Minification
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        // Vendor chunk splitting for better caching
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
            return "vendor-react";
          }
          // Supabase
          if (id.includes("@supabase")) {
            return "vendor-supabase";
          }
          // TanStack Query
          if (id.includes("@tanstack")) {
            return "vendor-query";
          }
          // UI libraries
          if (id.includes("framer-motion") || id.includes("lucide-react") ||
              id.includes("class-variance-authority") || id.includes("clsx") ||
              id.includes("tailwind-merge") || id.includes("radix-ui")) {
            return "vendor-ui";
          }
          // Charts
          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }
          // Capacitor
          if (id.includes("@capacitor")) {
            return "vendor-capacitor";
          }
        },
        // Consistent chunk naming
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
}));
