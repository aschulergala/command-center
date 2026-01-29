import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

/**
 * The SDK's ESM bundle does `import S from "uuid"` (CJS default interop),
 * but uuid v10 is pure ESM without a default export. This plugin patches
 * the SDK's import to use only named imports.
 */
function patchSdkUuidImport(): Plugin {
  return {
    name: 'patch-sdk-uuid',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('@gala-chain/launchpad-sdk') && id.endsWith('.js')) {
        // Replace `import S from "uuid"` or `import S,{...}from"uuid"` patterns
        // The bundled SDK uses minified: `import S,{v4 as X}from"uuid"`
        // We convert to: `import * as S from"uuid"; import {v4 as X}from"uuid"`
        const patched = code.replace(
          /import\s+(\w+)\s*,\s*\{([^}]+)\}\s*from\s*["']uuid["']/g,
          'import * as $1 from "uuid";import{$2}from"uuid"',
        );
        if (patched !== code) {
          return { code: patched, map: null };
        }
        // Also handle standalone default import
        const patched2 = code.replace(
          /import\s+(\w+)\s+from\s*["']uuid["']/g,
          'import * as $1 from "uuid"',
        );
        if (patched2 !== code) {
          return { code: patched2, map: null };
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [patchSdkUuidImport(), vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress Node.js module externalization warnings from SDK transitive deps
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
  optimizeDeps: {
    include: ['@gala-chain/launchpad-sdk', 'uuid'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
