import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            firebaseUser?: {
                uid: string;
                email?: string | undefined;
                emailVerified: boolean;
                displayName?: string | undefined;
                role?: 'teacher' | 'student';
                profile?: any;
            } | undefined;
        }
    }
}
declare class FirebaseAuthMiddleware {
    private firebaseAdmin;
    constructor();
    private extractToken;
    verifyToken(req: Request, _res: Response, next: NextFunction): Promise<void>;
    requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
    requireAuthWithUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    requireRole(role: string): (req: Request, res: Response, next: NextFunction) => Promise<void>;
    requireEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const authMiddleware: FirebaseAuthMiddleware;
export declare const verifyToken: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAuthWithUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (role: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireEmailVerification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default authMiddleware;
//# sourceMappingURL=firebaseAuth.d.ts.map