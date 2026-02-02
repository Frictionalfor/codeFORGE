import admin from 'firebase-admin';
interface FirebaseConfig {
    projectId: string;
    privateKey: string;
    clientEmail: string;
}
declare class FirebaseAdmin {
    private static instance;
    private initialized;
    private constructor();
    static getInstance(): FirebaseAdmin;
    initialize(config?: FirebaseConfig): void;
    verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken>;
    getAuth(): import("firebase-admin/lib/auth/auth").Auth;
}
export default FirebaseAdmin;
//# sourceMappingURL=firebase.d.ts.map