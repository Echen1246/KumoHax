import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET || '';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: devProxyTarget
        ? {
            '/api': {
              target: devProxyTarget,
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },
    preview: {
      port: 5173,
      strictPort: true,
    },
  };
}); 