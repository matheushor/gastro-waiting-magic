
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
    include: [
      "react", 
      "react-dom", 
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "recharts",
      "@radix-ui/react-toast",
      "@radix-ui/react-accordion",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-slot",
      "d3-scale",
      "d3-shape",
      "d3-path",
      "d3-time",
      "prop-types"
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Improved timeout for esbuild
      keepNames: true,
      treeShaking: true,
      target: 'es2020',
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      external: ["uuid"],
    },
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true, // Add this to help with mixed ES modules
    }
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'es2020',
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
    preserveSymlinks: true, // Help with module resolution
    dedupe: ['react', 'react-dom'], // Deduplicate React to avoid multiple instances
  }
}));
