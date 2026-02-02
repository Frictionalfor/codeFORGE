import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Enrollment attributes interface
export interface EnrollmentAttributes {
  id: string;
  student_id: string;
  class_id: string;
  status: 'active' | 'pending' | 'suspended' | 'withdrawn';
  enrolled_at: Date;
  enrolled_by: string | null;
  withdrawn_at: Date | null;
  withdrawn_by: string | null;
}

// Optional attributes for creation (auto-generated fields)
export interface EnrollmentCreationAttributes extends Optional<EnrollmentAttributes, 'id' | 'status' | 'enrolled_at' | 'enrolled_by' | 'withdrawn_at' | 'withdrawn_by'> {}

// Enrollment model class
export class Enrollment extends Model<EnrollmentAttributes, EnrollmentCreationAttributes> implements EnrollmentAttributes {
  public id!: string;
  public student_id!: string;
  public class_id!: string;
  public status!: 'active' | 'pending' | 'suspended' | 'withdrawn';
  public enrolled_at!: Date;
  public enrolled_by!: string | null;
  public withdrawn_at!: Date | null;
  public withdrawn_by!: string | null;

  // Associations (will be populated by associations)
  public student?: any;
  public class?: any;
}

// Initialize Enrollment model
Enrollment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
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
    status: {
      type: DataTypes.ENUM('active', 'pending', 'suspended', 'withdrawn'),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'pending', 'suspended', 'withdrawn']],
          msg: 'Status must be active, pending, suspended, or withdrawn'
        }
      }
    },
    enrolled_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    enrolled_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    withdrawn_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    withdrawn_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  },
  {
    sequelize,
    modelName: 'Enrollment',
    tableName: 'enrollments',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'class_id'],
        name: 'enrollments_student_class_unique'
      },
      {
        fields: ['student_id']
      },
      {
        fields: ['class_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['enrolled_at']
      }
    ]
  }
);

export default Enrollment;