
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
      timeout: 120000, // Increase timeout for HMR to 2 minutes
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
    exclude: ["uuid"], // Explicitly exclude uuid to prevent it from being processed
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      // Make sure to exclude problematic dependencies
      external: ["uuid"],
    },
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
