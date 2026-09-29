import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './src/config/db.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { User } from './src/models/index.js';
import { seedDatabase } from './src/seed/seedData.js';

import fs from 'fs';
import os from 'os';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import caseRoutes from './src/routes/caseRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import reassignmentRoutes from './src/routes/reassignmentRoutes.js';
import escalationRoutes from './src/routes/escalationRoutes.js';
import departmentRoutes from './src/routes/departmentRoutes.js';
import disasterRoutes from './src/routes/disasterRoutes.js';
import resourceRoutes from './src/routes/resourceRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Network interfaces discovery
const getNetworkIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
};

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'RESQ-GRID Unified Public Service & Disaster Coordination Engine',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reassignment', reassignmentRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler for API routes
app.use(errorHandler);

// Production Static Serving: Serve built React frontend from backend on 0.0.0.0
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // Check if seeding is needed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[STARTUP] Empty database detected. Running automatic initial demo seed...');
      await seedDatabase();
    } else {
      console.log(`[STARTUP] Database active with ${userCount} existing users.`);
    }

    app.listen(PORT, '0.0.0.0', () => {
      const ips = getNetworkIPs();
      console.log(`==================================================`);
      console.log(`  RESQ-GRID HOSTED & ACCESSIBLE ON ALL SYSTEMS!`);
      console.log(`  --------------------------------------------------`);
      console.log(`  Local Machine URL:   http://localhost:${PORT}`);
      ips.forEach(ip => {
        console.log(`  LAN / Wi-Fi Access:  http://${ip}:${PORT}  (All Devices)`);
        console.log(`  Vite Dev Server:     http://${ip}:5173  (HMR Live UI)`);
      });
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
};

startServer();
