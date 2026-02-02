import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Submission attributes interface
export interface SubmissionAttributes {
  id: string;
  assignment_id: string;
  student_id: string;
  code: string;
  language: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_points: number;
  points_earned: number;
  compilation_error: string | null;
  submitted_at: Date;
  updated_at: Date;
}

// Optional attributes for creation (auto-generated fields)
export interface SubmissionCreationAttributes extends Optional<SubmissionAttributes, 'id' | 'language' | 'status' | 'total_points' | 'points_earned' | 'compilation_error' | 'submitted_at' | 'updated_at'> {}

// Submission model class
export class Submission extends Model<SubmissionAttributes, SubmissionCreationAttributes> implements SubmissionAttributes {
  public id!: string;
  public assignment_id!: string;
  public student_id!: string;
  public code!: string;
  public language!: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
  public status!: 'pending' | 'running' | 'completed' | 'failed';
  public total_points!: number;
  public points_earned!: number;
  public compilation_error!: string | null;
  public submitted_at!: Date;
  public updated_at!: Date;

  // Associations (will be populated by associations)
  public assignment?: any;
  public student?: any;
  public executionResults?: any[];
}

// Initialize Submission model
Submission.init(
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
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [0, 50000],
          msg: 'Code must be less than 50000 characters'
        }
      }
    },
    language: {
      type: DataTypes.ENUM('c', 'cpp', 'java', 'python', 'javascript'),
      allowNull: false,
      defaultValue: 'c'
    },
    status: {
      type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    points_earned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    compilation_error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submitted_at: {
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
    modelName: 'Submission',
    tableName: 'submissions',
    timestamps: true,
    createdAt: 'submitted_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['assignment_id']
      },
      {
        fields: ['student_id']
      },
      {
        fields: ['submitted_at']
      },
      {
        fields: ['assignment_id', 'student_id']
      }
    ]
  }
);

export default Submission;