"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Submission extends sequelize_1.Model {
}
exports.Submission = Submission;
Submission.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    assignment_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'assignments',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    code: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: {
                args: [0, 50000],
                msg: 'Code must be less than 50000 characters'
            }
        }
    },
    language: {
        type: sequelize_1.DataTypes.ENUM('c', 'cpp', 'java', 'python', 'javascript'),
        allowNull: false,
        defaultValue: 'c'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
    },
    total_points: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    points_earned: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    compilation_error: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    submitted_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: database_1.sequelize,
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
});
exports.default = Submission;
//# sourceMappingURL=Submission.js.map