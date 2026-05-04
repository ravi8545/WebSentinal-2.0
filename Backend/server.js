require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const connectDB = require('./src/config/db');
const configurePassport = require('./src/config/passport');
const errorHandler = require('./src/middleware/errorHandler');
const { startMonitor, stopMonitor } = require('./src/services/monitor');
const alertService = require('./src/services/alertService');

const authRoutes = require('./src/routes/authRoutes');
const websiteRoutes = require('./src/routes/websiteRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const logRoutes = require('./src/routes/logRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const integrationRoutes = require('./src/routes/integrationRoutes');

const app = express();

// Build CORS allowlist from env (comma-separated) + sensible defaults.
// Also allow any *.vercel.app preview deployment.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const defaultOrigins = [
  process.env.FRONTEND_URL,
  'https://web-sentinal-2-0.vercel.app',
  'http://localhost:5173',
].filter(Boolean);

const corsAllowlist = Array.from(new Set([...allowedOrigins, ...defaultOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server) with no Origin header.
    if (!origin) return callback(null, true);
    if (corsAllowlist.includes(origin)) return callback(null, true);
    // Allow any Vercel preview deployment for this project.
    if (/\.vercel\.app$/.test(new URL(origin).hostname)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

configurePassport();
app.use(passport.initialize());

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'websentinal-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/integrations', integrationRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[WebSentinal API] listening on http://localhost:${PORT}`);
      startMonitor();
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

// Flush pending grouped alerts on shutdown so the last digest isn't lost.
async function shutdown(signal) {
  console.log(`[server] received ${signal}, flushing alerts and exiting...`);
  try {
    stopMonitor();
    await alertService.flushAll();
  } catch (e) {
    console.error('[server] shutdown error:', e.message);
  } finally {
    process.exit(0);
  }
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
