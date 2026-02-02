"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
async function addFirebaseFields() {
    const queryInterface = database_1.sequelize.getQueryInterface();
    try {
        console.log('Starting Firebase fields migration...');
        const tableDescription = await queryInterface.describeTable('users');
        if (!tableDescription['firebaseUid']) {
            console.log('Adding firebaseUid column...');
            await queryInterface.addColumn('users', 'firebaseUid', {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true
            });
        }
        else {
            console.log('firebaseUid column already exists');
        }
        if (!tableDescription['email_verified']) {
            console.log('Adding email_verified column...');
            await queryInterface.addColumn('users', 'email_verified', {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            });
        }
        else {
            console.log('email_verified column already exists');
        }
        if (!tableDescription['migrated_from']) {
            console.log('Adding migrated_from column...');
            await queryInterface.addColumn('users', 'migrated_from', {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true
            });
        }
        else {
            console.log('migrated_from column already exists');
        }
        if (tableDescription['password_hash'] && tableDescription['password_hash'].allowNull === false) {
            console.log('Making password_hash nullable...');
            await queryInterface.changeColumn('users', 'password_hash', {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true
            });
        }
        else {
            console.log('password_hash is already nullable or does not exist');
        }
        try {
            console.log('Adding firebaseUid index...');
            await queryInterface.addIndex('users', ['firebaseUid'], {
                unique: true,
                name: 'users_firebase_uid_unique',
                where: {
                    firebaseUid: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            });
        }
        catch (error) {
            console.log('firebaseUid index may already exist:', error?.message || 'Unknown error');
        }
        try {
            console.log('Adding email_verified index...');
            await queryInterface.addIndex('users', ['email_verified'], {
                name: 'users_email_verified_idx'
            });
        }
        catch (error) {
            console.log('email_verified index may already exist:', error?.message || 'Unknown error');
        }
        console.log('Firebase fields migration completed successfully!');
    }
    catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}
if (require.main === module) {
    addFirebaseFields()
        .then(() => {
        console.log('Migration completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
}
exports.default = addFirebaseFields;
//# sourceMappingURL=addFirebaseFields.js.map