/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import firebaseAuthRoutes from './routes/firebaseAuthRoutes';
import productionClassRoutes from './routes/productionClassRoutes';
import enhancedAssignmentRoutes from './routes/enhancedAssignmentRoutes';
import submissionRoutes from './routes/submissionRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import FirebaseAdmin from './config/firebase';
// Import models to ensure associations are loaded
import './models';

// Initialize Firebase Admin SDK
try {
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  const devMode = process.env['DEV_MODE'] === 'true';
  
  if (isDevelopment && devMode) {
    console.log('Running in development mode - Firebase Admin SDK disabled');
  } else {
    FirebaseAdmin.getInstance().initialize();
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  console.log('Continuing in development mode without Firebase...');
}

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env['CORS_ORIGIN']
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Routes
app.use('/api/auth', authRoutes); // Legacy auth routes
app.use('/api/firebase-auth', firebaseAuthRoutes); // New Firebase auth routes
app.use('/api/classes', productionClassRoutes);
app.use('/api/classes', enhancedAssignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong!'
    }
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found'
    }
  });
});

export default app;