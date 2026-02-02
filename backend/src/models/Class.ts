import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Utility function to generate unique join code
const generateJoinCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Class attributes interface
export interface ClassAttributes {
  id: string;
  teacher_id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private';
  join_code: string;
  max_students: number | null;
  is_active: boolean;
  join_method: 'code' | 'approval' | 'invitation';
  created_at: Date;
  updated_at: Date;
}

// Optional attributes for creation (auto-generated fields)
export interface ClassCreationAttributes extends Optional<ClassAttributes, 'id' | 'visibility' | 'join_code' | 'max_students' | 'is_active' | 'join_method' | 'created_at' | 'updated_at'> {}

// Class model class
export class Class extends Model<ClassAttributes, ClassCreationAttributes> implements ClassAttributes {
  public id!: string;
  public teacher_id!: string;
  public name!: string;
  public description!: string;
  public visibility!: 'public' | 'private';
  public join_code!: string;
  public max_students!: number | null;
  public is_active!: boolean;
  public join_method!: 'code' | 'approval' | 'invitation';
  public created_at!: Date;
  public updated_at!: Date;

  // Associations (will be populated by associations)
  public teacher?: any;
  public assignments?: any[];
  public enrollments?: any[];
  public students?: any[];
}

// Initialize Class model
Class.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Class name must be between 1 and 255 characters'
        },
        notEmpty: {
          msg: 'Class name cannot be empty'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [1, 5000],
          msg: 'Description must be between 1 and 5000 characters'
        },
        notEmpty: {
          msg: 'Description cannot be empty'
        }
      }
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private'),
      allowNull: false,
      defaultValue: 'public',
      validate: {
        isIn: {
          args: [['public', 'private']],
          msg: 'Visibility must be either public or private'
        }
      }
    },
    join_code: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: {
        name: 'classes_join_code_unique',
        msg: 'Join code must be unique'
      },
      validate: {
        len: {
          args: [8, 8],
          msg: 'Join code must be exactly 8 characters'
        },
        isAlphanumeric: {
          msg: 'Join code must contain only letters and numbers'
        }
      }
    },
    max_students: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'Maximum students must be at least 1'
        },
        max: {
          args: [10000],
          msg: 'Maximum students cannot exceed 10,000'
        }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    join_method: {
      type: DataTypes.ENUM('code', 'approval', 'invitation'),
      allowNull: false,
      defaultValue: 'code',
      validate: {
        isIn: {
          args: [['code', 'approval', 'invitation']],
          msg: 'Join method must be code, approval, or invitation'
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
    modelName: 'Class',
    tableName: 'classes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['teacher_id']
      },
      {
        unique: true,
        fields: ['join_code']
      },
      {
        fields: ['visibility', 'is_active']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['name']
      }
    ],
    hooks: {
      beforeValidate: (classInstance: Class) => {
        // Trim whitespace from string fields
        if (classInstance.name) {
          classInstance.name = classInstance.name.trim();
        }
        if (classInstance.description) {
          classInstance.description = classInstance.description.trim();
        }
      },
      beforeCreate: async (classInstance: Class) => {
        // Generate unique join code
        if (!classInstance.join_code) {
          let attempts = 0;
          const maxAttempts = 10;
          
          while (attempts < maxAttempts) {
            const code = generateJoinCode();
            const existing = await Class.findOne({ where: { join_code: code } });
            
            if (!existing) {
              classInstance.join_code = code;
              break;
            }
            attempts++;
          }
          
          if (!classInstance.join_code) {
            throw new Error('Failed to generate unique join code after multiple attempts');
          }
        }
      }
    }
  }
);

export default Class;