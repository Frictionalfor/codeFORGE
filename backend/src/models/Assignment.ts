import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Assignment attributes interface
export interface AssignmentAttributes {
  id: string;
  class_id: string;
  title: string;
  problem_description: string;
  language: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
  time_limit: number; // in milliseconds
  memory_limit: number; // in MB
  total_points: number;
  due_date: Date | null; // Assignment deadline
  allow_late_submission: boolean; // Whether to allow submissions after due date
  late_penalty_per_day: number; // Percentage penalty per day late (0-100)
  max_late_days: number; // Maximum days late allowed (0 = no late submissions)
  is_published: boolean; // Whether assignment is visible to students
  published_at: Date | null; // When assignment was published
  created_at: Date;
  updated_at: Date;
}

// Optional attributes for creation (auto-generated fields)
export interface AssignmentCreationAttributes extends Optional<AssignmentAttributes, 'id' | 'language' | 'time_limit' | 'memory_limit' | 'total_points' | 'due_date' | 'allow_late_submission' | 'late_penalty_per_day' | 'max_late_days' | 'is_published' | 'published_at' | 'created_at' | 'updated_at'> {}

// Assignment model class
export class Assignment extends Model<AssignmentAttributes, AssignmentCreationAttributes> implements AssignmentAttributes {
  public id!: string;
  public class_id!: string;
  public title!: string;
  public problem_description!: string;
  public language!: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
  public time_limit!: number;
  public memory_limit!: number;
  public total_points!: number;
  public due_date!: Date | null;
  public allow_late_submission!: boolean;
  public late_penalty_per_day!: number;
  public max_late_days!: number;
  public is_published!: boolean;
  public published_at!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations (will be populated by associations)
  public class?: any;
  public submissions?: any[];
  public testCases?: any[];

  // Helper methods
  public isOverdue(): boolean {
    if (!this.due_date) return false;
    return new Date() > this.due_date;
  }

  public getDaysLate(): number {
    if (!this.due_date || !this.isOverdue()) return 0;
    const diffTime = Math.abs(new Date().getTime() - this.due_date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public canSubmit(): boolean {
    if (!this.is_published) return false;
    if (!this.due_date) return true;
    if (!this.isOverdue()) return true;
    return this.allow_late_submission && this.getDaysLate() <= this.max_late_days;
  }

  public getLatePenalty(): number {
    if (!this.isOverdue() || !this.allow_late_submission) return 0;
    const daysLate = this.getDaysLate();
    if (daysLate > this.max_late_days) return 100; // Full penalty if beyond max late days
    return Math.min(daysLate * this.late_penalty_per_day, 100);
  }
}

// Initialize Assignment model
Assignment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Assignment title must be between 1 and 255 characters'
        },
        notEmpty: {
          msg: 'Assignment title cannot be empty'
        }
      }
    },
    problem_description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [1, 10000],
          msg: 'Problem description must be between 1 and 10000 characters'
        },
        notEmpty: {
          msg: 'Problem description cannot be empty'
        }
      }
    },
    language: {
      type: DataTypes.ENUM('c', 'cpp', 'java', 'python', 'javascript'),
      allowNull: false,
      defaultValue: 'c'
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
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
      validate: {
        min: {
          args: [1],
          msg: 'Total points must be at least 1'
        },
        max: {
          args: [1000],
          msg: 'Total points must be 1000 or less'
        }
      }
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterNow(value: Date) {
          if (value && value <= new Date()) {
            throw new Error('Due date must be in the future');
          }
        }
      }
    },
    allow_late_submission: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    late_penalty_per_day: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10.0, // 10% penalty per day
      validate: {
        min: {
          args: [0],
          msg: 'Late penalty must be 0 or greater'
        },
        max: {
          args: [100],
          msg: 'Late penalty cannot exceed 100%'
        }
      }
    },
    max_late_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // No late submissions by default
      validate: {
        min: {
          args: [0],
          msg: 'Max late days must be 0 or greater'
        },
        max: {
          args: [30],
          msg: 'Max late days cannot exceed 30'
        }
      }
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    modelName: 'Assignment',
    tableName: 'assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['class_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['title']
      },
      {
        fields: ['due_date']
      },
      {
        fields: ['is_published']
      }
    ],
    hooks: {
      beforeValidate: (assignment: Assignment) => {
        // Trim whitespace from string fields
        if (assignment.title) {
          assignment.title = assignment.title.trim();
        }
        if (assignment.problem_description) {
          assignment.problem_description = assignment.problem_description.trim();
        }
      }
    }
  }
);

export default Assignment;