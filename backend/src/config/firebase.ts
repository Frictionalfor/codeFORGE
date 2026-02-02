import admin from 'firebase-admin';

interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private initialized = false;

  private constructor() {}

  static getInstance(): FirebaseAdmin {
    if (!FirebaseAdmin.instance) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }
    return FirebaseAdmin.instance;
  }

  initialize(config?: FirebaseConfig): void {
    if (this.initialized) {
      return;
    }

    try {
      if (config) {
        // Use provided config (for production)
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.projectId,
            privateKey: config.privateKey.replace(/\\n/g, '\n'),
            clientEmail: config.clientEmail,
          }),
          projectId: config.projectId,
        });
      } else {
        // Use environment variables or default credentials
        const projectId = process.env['FIREBASE_PROJECT_ID'];
        const privateKey = process.env['FIREBASE_PRIVATE_KEY'];
        const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];

        if (projectId && privateKey && clientEmail) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey: privateKey.replace(/\\n/g, '\n'),
              clientEmail,
            }),
            projectId,
          });
        } else {
          // Use default credentials (for development with service account file)
          admin.initializeApp();
        }
      }

      this.initialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      throw error;
    }
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.initialized) {
      // Development mode - return mock token
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
        } as admin.auth.DecodedIdToken;
      }
      throw new Error('Firebase Admin SDK not initialized');
    }

    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  }

  getAuth() {
    if (!this.initialized) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return admin.auth();
  }
}

export default FirebaseAdmin;