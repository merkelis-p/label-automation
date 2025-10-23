import { Router } from 'express';
import { mockFulfillment, seedTestData, startAutoGenerate, stopAutoGenerate, togglePrinterStatus, mockMakeCommerceLabel, mockPrintNodeJob, } from '../controllers/mock.controller.js';
const router = Router();
// Mock Shopify fulfillment webhook
router.post('/fulfillment', mockFulfillment);
// Seed test data
router.post('/seed', seedTestData);
// Auto-generate orders
router.post('/auto-start', startAutoGenerate);
router.post('/auto-stop', stopAutoGenerate);
// Toggle printer status
router.post('/printer-status', togglePrinterStatus);
// Mock external APIs (for intercepting in dev)
router.post('/makecommerce/labels', mockMakeCommerceLabel);
router.post('/printnode/jobs', mockPrintNodeJob);
export default router;
//# sourceMappingURL=mock.routes.js.map