import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// TestCase attributes interface
export interface TestCaseAttributes {
  id: string;
  assignment_id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  points: number;
  time_limit: number; // in milliseconds
  memory_limit: number; // in MB
  created_at: Date;
  updated_at: Date;
}

// Optional attributes for creation (auto-generated fields)
export interface TestCaseCreationAttributes extends Optional<TestCaseAttributes, 'id' | 'is_hidden' | 'points' | 'time_limit' | 'memory_limit' | 'created_at' | 'updated_at'> {}

// TestCase model class
export class TestCase extends Model<TestCaseAttributes, TestCaseCreationAttributes> implements TestCaseAttributes {
  public id!: string;
  public assignment_id!: string;
  public input!: string;
  public expected_output!: string;
  public is_hidden!: boolean;
  public points!: number;
  public time_limit!: number;
  public memory_limit!: number;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public assignment?: any;
}

// Initialize TestCase model
TestCase.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assignments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    input: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [0, 10000],
          msg: 'Input must be less than 10000 characters'
        }
      }
    },
    expected_output: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [0, 10000],
          msg: 'Expected output must be less than 10000 characters'
        }
      }
    },
    is_hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [0],
          msg: 'Points must be non-negative'
        },
        max: {
          args: [100],
          msg: 'Points must be 100 or less'
        }
      }
    },
    time_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5000, // 5 seconds default
      validate: {
        min: {
          args: [100],
          msg: 'Time limit must be at least 100ms'
        },
        max: {
          args: [30000],
          msg: 'Time limit must be 30 seconds or less'
        }
      }
    },
    memory_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 128, // 128MB default
      validate: {
        min: {
          args: [16],
          msg: 'Memory limit must be at least 16MB'
        },
        max: {
          args: [512],
          msg: 'Memory limit must be 512MB or less'
        }
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'TestCase',
    tableName: 'test_cases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['assignment_id']
      },
      {
        fields: ['assignment_id', 'is_hidden']
      }
    ]
  }
);

export default TestCase;