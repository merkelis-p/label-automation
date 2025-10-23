import { Request, Response } from 'express';
/**
 * Test DPD Lithuania label generation
 * POST /api/test/makecommerce/dpd
 */
export declare const testDPDLabel: (req: Request, res: Response) => Promise<void>;
/**
 * Test OMNIVA label generation
 * POST /api/test/makecommerce/omniva
 */
export declare const testOMNIVALabel: (req: Request, res: Response) => Promise<void>;
/**
 * Test both carriers
 * POST /api/test/makecommerce/both
 */
export declare const testBothCarriers: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=makecommerce-test.controller.d.ts.map