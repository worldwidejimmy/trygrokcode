// Simple Express server to serve the built Vite app
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5091;
const BASE_PATH = '/trygrokcode';

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Serve static files from dist directory at the base path
app.use(BASE_PATH, express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - return index.html for any non-static routes
app.use(BASE_PATH, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Fallback for root
app.get('/', (req, res) => {
  res.redirect(BASE_PATH + '/');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`trygrokcode server running on port ${PORT}`);
});
