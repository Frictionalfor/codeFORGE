import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (allowedRoles: ("teacher" | "student")[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireOwnership: (resourceType: "class" | "assignment" | "submission") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateTokens: (user: User) => {
    accessToken: string;
    refreshToken: string;
};
export declare const validateRefreshToken: (refreshToken: string) => Promise<{
    user: User;
    accessToken: string;
} | null>;
//# sourceMappingURL=auth.d.ts.map