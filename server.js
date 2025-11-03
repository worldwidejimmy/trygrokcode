// Simple Express server to serve the built Vite app
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5090;
const BASE_PATH = '/trygrokcode';
const DIST_PATH = path.join(__dirname, 'dist');
const INDEX_FILE = path.join(DIST_PATH, 'index.html');

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Serve assets for requests that arrive with or without the base prefix
app.use(express.static(DIST_PATH, { redirect: false, index: false }));
app.use(BASE_PATH, express.static(DIST_PATH, { redirect: false }));

// Serve SPA entry at root so health checks see hashed asset references
app.get('/', (req, res) => {
  res.sendFile(INDEX_FILE);
});

// Serve SPA entry for any client-side route under the base path
app.get(new RegExp(`^${BASE_PATH}(?:/.*)?$`), (req, res) => {
  res.sendFile(INDEX_FILE);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`trygrokcode server running on port ${PORT}`);
});
