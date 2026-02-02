"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class User extends sequelize_1.Model {
    toJSON() {
        const values = { ...this.get() };
        delete values.password_hash;
        return values;
    }
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    firebaseUid: {
        type: sequelize_1.DataTypes.STRING(255),
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
        type: sequelize_1.DataTypes.STRING(255),
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
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        validate: {
            len: {
                args: [0, 255],
                msg: 'Password hash must be less than 255 characters'
            }
        }
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
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
        type: sequelize_1.DataTypes.ENUM('teacher', 'student'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['teacher', 'student']],
                msg: 'Role must be either teacher or student'
            }
        }
    },
    emailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'email_verified'
    },
    bio: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 1000],
                msg: 'Bio must be less than 1000 characters'
            }
        }
    },
    institution: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        validate: {
            len: {
                args: [0, 255],
                msg: 'Institution must be less than 255 characters'
            }
        }
    },
    major: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        validate: {
            len: {
                args: [0, 255],
                msg: 'Major must be less than 255 characters'
            }
        }
    },
    year: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        validate: {
            len: {
                args: [0, 50],
                msg: 'Year must be less than 50 characters'
            }
        }
    },
    migratedFrom: {
        type: sequelize_1.DataTypes.STRING(255),
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
                    [sequelize_1.Op.ne]: null
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
        beforeValidate: (user) => {
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
});
exports.default = User;
//# sourceMappingURL=User.js.map