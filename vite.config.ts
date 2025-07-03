import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Use default React plugin instead of SWC for WebContainer compatibility
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: []
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize for WebContainer environment
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@swc/core']
  },
  // Reduce build warnings
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress certain warnings that are common in development
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.code === 'SOURCEMAP_ERROR') return;
        warn(warning);
      }
    }
  },
  // Configure for better WebContainer compatibility
  define: {
    global: 'globalThis',
  },
  esbuild: {
    // Use esbuild instead of SWC for better WebContainer support
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}));