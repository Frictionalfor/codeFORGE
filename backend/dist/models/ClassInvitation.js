"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassInvitation = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const crypto_1 = __importDefault(require("crypto"));
class ClassInvitation extends sequelize_1.Model {
}
exports.ClassInvitation = ClassInvitation;
const generateInvitationToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
ClassInvitation.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
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
    invited_by: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
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
        type: sequelize_1.DataTypes.STRING(64),
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
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            isAfter: {
                args: new Date().toISOString(),
                msg: 'Expiration date must be in the future'
            }
        }
    },
    used_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    used_by: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: database_1.sequelize,
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
        beforeValidate: (invitation) => {
            if (invitation.email) {
                invitation.email = invitation.email.trim().toLowerCase();
            }
        },
        beforeCreate: (invitation) => {
            if (!invitation.token) {
                invitation.token = generateInvitationToken();
            }
            if (!invitation.expires_at) {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);
                invitation.expires_at = expiresAt;
            }
        }
    }
});
exports.default = ClassInvitation;
//# sourceMappingURL=ClassInvitation.js.map