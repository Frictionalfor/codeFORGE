import { Request, Response, NextFunction } from 'express';
export interface ErrorResponse {
    error: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    statusCode: number;
}
export declare class ApiError extends Error {
    statusCode: number;
    details?: any;
    constructor(statusCode: number, message: string, details?: any);
}
export declare const createValidationError: (message: string, details?: any) => ApiError;
export declare const createAuthError: (message?: string) => ApiError;
export declare const createForbiddenError: (message?: string) => ApiError;
export declare const createNotFoundError: (resource?: string) => ApiError;
export declare const createConflictError: (message: string) => ApiError;
export declare const createInternalError: (message?: string) => ApiError;
export declare const errorHandler: (error: any, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map