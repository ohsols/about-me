import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Proxy for Discord Presence (Lanyard)
app.get('/api/discord/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.lanyard.rest/v1/users/${id}`, {
      timeout: 15000,
      validateStatus: (status) => status < 500 // Don't throw for 404s
    });
    
    if (response.status === 404) {
      return res.json({ success: false, error: 'User not found in Lanyard' });
    }
    
    res.json(response.data);
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.error('[Discord Proxy Error] Timeout exceeded');
      return res.status(504).json({ success: false, error: 'Gateway Timeout' });
    }
    console.error('[Discord Proxy Error]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch presence' });
  }
});

// Request logger
app.use((req, res, next) => {
  const isApi = req.url.startsWith('/api');
  if (isApi) {
    console.log(`[Server] ${new Date().toISOString()} API REQUEST: ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Live View Count and Active Visitors tracking
let totalViews = 1250;
const activeSessions = new Map<string, number>();

setInterval(() => {
  const now = Date.now();
  for (const [id, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > 15000) {
      activeSessions.delete(id);
    }
  }
}, 5000);

app.post('/api/views/heartbeat', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    const isNew = !activeSessions.has(sessionId);
    if (isNew) {
      totalViews += 1;
    }
    activeSessions.set(sessionId, Date.now());
  }
  res.json({
    totalViews,
    activeVisitors: Math.max(1, activeSessions.size)
  });
});

app.get('/api/views', (req, res) => {
  res.json({
    totalViews,
    activeVisitors: Math.max(1, activeSessions.size)
  });
});

// Discord verification
app.get('/.well-known/discord', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('dh=f74ec827e58e3b50e2e2e7e251b0098aadfb36ac');
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  console.log(`Starting server in ${isProd ? 'production' : 'development'} mode...`);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // SPA fallback
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Basic error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
}

startServer();