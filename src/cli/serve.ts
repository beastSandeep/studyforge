import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';

export interface DevServer {
  server: http.Server;
  wss: WebSocketServer;
  port: number;
  close: () => void;
  broadcastReload: () => void;
}

/**
 * Starts a lightweight dev server that serves the generated HTML
 * and injects a WebSocket hot-reload client script.
 */
export function startDevServer(htmlFilePath: string, port = 3000): DevServer {
  const wss = new WebSocketServer({ noServer: true });
  
  const server = http.createServer((req, res) => {
    // Only serve the target HTML file or assets
    if (req.url === '/' || req.url === '/index.html') {
      try {
        if (!fs.existsSync(htmlFilePath)) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('HTML file not generated yet. Please wait...');
          return;
        }

        let html = fs.readFileSync(htmlFilePath, 'utf8');

        // Inject WebSocket reload script before </body>
        const wsScript = `
          <script>
            (function() {
              const ws = new WebSocket('ws://' + window.location.host);
              ws.onmessage = function(event) {
                if (event.data === 'reload') {
                  console.log('File changed. Reloading page...');
                  window.location.reload();
                }
              };
              ws.onclose = function() {
                console.log('Dev server disconnected. Trying to reconnect...');
                setTimeout(() => window.location.reload(), 2000);
              };
            })();
          </script>
        `;
        
        html = html.replace('</body>', `${wsScript}</body>`);

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Internal Server Error: ${err}`);
      }
    } else {
      // Fallback for static assets in the same directory
      const assetPath = path.join(path.dirname(htmlFilePath), req.url || '');
      if (fs.existsSync(assetPath) && fs.statSync(assetPath).isFile()) {
        const ext = path.extname(assetPath);
        const mimeTypes: Record<string, string> = {
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(fs.readFileSync(assetPath));
      } else {
        res.writeHead(404);
        res.end();
      }
    }
  });

  // Handle upgrade to WebSockets
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws: any) => {
      wss.emit('connection', ws, request);
    });
  });

  server.listen(port, () => {
    console.log(`\n🚀 StudyForge preview dev server running at: http://localhost:${port}`);
    console.log(`🔄 Editing your markdown file will hot-reload the browser automatically!`);
  });

  const broadcastReload = () => {
    wss.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('reload');
      }
    });
  };

  const close = () => {
    wss.close();
    server.close();
  };

  return {
    server,
    wss,
    port,
    close,
    broadcastReload
  };
}
