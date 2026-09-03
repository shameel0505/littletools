import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import http from 'http'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'tunnel-proxy',
      configureServer(server) {
        server.middlewares.use('/tunnel-api', (req, res) => {
          let targetUrl = req.headers['x-target-url'];
          
          if (!targetUrl && req.url.includes('targetUrl=')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            targetUrl = url.searchParams.get('targetUrl');
            url.searchParams.delete('targetUrl');
            req.url = url.pathname + url.search;
          }

          if (!targetUrl) {
            res.statusCode = 400;
            res.end('Missing target url');
            return;
          }
          
          const client = targetUrl.startsWith('https') ? https : http;
          
          // Remove internal vite headers
          const headers = { ...req.headers };
          delete headers['x-target-url'];
          delete headers['host'];
          delete headers['referer'];
          
          const options = {
            method: req.method,
            agent: false, // Disables Node.js connection pooling to fix Localtunnel socket hangs
            rejectUnauthorized: false, // Bypasses ESET Antivirus SSL interception
            headers: {
              ...headers,
              'Connection': 'close', // Prevents Localtunnel Keep-Alive connection drops
              'User-Agent': 'curl/7.68.0', // Bypasses Cloudflare
              'Bypass-Tunnel-Reminder': 'true', // Bypasses Localtunnel
              'ngrok-skip-browser-warning': 'true' // Bypasses Ngrok
            }
          };
          
          const proxyReq = client.request(targetUrl + req.url, options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          });
          
          proxyReq.on('error', (err) => {
            console.error('Proxy error:', err);
            res.statusCode = 500;
            res.end('Proxy error');
          });
          
          if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
            proxyReq.end();
          } else {
            req.pipe(proxyReq);
          }
        });
      }
    }
  ],
  optimizeDeps: {
    exclude: ['@huggingface/transformers']
  }
})
