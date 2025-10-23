import { Request, Response } from 'express';
export declare function mockFulfillment(req: Request, res: Response): Promise<void>;
export declare function seedTestData(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function startAutoGenerate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function stopAutoGenerate(req: Request, res: Response): Promise<void>;
export declare function togglePrinterStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function processQueuedJobs(): void;
export declare function retryPrintJob(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function mockMakeCommerceLabel(req: Request, res: Response): Promise<void>;
export declare function mockPrintNodeJob(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=mock.controller.d.ts.map