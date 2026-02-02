"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const generateJoinCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
class Class extends sequelize_1.Model {
}
exports.Class = Class;
Class.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    teacher_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
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
        type: sequelize_1.DataTypes.TEXT,
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
        type: sequelize_1.DataTypes.ENUM('public', 'private'),
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
        type: sequelize_1.DataTypes.STRING(8),
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
        type: sequelize_1.DataTypes.INTEGER,
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
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    join_method: {
        type: sequelize_1.DataTypes.ENUM('code', 'approval', 'invitation'),
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
        beforeValidate: (classInstance) => {
            if (classInstance.name) {
                classInstance.name = classInstance.name.trim();
            }
            if (classInstance.description) {
                classInstance.description = classInstance.description.trim();
            }
        },
        beforeCreate: async (classInstance) => {
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
});
exports.default = Class;
//# sourceMappingURL=Class.js.map