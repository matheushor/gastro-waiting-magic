
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      timeout: 240000, // Increase timeout for HMR to 4 minutes
    },
    allowedHosts: [
      "27b530cc-768b-4a51-9152-9156fb7ae1d6.lovableproject.com",
      "localhost",
    ],
  },
  preview: {
    port: 8080,
  },
  optimizeDeps: {
    force: true, // Force dependency optimization
    exclude: ["uuid"], // Explicitly exclude uuid to prevent it from being processed
    include: ["react", "react-dom"], // Include critical dependencies but exclude problematic ones
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      // Make sure to exclude problematic dependencies
      external: ["uuid"],
    },
    sourcemap: true,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
