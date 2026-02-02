import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL,
  NODE_ENV = 'development'
} = process.env;

// Create Sequelize instance
export const sequelize = DATABASE_URL 
  ? new Sequelize(DATABASE_URL, {
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
  : new Sequelize({
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

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(`Database connection established successfully (${NODE_ENV})`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Sync database (for development only)
export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database synchronization failed:', error);
    throw error;
  }
};

export default sequelize;