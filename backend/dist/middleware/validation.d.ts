import { Request, Response, NextFunction } from 'express';
export interface ValidationSchema {
    [key: string]: {
        required?: boolean;
        type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: RegExp;
        custom?: (_value: any) => boolean | string;
    };
}
export declare const validateBody: (schema: ValidationSchema) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: ValidationSchema) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const commonSchemas: {
    uuid: {
        pattern: RegExp;
    };
    email: {
        pattern: RegExp;
    };
    userRegistration: {
        email: {
            required: boolean;
            type: "string";
            pattern: RegExp;
            maxLength: number;
        };
        password: {
            required: boolean;
            type: "string";
            minLength: number;
            maxLength: number;
        };
        name: {
            required: boolean;
            type: "string";
            minLength: number;
            maxLength: number;
            custom: (value: string) => true | "Name must contain at least 2 non-whitespace characters";
        };
        role: {
            required: boolean;
            type: "string";
            custom: (value: string) => true | "Role must be either teacher or student";
        };
    };
    userLogin: {
        email: {
            required: boolean;
            type: "string";
            pattern: RegExp;
        };
        password: {
            required: boolean;
            type: "string";
            minLength: number;
        };
    };
    classCreation: {
        name: {
            required: boolean;
            type: "string";
            minLength: number;
            maxLength: number;
            custom: (value: string) => true | "Class name cannot be empty";
        };
        description: {
            required: boolean;
            type: "string";
            minLength: number;
            maxLength: number;
            custom: (value: string) => true | "Description cannot be empty";
        };
    };
    assignmentCreation: {
        title: {
            required: boolean;
            type: "string";
            minLength: number;
            maxLength: number;
            custom: (value: string) => true | "Title cannot be empty";
        };
        description: {
            required: boolean;
            type: "string";
            minLength: number;
            maxLength: number;
            custom: (value: string) => true | "Description cannot be empty";
        };
    };
    codeSubmission: {
        code: {
            required: boolean;
            type: "string";
            maxLength: number;
        };
    };
};
//# sourceMappingURL=validation.d.ts.map