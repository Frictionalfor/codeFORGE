"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionResult = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ExecutionResult extends sequelize_1.Model {
}
exports.ExecutionResult = ExecutionResult;
ExecutionResult.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    submission_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'submissions',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    test_case_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'test_cases',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'running', 'passed', 'failed', 'timeout', 'memory_exceeded', 'runtime_error', 'compilation_error'),
        allowNull: false,
        defaultValue: 'pending'
    },
    actual_output: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    error_message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    execution_time: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: {
                args: [0],
                msg: 'Execution time must be non-negative'
            }
        }
    },
    memory_used: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        validate: {
            min: {
                args: [0],
                msg: 'Memory used must be non-negative'
            }
        }
    },
    points_earned: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Points earned must be non-negative'
            }
        }
    },
    created_at: {
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
    modelName: 'ExecutionResult',
    tableName: 'execution_results',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['submission_id', 'test_case_id'],
            name: 'execution_results_submission_testcase_unique'
        },
        {
            fields: ['submission_id']
        },
        {
            fields: ['test_case_id']
        },
        {
            fields: ['status']
        }
    ]
});
exports.default = ExecutionResult;
//# sourceMappingURL=ExecutionResult.js.map