"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Enrollment extends sequelize_1.Model {
}
exports.Enrollment = Enrollment;
Enrollment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    student_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    class_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'classes',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'pending', 'suspended', 'withdrawn'),
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
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    enrolled_by: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    withdrawn_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    withdrawn_by: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }
}, {
    sequelize: database_1.sequelize,
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
});
exports.default = Enrollment;
//# sourceMappingURL=Enrollment.js.map