
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "27b530cc-768b-4a51-9152-9156fb7ae1d6.lovableproject.com",
      "localhost",
    ]
  },
  preview: {
    port: 8080,
  },
  build: {
    outDir: "dist",
    // Add sourcemap for better debugging
    sourcemap: true,
    // Improve chunking to avoid large bundles
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-tooltip']
        }
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add specific optimizeDeps settings to avoid conflicts
  optimizeDeps: {
    exclude: ['@radix-ui/react-toast'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  // Add proper TypeScript settings
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
