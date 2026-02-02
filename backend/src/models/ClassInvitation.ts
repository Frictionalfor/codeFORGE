import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import crypto from 'crypto';

// ClassInvitation attributes interface
export interface ClassInvitationAttributes {
  id: string;
  class_id: string;
  invited_by: string;
  email: string;
  token: string;
  expires_at: Date;
  used_at: Date | null;
  used_by: string | null;
  created_at: Date;
}

// Optional attributes for creation (auto-generated fields)
export interface ClassInvitationCreationAttributes extends Optional<ClassInvitationAttributes, 'id' | 'token' | 'used_at' | 'used_by' | 'created_at'> {}

// ClassInvitation model class
export class ClassInvitation extends Model<ClassInvitationAttributes, ClassInvitationCreationAttributes> implements ClassInvitationAttributes {
  public id!: string;
  public class_id!: string;
  public invited_by!: string;
  public email!: string;
  public token!: string;
  public expires_at!: Date;
  public used_at!: Date | null;
  public used_by!: string | null;
  public created_at!: Date;

  // Associations (will be populated by associations)
  public class?: any;
  public inviter?: any;
  public user?: any;
}

// Utility function to generate secure invitation token
const generateInvitationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Initialize ClassInvitation model
ClassInvitation.init(
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
    invited_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: {
        name: 'class_invitations_token_unique',
        msg: 'Invitation token must be unique'
      },
      validate: {
        len: {
          args: [64, 64],
          msg: 'Token must be exactly 64 characters'
        }
      }
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfter: {
          args: new Date().toISOString(),
          msg: 'Expiration date must be in the future'
        }
      }
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    used_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'ClassInvitation',
    tableName: 'class_invitations',
    timestamps: false,
    indexes: [
      {
        fields: ['class_id']
      },
      {
        unique: true,
        fields: ['token']
      },
      {
        fields: ['email']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['class_id', 'email'],
        name: 'class_invitations_class_email_idx'
      }
    ],
    hooks: {
      beforeValidate: (invitation: ClassInvitation) => {
        // Normalize email
        if (invitation.email) {
          invitation.email = invitation.email.trim().toLowerCase();
        }
      },
      beforeCreate: (invitation: ClassInvitation) => {
        // Generate secure token
        if (!invitation.token) {
          invitation.token = generateInvitationToken();
        }
        
        // Set default expiration (7 days from now)
        if (!invitation.expires_at) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
          invitation.expires_at = expiresAt;
        }
      }
    }
  }
);

export default ClassInvitation;