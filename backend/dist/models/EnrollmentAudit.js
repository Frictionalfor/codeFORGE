"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentAudit = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class EnrollmentAudit extends sequelize_1.Model {
}
exports.EnrollmentAudit = EnrollmentAudit;
EnrollmentAudit.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    enrollment_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'enrollments',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    action: {
        type: sequelize_1.DataTypes.STRING(50),
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
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 1000],
                msg: 'Reason must not exceed 1000 characters'
            }
        }
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: database_1.sequelize,
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
        beforeValidate: (audit) => {
            if (audit.reason) {
                audit.reason = audit.reason.trim();
            }
        }
    }
});
exports.default = EnrollmentAudit;
//# sourceMappingURL=EnrollmentAudit.js.map