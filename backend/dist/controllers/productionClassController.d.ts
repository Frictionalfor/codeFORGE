import { Request, Response } from 'express';
export declare const createClass: (req: Request, res: Response) => Promise<void>;
export declare const getClassByJoinCode: (req: Request, res: Response) => Promise<void>;
export declare const joinClassByCode: (req: Request, res: Response) => Promise<void>;
export declare const getUserClasses: (req: Request, res: Response) => Promise<void>;
export declare const getAvailableClasses: (req: Request, res: Response) => Promise<void>;
export declare const createAssignmentInClass: (req: Request, res: Response) => Promise<void>;
export declare const getClassAssignments: (req: Request, res: Response) => Promise<void>;
export declare const getAssignmentById: (req: Request, res: Response) => Promise<void>;
export declare const submitAssignmentCode: (req: Request, res: Response) => Promise<void>;
export declare const getStudentSubmission: (req: Request, res: Response) => Promise<void>;
export declare const regenerateJoinCode: (req: Request, res: Response) => Promise<void>;
export declare const getAllTeacherSubmissions: (req: Request, res: Response) => Promise<void>;
export declare const getClassStudents: (req: Request, res: Response) => Promise<void>;
export declare const removeStudentFromClass: (req: Request, res: Response) => Promise<void>;
export declare const getClassSubmissions: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=productionClassController.d.ts.map