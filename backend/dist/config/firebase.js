"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
class FirebaseAdmin {
    constructor() {
        this.initialized = false;
    }
    static getInstance() {
        if (!FirebaseAdmin.instance) {
            FirebaseAdmin.instance = new FirebaseAdmin();
        }
        return FirebaseAdmin.instance;
    }
    initialize(config) {
        if (this.initialized) {
            return;
        }
        try {
            if (config) {
                firebase_admin_1.default.initializeApp({
                    credential: firebase_admin_1.default.credential.cert({
                        projectId: config.projectId,
                        privateKey: config.privateKey.replace(/\\n/g, '\n'),
                        clientEmail: config.clientEmail,
                    }),
                    projectId: config.projectId,
                });
            }
            else {
                const projectId = process.env['FIREBASE_PROJECT_ID'];
                const privateKey = process.env['FIREBASE_PRIVATE_KEY'];
                const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
                if (projectId && privateKey && clientEmail) {
                    firebase_admin_1.default.initializeApp({
                        credential: firebase_admin_1.default.credential.cert({
                            projectId,
                            privateKey: privateKey.replace(/\\n/g, '\n'),
                            clientEmail,
                        }),
                        projectId,
                    });
                }
                else {
                    firebase_admin_1.default.initializeApp();
                }
            }
            this.initialized = true;
            console.log('Firebase Admin SDK initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize Firebase Admin SDK:', error);
            throw error;
        }
    }
    async verifyIdToken(token) {
        if (!this.initialized) {
            if (process.env['NODE_ENV'] === 'development' && process.env['DEV_MODE'] === 'true') {
                return {
                    uid: 'dev-user-123',
                    email: 'dev@example.com',
                    email_verified: true,
                    iss: 'dev',
                    aud: 'dev',
                    auth_time: Date.now() / 1000,
                    iat: Date.now() / 1000,
                    exp: Date.now() / 1000 + 3600,
                    sub: 'dev-user-123'
                };
            }
            throw new Error('Firebase Admin SDK not initialized');
        }
        try {
            return await firebase_admin_1.default.auth().verifyIdToken(token);
        }
        catch (error) {
            console.error('Token verification failed:', error);
            throw error;
        }
    }
    getAuth() {
        if (!this.initialized) {
            throw new Error('Firebase Admin SDK not initialized');
        }
        return firebase_admin_1.default.auth();
    }
}
exports.default = FirebaseAdmin;
//# sourceMappingURL=firebase.js.map