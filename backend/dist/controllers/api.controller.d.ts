import { Request, Response } from 'express';
export declare function getOrders(_req: Request, res: Response): Promise<void>;
export declare function getOrderDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getPrintJobs(_req: Request, res: Response): Promise<void>;
export declare function getPrinterStatus(_req: Request, res: Response): Promise<void>;
/**
 * Proxy PDF downloads to avoid CORS issues with external URLs
 * GET /api/proxy-pdf?url=https://...
 */
export declare function proxyPdf(req: Request, res: Response): Promise<void>;
/**
 * Clear all orders and print jobs
 * POST /api/clear
 */
export declare function clearAllData(req: Request, res: Response): Promise<void>;
/**
 * Fetch real fulfilled orders from Shopify (not test data)
 * GET /api/fetch-real-orders?limit=10
 */
export declare function fetchRealOrders(req: Request, res: Response): Promise<void>;
/**
 * Print label from URL - downloads PDF and sends to PrintNode
 * POST /api/print-label
 * Body: { labelUrl: string, orderId: string, trackingNumber: string }
 */
export declare function printLabelFromUrl(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=api.controller.d.ts.map