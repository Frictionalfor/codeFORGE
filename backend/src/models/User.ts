import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../config/database';

// User attributes interface
export interface UserAttributes {
  id: string;
  firebaseUid?: string; // Firebase UID for new authentication system
  email: string;
  password_hash?: string; // Optional for Firebase users
  name: string;
  role: 'teacher' | 'student';
  emailVerified: boolean; // Track email verification status
  bio?: string;
  institution?: string;
  major?: string;
  year?: string;
  migratedFrom?: string; // Legacy user ID if migrated
  created_at: Date;
  updated_at: Date;
}

// Optional attributes for creation (auto-generated fields)
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'password_hash' | 'emailVerified' | 'created_at' | 'updated_at'> {}

// User model class
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public firebaseUid?: string;
  public email!: string;
  public password_hash?: string;
  public name!: string;
  public role!: 'teacher' | 'student';
  public emailVerified!: boolean;
  public bio?: string;
  public institution?: string;
  public major?: string;
  public year?: string;
  public migratedFrom?: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations (will be defined when other models are created)
  public classes?: any[];
  public enrollments?: any[];
  public submissions?: any[];

  // Instance methods
  public override toJSON(): Omit<UserAttributes, 'password_hash'> {
    const values = { ...this.get() } as any;
    delete values.password_hash;
    return values;
  }
}

// Initialize User model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    firebaseUid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: {
        name: 'users_firebase_uid_unique',
        msg: 'Firebase UID is already registered'
      },
      validate: {
        len: {
          args: [1, 255],
          msg: 'Firebase UID must be between 1 and 255 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Email address is already registered'
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        },
        len: {
          args: [1, 255],
          msg: 'Email must be between 1 and 255 characters'
        }
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true, // Optional for Firebase users
      validate: {
        len: {
          args: [0, 255],
          msg: 'Password hash must be less than 255 characters'
        }
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Name must be between 1 and 255 characters'
        },
        notEmpty: {
          msg: 'Name cannot be empty'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('teacher', 'student'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['teacher', 'student']],
          msg: 'Role must be either teacher or student'
        }
      }
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'email_verified'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Bio must be less than 1000 characters'
        }
      }
    },
    institution: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'Institution must be less than 255 characters'
        }
      }
    },
    major: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'Major must be less than 255 characters'
        }
      }
    },
    year: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'Year must be less than 50 characters'
        }
      }
    },
    migratedFrom: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'migrated_from',
      validate: {
        len: {
          args: [0, 255],
          msg: 'Migrated from field must be less than 255 characters'
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['firebaseUid'],
        where: {
          firebaseUid: {
            [Op.ne]: null
          }
        }
      },
      {
        fields: ['role']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['email_verified']
      }
    ],
    hooks: {
      beforeValidate: (user: User) => {
        // Trim whitespace from string fields
        if (user.email) {
          user.email = user.email.trim().toLowerCase();
        }
        if (user.name) {
          user.name = user.name.trim();
        }
        if (user.bio) {
          user.bio = user.bio.trim();
        }
        if (user.institution) {
          user.institution = user.institution.trim();
        }
        if (user.major) {
          user.major = user.major.trim();
        }
        if (user.year) {
          user.year = user.year.trim();
        }
        if (user.migratedFrom) {
          user.migratedFrom = user.migratedFrom.trim();
        }
      }
    }
  }
);

export default User;