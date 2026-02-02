import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// ExecutionResult attributes interface
export interface ExecutionResultAttributes {
  id: string;
  submission_id: string;
  test_case_id: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'timeout' | 'memory_exceeded' | 'runtime_error' | 'compilation_error';
  actual_output: string | null;
  error_message: string | null;
  execution_time: number | null; // in milliseconds
  memory_used: number | null; // in MB
  points_earned: number;
  created_at: Date;
  updated_at: Date;
}

// Optional attributes for creation (auto-generated fields)
export interface ExecutionResultCreationAttributes extends Optional<ExecutionResultAttributes, 'id' | 'actual_output' | 'error_message' | 'execution_time' | 'memory_used' | 'points_earned' | 'created_at' | 'updated_at'> {}

// ExecutionResult model class
export class ExecutionResult extends Model<ExecutionResultAttributes, ExecutionResultCreationAttributes> implements ExecutionResultAttributes {
  public id!: string;
  public submission_id!: string;
  public test_case_id!: string;
  public status!: 'pending' | 'running' | 'passed' | 'failed' | 'timeout' | 'memory_exceeded' | 'runtime_error' | 'compilation_error';
  public actual_output!: string | null;
  public error_message!: string | null;
  public execution_time!: number | null;
  public memory_used!: number | null;
  public points_earned!: number;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public submission?: any;
  public testCase?: any;
}

// Initialize ExecutionResult model
ExecutionResult.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    submission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'submissions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    test_case_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'test_cases',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('pending', 'running', 'passed', 'failed', 'timeout', 'memory_exceeded', 'runtime_error', 'compilation_error'),
      allowNull: false,
      defaultValue: 'pending'
    },
    actual_output: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    execution_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Execution time must be non-negative'
        }
      }
    },
    memory_used: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Memory used must be non-negative'
        }
      }
    },
    points_earned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Points earned must be non-negative'
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
    modelName: 'ExecutionResult',
    tableName: 'execution_results',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['submission_id', 'test_case_id'],
        name: 'execution_results_submission_testcase_unique'
      },
      {
        fields: ['submission_id']
      },
      {
        fields: ['test_case_id']
      },
      {
        fields: ['status']
      }
    ]
  }
);

export default ExecutionResult;