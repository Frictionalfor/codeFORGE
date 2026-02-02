import { sequelize } from './config/database';
import app from './app';

// Fix TS4111: Use bracket notation for index signature access
const PORT = process.env['PORT'] || 3001;

// Initialize database connection
const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync models in development
    if (process.env['NODE_ENV'] !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized');
    } else {
      // In production, just sync without force
      await sequelize.sync();
      console.log('Database models synchronized for production');
    }
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 CodeForge Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`🔥 Firebase Project: ${process.env['FIREBASE_PROJECT_ID'] || 'Not configured'}`);
      console.log(`\n🌐 API Endpoints:`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   Classes: http://localhost:${PORT}/api/classes`);
      console.log(`   Dashboard: http://localhost:${PORT}/api/dashboard`);
      console.log(`\n✨ Features:`);
      console.log(`   🔐 Firebase Authentication`);
      console.log(`   📝 Assignment Management`);
      console.log(`   💻 Code Execution Engine`);
      console.log(`   📊 Real-time Dashboard`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;