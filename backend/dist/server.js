"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./config/database");
const app_1 = __importDefault(require("./app"));
const PORT = process.env['PORT'] || 3001;
const initializeDatabase = async () => {
    try {
        await database_1.sequelize.authenticate();
        console.log('Database connection established successfully');
        if (process.env['NODE_ENV'] !== 'production') {
            await database_1.sequelize.sync({ alter: true });
            console.log('Database models synchronized');
        }
        else {
            await database_1.sequelize.sync();
            console.log('Database models synchronized for production');
        }
    }
    catch (error) {
        console.error('Unable to connect to database:', error);
        process.exit(1);
    }
};
const startServer = async () => {
    try {
        await initializeDatabase();
        app_1.default.listen(PORT, () => {
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app_1.default;
//# sourceMappingURL=server.js.map