"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const firebaseAuthRoutes_1 = __importDefault(require("./routes/firebaseAuthRoutes"));
const productionClassRoutes_1 = __importDefault(require("./routes/productionClassRoutes"));
const enhancedAssignmentRoutes_1 = __importDefault(require("./routes/enhancedAssignmentRoutes"));
const submissionRoutes_1 = __importDefault(require("./routes/submissionRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const firebase_1 = __importDefault(require("./config/firebase"));
require("./models");
try {
    const isDevelopment = process.env['NODE_ENV'] === 'development';
    const devMode = process.env['DEV_MODE'] === 'true';
    if (isDevelopment && devMode) {
        console.log('Running in development mode - Firebase Admin SDK disabled');
    }
    else {
        firebase_1.default.getInstance().initialize();
    }
}
catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    console.log('Continuing in development mode without Firebase...');
}
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env['CORS_ORIGIN']
].filter((origin) => Boolean(origin));
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/firebase-auth', firebaseAuthRoutes_1.default);
app.use('/api/classes', productionClassRoutes_1.default);
app.use('/api/classes', enhancedAssignmentRoutes_1.default);
app.use('/api/submissions', submissionRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use((err, _req, res, _next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong!'
        }
    });
});
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found'
        }
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map