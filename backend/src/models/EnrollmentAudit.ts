import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// EnrollmentAudit attributes interface
export interface EnrollmentAuditAttributes {
  id: string;
  enrollment_id: string;
  action: string;
  performed_by: string;
  reason: string | null;
  created_at: Date;
}

// Optional attributes for creation (auto-generated fields)
export interface EnrollmentAuditCreationAttributes extends Optional<EnrollmentAuditAttributes, 'id' | 'reason' | 'created_at'> {}

// EnrollmentAudit model class
export class EnrollmentAudit extends Model<EnrollmentAuditAttributes, EnrollmentAuditCreationAttributes> implements EnrollmentAuditAttributes {
  public id!: string;
  public enrollment_id!: string;
  public action!: string;
  public performed_by!: string;
  public reason!: string | null;
  public created_at!: Date;

  // Associations (will be populated by associations)
  public enrollment?: any;
  public performer?: any;
}

// Initialize EnrollmentAudit model
EnrollmentAudit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    enrollment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'enrollments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [['enrolled', 'withdrawn', 'suspended', 'reactivated', 'status_changed']],
          msg: 'Action must be enrolled, withdrawn, suspended, reactivated, or status_changed'
        },
        len: {
          args: [1, 50],
          msg: 'Action must be between 1 and 50 characters'
        }
      }
    },
    performed_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Reason must not exceed 1000 characters'
        }
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'EnrollmentAudit',
    tableName: 'enrollment_audit',
    timestamps: false,
    indexes: [
      {
        fields: ['enrollment_id']
      },
      {
        fields: ['performed_by']
      },
      {
        fields: ['action']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeValidate: (audit: EnrollmentAudit) => {
        // Trim reason if provided
        if (audit.reason) {
          audit.reason = audit.reason.trim();
        }
      }
    }
  }
);

export default EnrollmentAudit;