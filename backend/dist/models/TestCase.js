"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCase = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class TestCase extends sequelize_1.Model {
}
exports.TestCase = TestCase;
TestCase.init({
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
    input: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: {
                args: [0, 10000],
                msg: 'Input must be less than 10000 characters'
            }
        }
    },
    expected_output: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: {
                args: [0, 10000],
                msg: 'Expected output must be less than 10000 characters'
            }
        }
    },
    is_hidden: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    points: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: {
                args: [0],
                msg: 'Points must be non-negative'
            },
            max: {
                args: [100],
                msg: 'Points must be 100 or less'
            }
        }
    },
    time_limit: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5000,
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
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 128,
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
    modelName: 'TestCase',
    tableName: 'test_cases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['assignment_id']
        },
        {
            fields: ['assignment_id', 'is_hidden']
        }
    ]
});
exports.default = TestCase;
//# sourceMappingURL=TestCase.js.map