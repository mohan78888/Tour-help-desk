import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import compression from 'compression';
import { authMiddleware } from './middleware/auth.js';
import { searchFlights, getFlightDetails, preCachePopularRoutes } from './controllers/flightController.js';
import { chatWithAgent } from './controllers/aiController.js';
import { clerkWebhook } from './controllers/webhookController.js';
import { signup, login, getProfile } from './controllers/authController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Compression & Cache Headers ───────────────────────────────────────────────
app.use(compression());

app.use((req: Request, res: Response, next: NextFunction) => {
  // Add basic cache control for GET requests to static-like endpoints
  if (req.method === 'GET' && !req.path.startsWith('/api/auth') && !req.path.startsWith('/api/user')) {
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 mins
  }
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any local network IP for testing (e.g. 192.168.x.x)
    if (origin.startsWith('http://192.168.') || origin.startsWith('http://10.') || origin.startsWith('http://172.')) {
      return callback(null, true);
    }
    // Allow any netlify.app or vercel.app subdomain
    if (origin.endsWith('.netlify.app') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

// ── Clerk webhook MUST be before express.json() ──────────────────────────────
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), clerkWebhook);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── MongoDB ───────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.warn('⚠️  MONGO_URI not set — database features will not work');
}

const connectDB = async () => {
  if (!MONGO_URI) return;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('⚠️  Server will continue without database (limited functionality)');
  }
};

mongoose.connection.on('disconnected', () => console.log('⚠️  MongoDB disconnected'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

connectDB();

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', authMiddleware, getProfile as any);

// ── User Routes ───────────────────────────────────────────────────────────────
app.get('/api/user/profile', authMiddleware, (req: any, res: Response) => {
  res.json({ message: 'Secure Profile Data', userId: req.auth?.userId });
});

// ── Flight Routes ─────────────────────────────────────────────────────────────
app.post('/api/flights/search', searchFlights);
app.get('/api/flights/:id', getFlightDetails);

// ── AI Routes ─────────────────────────────────────────────────────────────────
app.post('/api/ai/chat', chatWithAgent);

// ── Health / Status ───────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'Backend is running',
    timestamp: new Date().toISOString(),
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.name || 'unknown',
    }
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// IMPORTANT: Must have 4 params for Express to treat it as error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error:', err);
  // Don't expose stack traces in production
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  
  // Pre-cache popular routes in the background
  preCachePopularRoutes().catch(err => console.error('Error pre-caching routes:', err));
});
