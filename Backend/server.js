require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const connectDB = require('./src/config/db');
const configurePassport = require('./src/config/passport');
const errorHandler = require('./src/middleware/errorHandler');
const { startMonitor } = require('./src/services/monitor');

const authRoutes = require('./src/routes/authRoutes');
const websiteRoutes = require('./src/routes/websiteRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const logRoutes = require('./src/routes/logRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const integrationRoutes = require('./src/routes/integrationRoutes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
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
