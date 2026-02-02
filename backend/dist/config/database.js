"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabase = exports.connectDatabase = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DATABASE_URL, NODE_ENV = 'development' } = process.env;
exports.sequelize = DATABASE_URL
    ? new sequelize_1.Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 20,
            min: 5,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    })
    : new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: './dev-database.sqlite',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
const connectDatabase = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log(`Database connection established successfully (${NODE_ENV})`);
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const syncDatabase = async (force = false) => {
    try {
        await exports.sequelize.sync({ force });
        console.log('Database synchronized successfully');
    }
    catch (error) {
        console.error('Database synchronization failed:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
exports.default = exports.sequelize;
//# sourceMappingURL=database.js.map