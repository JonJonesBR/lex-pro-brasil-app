
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        proxy: {
          // Generic proxy for all DataJud API endpoints starting with /api_publica_
          '/api_publica_': {
            target: 'https://api-publica.datajud.cnj.jus.br',
            changeOrigin: true,
            rewrite: (path) => path, // Path from frontend (e.g., /api_publica_tjsp/_search) is now directly usable
            configure: (proxy, options) => {
              proxy.on('proxyReq', (proxyReq, req, res) => {
                // console.log(`[Proxy] Forwarding request from ${req.originalUrl} to ${options.target}${proxyReq.path}`);
              });
              proxy.on('error', (err, req, res) => {
                console.error('[Proxy] Error:', err);
                if (res && typeof res.writeHead === 'function' && typeof res.end === 'function') {
                    res.writeHead?.(500, {
                        'Content-Type': 'text/plain',
                    });
                    res.end?.('Something went wrong with the proxy. ' + err.message);
                } else if (res && typeof res.end === 'function') {
                     res.end?.();
                }
              });
            }
          }
        }
      }
    };
});
